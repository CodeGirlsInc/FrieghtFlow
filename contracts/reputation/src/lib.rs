#![no_std]

//! Reputation & Rating Contract
//!
//! Tracks on-chain reputation for FreightFlow Carriers and Shippers.
//!
//! ## Score formula (0 – 1000)
//! Three components are computed independently, each capped, then summed
//! and capped at 1000:
//! ```text
//! rating_component     = average_rating                    ← 0-500 (avg stars × 100, both types)
//! rate_component        = type_rate_pct * 3                 ← 0-300
//!                           (on-time %   for carriers,
//!                            success %   for shippers)
//! completion_component = (rating_count / total_completed) * 2  ← 0-200
//!                           (% of completed shipments that received a rating,
//!                            both types)
//! score = rating_component + rate_component + completion_component
//! ```
//! Fixed-point arithmetic: `average_rating` is stored as `score * 100`
//! (i.e. 500 = 5.00 stars, 350 = 3.50 stars), rounded to the nearest
//! integer rather than truncated.
//!
//! ## Known limitation
//! This contract has no visibility into an external shipment contract's
//! records, so it cannot independently verify that `rater`/`rated` in
//! `submit_rating`, or `user` in `update_stats`, were actually the
//! shipper/carrier on `shipment_id`. That trust boundary is enforced by
//! whichever contract is authorized to call `update_stats` (see
//! `AuthorizedContract`); this contract only guarantees each shipment
//! contributes at most one rating per rater and one stats update per user.

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env, Symbol, Vec};

// ── Errors ────────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ReputationError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    UserNotFound = 3,
    UserAlreadyRegistered = 4,
    InvalidScore = 5,
    AlreadyRatedShipment = 6,
    CannotRateSelf = 7,
    Unauthorized = 8,
    UserTypeMismatch = 9,
    RatingNotFound = 10,
    /// `update_stats` was already called for this (shipment_id, user) pair.
    AlreadyRecordedStats = 11,
    /// A counter would have overflowed its integer type.
    ArithmeticOverflow = 12,
}

// ── Types ─────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum UserType {
    Carrier,
    Shipper,
}

/// Reputation profile stored per user address.
#[contracttype]
#[derive(Clone, Debug)]
pub struct Reputation {
    pub user: Address,
    pub user_type: UserType,
    pub total_completed: u32,
    /// Sum of all rating scores × 100 (for fixed-point average).
    pub total_rating_points: u32,
    pub rating_count: u32,
    /// On-time deliveries (carriers only).
    pub on_time_count: u32,
    /// Late deliveries (carriers only).
    pub late_count: u32,
    /// Successful shipments (shippers only).
    pub success_count: u32,
    /// Cancelled shipments (shippers only).
    pub cancel_count: u32,
    /// `total_rating_points / rating_count`, rounded to nearest —
    /// 500 = 5.00 stars.
    pub average_rating: u32,
    pub last_updated: u64,
}

/// A single rating record.
#[contracttype]
#[derive(Clone, Debug)]
pub struct RatingRecord {
    pub id: u64,
    pub shipment_id: u64,
    pub rater: Address,
    pub rated: Address,
    /// Raw score 1-5.
    pub score: u32,
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    AuthorizedContract, // Shipment contract allowed to call update_stats
    RatingCounter,
    Reputation(Address),
    Rating(u64),
    ShipmentRaters(u64),  // Vec<Address> — who has already rated this shipment
    StatsRecorded(u64),   // Vec<Address> — who already had stats recorded for this shipment
}

const TTL_LEDGERS: u32 = 6_307_200; // ~1 year

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {
    // ── Setup ─────────────────────────────────────────────────────────────

    /// One-time initialisation.
    /// `authorized_contract` is the shipment contract address that is allowed
    /// to call `update_stats` without extra auth.
    pub fn initialize(
        env: Env,
        admin: Address,
        authorized_contract: Address,
    ) -> Result<(), ReputationError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(ReputationError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::AuthorizedContract, &authorized_contract);
        env.storage()
            .persistent()
            .set(&DataKey::RatingCounter, &0u64);
        Ok(())
    }

    // ── User registration ─────────────────────────────────────────────────

    /// Register a user.  Called once per address (e.g. at account creation).
    pub fn register_user(
        env: Env,
        user: Address,
        user_type: UserType,
    ) -> Result<(), ReputationError> {
        user.require_auth();

        if env
            .storage()
            .persistent()
            .has(&DataKey::Reputation(user.clone()))
        {
            return Err(ReputationError::UserAlreadyRegistered);
        }

        let rep = Reputation {
            user: user.clone(),
            user_type: user_type.clone(),
            total_completed: 0,
            total_rating_points: 0,
            rating_count: 0,
            on_time_count: 0,
            late_count: 0,
            success_count: 0,
            cancel_count: 0,
            average_rating: 0,
            last_updated: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Reputation(user.clone()), &rep);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Reputation(user.clone()), TTL_LEDGERS, TTL_LEDGERS);

        env.events()
            .publish((Symbol::new(&env, "user_registered"), user), user_type);

        Ok(())
    }

    // ── Rating submission ─────────────────────────────────────────────────

    /// Submit a 1-5 star rating for a completed shipment.
    ///
    /// Rules:
    /// - Score must be 1-5.
    /// - Cannot rate yourself.
    /// - Each address can only rate a given shipment once.
    /// - Both `rater` and `rated` must be registered users, and — since
    ///   ratings only make sense across the shipper/carrier relationship on
    ///   a shipment — must be of *different* user types.
    pub fn submit_rating(
        env: Env,
        rater: Address,
        shipment_id: u64,
        rated: Address,
        score: u32,
    ) -> Result<u64, ReputationError> {
        rater.require_auth();

        if !(1..=5).contains(&score) {
            return Err(ReputationError::InvalidScore);
        }
        if rater == rated {
            return Err(ReputationError::CannotRateSelf);
        }

        // Prevent duplicate ratings per shipment per rater.
        let mut raters: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::ShipmentRaters(shipment_id))
            .unwrap_or_else(|| Vec::new(&env));

        if raters.contains(&rater) {
            return Err(ReputationError::AlreadyRatedShipment);
        }

        // Both parties must be registered...
        let rater_rep: Reputation = env
            .storage()
            .persistent()
            .get(&DataKey::Reputation(rater.clone()))
            .ok_or(ReputationError::UserNotFound)?;

        let mut rated_rep: Reputation = env
            .storage()
            .persistent()
            .get(&DataKey::Reputation(rated.clone()))
            .ok_or(ReputationError::UserNotFound)?;

        // ...and must be on opposite sides of the shipper/carrier
        // relationship — a Carrier rating a Carrier (or Shipper rating a
        // Shipper) doesn't correspond to any real shipment interaction.
        if rater_rep.user_type == rated_rep.user_type {
            return Err(ReputationError::UserTypeMismatch);
        }

        // Record the rating.
        let rating_id = Self::next_rating_id(&env);
        let now = env.ledger().timestamp();

        let record = RatingRecord {
            id: rating_id,
            shipment_id,
            rater: rater.clone(),
            rated: rated.clone(),
            score,
            timestamp: now,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Rating(rating_id), &record);
        env.storage().persistent().extend_ttl(
            &DataKey::Rating(rating_id),
            TTL_LEDGERS,
            TTL_LEDGERS,
        );

        // Mark rater for this shipment.
        raters.push_back(rater);
        env.storage()
            .persistent()
            .set(&DataKey::ShipmentRaters(shipment_id), &raters);

        // Update the rated user's reputation. Checked arithmetic ensures a
        // pathological number of ratings fails loudly instead of silently
        // wrapping the counters.
        let points = score
            .checked_mul(100)
            .ok_or(ReputationError::ArithmeticOverflow)?;
        rated_rep.total_rating_points = rated_rep
            .total_rating_points
            .checked_add(points)
            .ok_or(ReputationError::ArithmeticOverflow)?;
        rated_rep.rating_count = rated_rep
            .rating_count
            .checked_add(1)
            .ok_or(ReputationError::ArithmeticOverflow)?;
        // Round to nearest rather than truncate, e.g. (5+5+4)*100/3 = 466.67 → 467.
        rated_rep.average_rating =
            (rated_rep.total_rating_points + rated_rep.rating_count / 2) / rated_rep.rating_count;
        rated_rep.last_updated = now;

        env.storage()
            .persistent()
            .set(&DataKey::Reputation(rated.clone()), &rated_rep);
        env.storage().persistent().extend_ttl(
            &DataKey::Reputation(rated.clone()),
            TTL_LEDGERS,
            TTL_LEDGERS,
        );

        env.events()
            .publish((Symbol::new(&env, "rating_submitted"), rated), rating_id);

        Ok(rating_id)
    }

    // ── Shipment stats ────────────────────────────────────────────────────

    /// Update shipment completion statistics.
    ///
    /// Only callable by the authorized shipment contract (or admin in tests).
    /// Each `(shipment_id, user)` pair may only be recorded once — a repeated
    /// call for the same shipment/user is rejected rather than double-counted.
    ///
    /// For carriers: `was_on_time` governs punctuality counters.
    /// For shippers: `was_successful` governs completion counters.
    pub fn update_stats(
        env: Env,
        caller: Address,
        user: Address,
        shipment_id: u64,
        was_on_time: bool,
        was_successful: bool,
    ) -> Result<(), ReputationError> {
        caller.require_auth();

        // Only the authorised contract or the admin may call this.
        let auth_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::AuthorizedContract)
            .ok_or(ReputationError::NotInitialized)?;
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(ReputationError::NotInitialized)?;

        if caller != auth_contract && caller != admin {
            return Err(ReputationError::Unauthorized);
        }

        // Prevent the same shipment from inflating a user's stats twice
        // (e.g. a retried or duplicated call from the shipment contract).
        let mut recorded: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::StatsRecorded(shipment_id))
            .unwrap_or_else(|| Vec::new(&env));

        if recorded.contains(&user) {
            return Err(ReputationError::AlreadyRecordedStats);
        }

        let mut rep: Reputation = env
            .storage()
            .persistent()
            .get(&DataKey::Reputation(user.clone()))
            .ok_or(ReputationError::UserNotFound)?;

        rep.total_completed = rep
            .total_completed
            .checked_add(1)
            .ok_or(ReputationError::ArithmeticOverflow)?;

        match rep.user_type {
            UserType::Carrier => {
                if was_on_time {
                    rep.on_time_count = rep
                        .on_time_count
                        .checked_add(1)
                        .ok_or(ReputationError::ArithmeticOverflow)?;
                } else {
                    rep.late_count = rep
                        .late_count
                        .checked_add(1)
                        .ok_or(ReputationError::ArithmeticOverflow)?;
                }
            }
            UserType::Shipper => {
                if was_successful {
                    rep.success_count = rep
                        .success_count
                        .checked_add(1)
                        .ok_or(ReputationError::ArithmeticOverflow)?;
                } else {
                    rep.cancel_count = rep
                        .cancel_count
                        .checked_add(1)
                        .ok_or(ReputationError::ArithmeticOverflow)?;
                }
            }
        }

        rep.last_updated = env.ledger().timestamp();

        env.storage()
            .persistent()
            .set(&DataKey::Reputation(user.clone()), &rep);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Reputation(user.clone()), TTL_LEDGERS, TTL_LEDGERS);

        recorded.push_back(user.clone());
        env.storage()
            .persistent()
            .set(&DataKey::StatsRecorded(shipment_id), &recorded);
        env.storage().persistent().extend_ttl(
            &DataKey::StatsRecorded(shipment_id),
            TTL_LEDGERS,
            TTL_LEDGERS,
        );

        env.events()
            .publish((Symbol::new(&env, "stats_updated"), user), shipment_id);

        Ok(())
    }

    // ── Score calculation ─────────────────────────────────────────────────

    /// Calculate a 0-1000 composite reputation score. See the module-level
    /// doc comment for the exact formula. Capped at 1000.
    pub fn calculate_score(env: Env, user: Address) -> Result<u32, ReputationError> {
        let rep: Reputation = env
            .storage()
            .persistent()
            .get(&DataKey::Reputation(user))
            .ok_or(ReputationError::UserNotFound)?;

        // Rating component: average_rating is already ×100 (500 = 5.00 stars),
        // already in the 0-500 range, but capped defensively.
        let rating_component = rep.average_rating.min(500);

        let rate_component: u32 = if rep.total_completed == 0 {
            0
        } else {
            match rep.user_type {
                UserType::Carrier => {
                    // On-time percentage × 3 → 0-300
                    let pct = (rep.on_time_count as u64 * 100) / rep.total_completed as u64;
                    (pct * 3) as u32
                }
                UserType::Shipper => {
                    // Success percentage × 3 → 0-300
                    let pct = (rep.success_count as u64 * 100) / rep.total_completed as u64;
                    (pct * 3) as u32
                }
            }
        };

        // Completion rate component: how many completed shipments had ratings × 2 → 0-200
        let completion_component: u32 = if rep.total_completed == 0 {
            0
        } else {
            let pct = (rep.rating_count as u64 * 100) / rep.total_completed as u64;
            (pct * 2).min(200) as u32
        };

        Ok((rating_component + rate_component + completion_component).min(1000))
    }

    // ── Queries ───────────────────────────────────────────────────────────

    pub fn get_reputation(env: Env, user: Address) -> Result<Reputation, ReputationError> {
        env.storage()
            .persistent()
            .get(&DataKey::Reputation(user))
            .ok_or(ReputationError::UserNotFound)
    }

    pub fn get_rating(env: Env, rating_id: u64) -> Result<RatingRecord, ReputationError> {
        env.storage()
            .persistent()
            .get(&DataKey::Rating(rating_id))
            .ok_or(ReputationError::RatingNotFound)
    }

    pub fn has_rated_shipment(env: Env, shipment_id: u64, rater: Address) -> bool {
        env.storage()
            .persistent()
            .get::<DataKey, Vec<Address>>(&DataKey::ShipmentRaters(shipment_id))
            .map(|raters| raters.contains(&rater))
            .unwrap_or(false)
    }

    /// Whether `update_stats` has already been recorded for `user` on
    /// `shipment_id` (mirrors `has_rated_shipment` for the stats side).
    pub fn has_recorded_stats(env: Env, shipment_id: u64, user: Address) -> bool {
        env.storage()
            .persistent()
            .get::<DataKey, Vec<Address>>(&DataKey::StatsRecorded(shipment_id))
            .map(|recorded| recorded.contains(&user))
            .unwrap_or(false)
    }

    pub fn get_total_ratings(env: Env) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::RatingCounter)
            .unwrap_or(0)
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    fn next_rating_id(env: &Env) -> u64 {
        let current: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::RatingCounter)
            .unwrap_or(0);
        let next = current + 1;
        env.storage()
            .persistent()
            .set(&DataKey::RatingCounter, &next);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::RatingCounter, TTL_LEDGERS, TTL_LEDGERS);
        next
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    fn setup() -> (Env, Address, Address, ReputationContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let auth_contract = Address::generate(&env); // simulates shipment contract
        let contract_id = env.register(ReputationContract {}, ());
        let client = ReputationContractClient::new(&env, &contract_id);
        client.initialize(&admin, &auth_contract);

        (env, admin, auth_contract, client)
    }

    #[test]
    fn test_register_user() {
        let (env, _, _, client) = setup();
        let user = Address::generate(&env);

        client.register_user(&user, &UserType::Carrier);

        let rep = client.get_reputation(&user);
        assert_eq!(rep.user, user);
        assert_eq!(rep.user_type, UserType::Carrier);
        assert_eq!(rep.rating_count, 0);
        assert_eq!(rep.average_rating, 0);
    }

    #[test]
    fn test_register_twice_fails() {
        let (env, _, _, client) = setup();
        let user = Address::generate(&env);

        client.register_user(&user, &UserType::Carrier);
        let result = client.try_register_user(&user, &UserType::Carrier);
        assert_eq!(result, Err(Ok(ReputationError::UserAlreadyRegistered)));
    }

    #[test]
    fn test_submit_rating_and_average() {
        let (env, _, _, client) = setup();
        let rater1 = Address::generate(&env);
        let rater2 = Address::generate(&env);
        let rater3 = Address::generate(&env);
        let carrier = Address::generate(&env);

        client.register_user(&rater1, &UserType::Shipper);
        client.register_user(&rater2, &UserType::Shipper);
        client.register_user(&rater3, &UserType::Shipper);
        client.register_user(&carrier, &UserType::Carrier);

        // Shipment 1: score 5
        client.submit_rating(&rater1, &1u64, &carrier, &5u32);
        // Shipment 2: score 4
        client.submit_rating(&rater2, &2u64, &carrier, &4u32);
        // Shipment 3: score 3
        client.submit_rating(&rater3, &3u64, &carrier, &3u32);

        let rep = client.get_reputation(&carrier);
        assert_eq!(rep.rating_count, 3);
        // (5+4+3)*100 / 3 = 400
        assert_eq!(rep.average_rating, 400);
    }

    #[test]
    fn test_average_rating_rounds_to_nearest() {
        let (env, _, _, client) = setup();
        let r1 = Address::generate(&env);
        let r2 = Address::generate(&env);
        let r3 = Address::generate(&env);
        let carrier = Address::generate(&env);
        client.register_user(&r1, &UserType::Shipper);
        client.register_user(&r2, &UserType::Shipper);
        client.register_user(&r3, &UserType::Shipper);
        client.register_user(&carrier, &UserType::Carrier);

        // (5 + 5 + 4) * 100 / 3 = 466.67 → rounds to 467, not truncates to 466.
        client.submit_rating(&r1, &1u64, &carrier, &5u32);
        client.submit_rating(&r2, &2u64, &carrier, &5u32);
        client.submit_rating(&r3, &3u64, &carrier, &4u32);

        let rep = client.get_reputation(&carrier);
        assert_eq!(rep.average_rating, 467);
    }

    #[test]
    fn test_cannot_rate_self() {
        let (env, _, _, client) = setup();
        let user = Address::generate(&env);
        client.register_user(&user, &UserType::Carrier);

        let result = client.try_submit_rating(&user, &1u64, &user, &5u32);
        assert_eq!(result, Err(Ok(ReputationError::CannotRateSelf)));
    }

    #[test]
    fn test_invalid_score() {
        let (env, _, _, client) = setup();
        let rater = Address::generate(&env);
        let rated = Address::generate(&env);
        client.register_user(&rater, &UserType::Shipper);
        client.register_user(&rated, &UserType::Carrier);

        assert_eq!(
            client.try_submit_rating(&rater, &1u64, &rated, &0u32),
            Err(Ok(ReputationError::InvalidScore))
        );
        assert_eq!(
            client.try_submit_rating(&rater, &1u64, &rated, &6u32),
            Err(Ok(ReputationError::InvalidScore))
        );
    }

    #[test]
    fn test_duplicate_rating_fails() {
        let (env, _, _, client) = setup();
        let rater = Address::generate(&env);
        let rated = Address::generate(&env);
        client.register_user(&rater, &UserType::Shipper);
        client.register_user(&rated, &UserType::Carrier);

        client.submit_rating(&rater, &1u64, &rated, &5u32);
        let result = client.try_submit_rating(&rater, &1u64, &rated, &4u32);
        assert_eq!(result, Err(Ok(ReputationError::AlreadyRatedShipment)));
    }

    #[test]
    fn test_unregistered_rater_rejected() {
        let (env, _, _, client) = setup();
        let rater = Address::generate(&env); // never registered
        let rated = Address::generate(&env);
        client.register_user(&rated, &UserType::Carrier);

        let result = client.try_submit_rating(&rater, &1u64, &rated, &5u32);
        assert_eq!(result, Err(Ok(ReputationError::UserNotFound)));
    }

    #[test]
    fn test_rating_same_user_type_rejected() {
        let (env, _, _, client) = setup();
        let rater = Address::generate(&env);
        let rated = Address::generate(&env);
        client.register_user(&rater, &UserType::Carrier);
        client.register_user(&rated, &UserType::Carrier);

        let result = client.try_submit_rating(&rater, &1u64, &rated, &5u32);
        assert_eq!(result, Err(Ok(ReputationError::UserTypeMismatch)));
    }

    #[test]
    fn test_update_stats_carrier() {
        let (env, _, auth_contract, client) = setup();
        let carrier = Address::generate(&env);
        client.register_user(&carrier, &UserType::Carrier);

        client.update_stats(&auth_contract, &carrier, &1u64, &true, &false); // on-time
        client.update_stats(&auth_contract, &carrier, &2u64, &true, &false); // on-time
        client.update_stats(&auth_contract, &carrier, &3u64, &false, &false); // late

        let rep = client.get_reputation(&carrier);
        assert_eq!(rep.total_completed, 3);
        assert_eq!(rep.on_time_count, 2);
        assert_eq!(rep.late_count, 1);
    }

    #[test]
    fn test_update_stats_shipper() {
        let (env, _, auth_contract, client) = setup();
        let shipper = Address::generate(&env);
        client.register_user(&shipper, &UserType::Shipper);

        client.update_stats(&auth_contract, &shipper, &1u64, &false, &true); // success
        client.update_stats(&auth_contract, &shipper, &2u64, &false, &false); // cancelled

        let rep = client.get_reputation(&shipper);
        assert_eq!(rep.total_completed, 2);
        assert_eq!(rep.success_count, 1);
        assert_eq!(rep.cancel_count, 1);
    }

    #[test]
    fn test_unauthorized_update_stats_fails() {
        let (env, _, _, client) = setup();
        let random = Address::generate(&env);
        let carrier = Address::generate(&env);
        client.register_user(&carrier, &UserType::Carrier);

        let result = client.try_update_stats(&random, &carrier, &1u64, &true, &false);
        assert_eq!(result, Err(Ok(ReputationError::Unauthorized)));
    }

    #[test]
    fn test_duplicate_stats_update_for_same_shipment_fails() {
        let (env, _, auth_contract, client) = setup();
        let carrier = Address::generate(&env);
        client.register_user(&carrier, &UserType::Carrier);

        client.update_stats(&auth_contract, &carrier, &1u64, &true, &false);
        let result = client.try_update_stats(&auth_contract, &carrier, &1u64, &true, &false);
        assert_eq!(result, Err(Ok(ReputationError::AlreadyRecordedStats)));

        // Confirm the second (rejected) call didn't sneak in a double-count.
        let rep = client.get_reputation(&carrier);
        assert_eq!(rep.total_completed, 1);
    }

    #[test]
    fn test_has_recorded_stats() {
        let (env, _, auth_contract, client) = setup();
        let carrier = Address::generate(&env);
        client.register_user(&carrier, &UserType::Carrier);

        assert!(!client.has_recorded_stats(&1u64, &carrier));
        client.update_stats(&auth_contract, &carrier, &1u64, &true, &false);
        assert!(client.has_recorded_stats(&1u64, &carrier));
    }

    #[test]
    fn test_calculate_score_perfect_carrier() {
        let (env, _, auth_contract, client) = setup();
        let rater = Address::generate(&env);
        let carrier = Address::generate(&env);
        client.register_user(&rater, &UserType::Shipper);
        client.register_user(&carrier, &UserType::Carrier);

        // 5-star rating
        client.submit_rating(&rater, &1u64, &carrier, &5u32);
        // Perfect on-time record
        client.update_stats(&auth_contract, &carrier, &1u64, &true, &false);

        let score = client.calculate_score(&carrier);
        // avg_rating = 500 (5 stars × 100), on_time_pct = 100%, rating/completed = 100%
        // rating_component = 500, rate_component = 300, completion_component = 200
        // total = 1000
        assert_eq!(score, 1000);
    }

    #[test]
    fn test_calculate_score_new_user() {
        let (env, _, _, client) = setup();
        let user = Address::generate(&env);
        client.register_user(&user, &UserType::Carrier);

        let score = client.calculate_score(&user);
        assert_eq!(score, 0); // no data yet
    }

    #[test]
    fn test_has_rated_shipment() {
        let (env, _, _, client) = setup();
        let rater = Address::generate(&env);
        let rated = Address::generate(&env);
        client.register_user(&rater, &UserType::Shipper);
        client.register_user(&rated, &UserType::Carrier);

        assert!(!client.has_rated_shipment(&1u64, &rater));
        client.submit_rating(&rater, &1u64, &rated, &4u32);
        assert!(client.has_rated_shipment(&1u64, &rater));
    }

    #[test]
    fn test_get_rating() {
        let (env, _, _, client) = setup();
        let rater = Address::generate(&env);
        let rated = Address::generate(&env);
        client.register_user(&rater, &UserType::Shipper);
        client.register_user(&rated, &UserType::Carrier);

        let rating_id = client.submit_rating(&rater, &5u64, &rated, &4u32);
        let record = client.get_rating(&rating_id);

        assert_eq!(record.shipment_id, 5);
        assert_eq!(record.rater, rater);
        assert_eq!(record.rated, rated);
        assert_eq!(record.score, 4);
    }

    #[test]
    fn test_total_ratings_counter() {
        let (env, _, _, client) = setup();
        let rater1 = Address::generate(&env);
        let rater2 = Address::generate(&env);
        let rated = Address::generate(&env);
        client.register_user(&rater1, &UserType::Shipper);
        client.register_user(&rater2, &UserType::Shipper);
        client.register_user(&rated, &UserType::Carrier);

        assert_eq!(client.get_total_ratings(), 0);
        client.submit_rating(&rater1, &1u64, &rated, &5u32);
        client.submit_rating(&rater2, &2u64, &rated, &3u32);
        assert_eq!(client.get_total_ratings(), 2);
    }
}