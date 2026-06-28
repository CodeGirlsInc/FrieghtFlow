#![no_std]

//! Reputation & Rating Contract
//!
//! Tracks on-chain reputation for FreightFlow Carriers and Shippers.
//!
//! ## Score formula (0 – 1000)
//! ```
//! score = (avg_rating / 5 * 500)          ← 0-500  rating component
//!       + (on_time_pct * 3)               ← 0-300  punctuality  (carriers only)
//!       + (completion_rate * 2)           ← 0-200  reliability  (shippers only)
//! ```
//! Fixed-point arithmetic: `average_rating` is stored as `score * 100`
//! (i.e. 500 = 5.00 stars, 350 = 3.50 stars).

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env, Vec};

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
    /// `total_rating_points / rating_count` — 500 = 5.00 stars.
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
    ShipmentRaters(u64), // Vec<Address> — who has already rated this shipment
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
            user_type,
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
            .extend_ttl(&DataKey::Reputation(user), TTL_LEDGERS, TTL_LEDGERS);

        Ok(())
    }

    // ── Rating submission ─────────────────────────────────────────────────

    /// Submit a 1-5 star rating for a completed shipment.
    ///
    /// Rules:
    /// - Score must be 1-5.
    /// - Cannot rate yourself.
    /// - Each address can only rate a given shipment once.
    /// - `rated` must be a registered user (or admin auto-registers them).
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

        // The rated user must be registered.
        if !env
            .storage()
            .persistent()
            .has(&DataKey::Reputation(rated.clone()))
        {
            return Err(ReputationError::UserNotFound);
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

        // Update the rated user's reputation.
        let mut rep: Reputation = env
            .storage()
            .persistent()
            .get(&DataKey::Reputation(rated.clone()))
            .ok_or(ReputationError::UserNotFound)?;

        rep.total_rating_points += score * 100;
        rep.rating_count += 1;
        rep.average_rating = rep.total_rating_points / rep.rating_count;
        rep.last_updated = now;

        env.storage()
            .persistent()
            .set(&DataKey::Reputation(rated.clone()), &rep);
        env.storage().persistent().extend_ttl(
            &DataKey::Reputation(rated),
            TTL_LEDGERS,
            TTL_LEDGERS,
        );

        Ok(rating_id)
    }

    // ── Shipment stats ────────────────────────────────────────────────────

    /// Update shipment completion statistics.
    ///
    /// Only callable by the authorized shipment contract (or admin in tests).
    ///
    /// For carriers: `was_on_time` governs punctuality counters.
    /// For shippers: `was_successful` governs completion counters.
    pub fn update_stats(
        env: Env,
        caller: Address,
        user: Address,
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

        let mut rep: Reputation = env
            .storage()
            .persistent()
            .get(&DataKey::Reputation(user.clone()))
            .ok_or(ReputationError::UserNotFound)?;

        rep.total_completed += 1;

        match rep.user_type {
            UserType::Carrier => {
                if was_on_time {
                    rep.on_time_count += 1;
                } else {
                    rep.late_count += 1;
                }
            }
            UserType::Shipper => {
                if was_successful {
                    rep.success_count += 1;
                } else {
                    rep.cancel_count += 1;
                }
            }
        }

        rep.last_updated = env.ledger().timestamp();

        env.storage()
            .persistent()
            .set(&DataKey::Reputation(user.clone()), &rep);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Reputation(user), TTL_LEDGERS, TTL_LEDGERS);

        Ok(())
    }

    // ── Score calculation ─────────────────────────────────────────────────

    /// Calculate a 0-1000 composite reputation score.
    ///
    /// ```
    /// Carriers:  (avg_rating / 500 * 500) + (on_time_pct * 3)  + (completion_pct * 2)
    /// Shippers:  (avg_rating / 500 * 500) + (completion_pct * 2) + (completion_pct * 3)
    /// ```
    /// Capped at 1000.
    pub fn calculate_score(env: Env, user: Address) -> Result<u32, ReputationError> {
        let rep: Reputation = env
            .storage()
            .persistent()
            .get(&DataKey::Reputation(user))
            .ok_or(ReputationError::UserNotFound)?;

        // Rating component: average_rating is already ×100 (500 = 5.00 stars).
        // Normalise to 0-500: (avg / 500) * 500 = avg (already in range).
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

#[cfg(test)]
mod test;
