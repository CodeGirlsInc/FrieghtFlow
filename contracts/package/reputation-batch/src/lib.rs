#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, BytesN, Env, Vec};

// ── Errors ────────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum BatchRatingError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    BatchLimitExceeded = 3,
    InvalidScore = 4,
    AlreadyRatedShipment = 5,
    UserNotFound = 6,
    EmptyBatch = 7,
}

// ── Types ─────────────────────────────────────────────────────────────────────

const MAX_BATCH_SIZE: u32 = 10;

#[contracttype]
#[derive(Clone, Debug)]
pub struct RatingEntry {
    pub shipment_id: BytesN<32>,
    pub ratee: Address,
    pub score: u32,
    pub timestamp: u64,
}

/// Reputation profile for a ratee.
#[contracttype]
#[derive(Clone, Debug)]
pub struct ReputationProfile {
    pub total_rating_points: u32,
    pub rating_count: u32,
    /// average_rating = total_rating_points / rating_count (score * 100 fixed-point)
    pub average_rating: u32,
}

#[contracttype]
pub enum DataKey {
    Admin,
    /// Reputation profile per ratee address.
    Profile(Address),
    /// Track who has rated a specific shipment: (shipment_id) -> Vec<Address>
    ShipmentRaters(BytesN<32>),
}

const TTL_LEDGERS: u32 = 6_307_200;

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct ReputationBatchContract;

#[contractimpl]
impl ReputationBatchContract {
    /// One-time initialization.
    pub fn initialize(env: Env, admin: Address) -> Result<(), BatchRatingError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(BatchRatingError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        Ok(())
    }

    /// Register a ratee so they can receive ratings.
    pub fn register_ratee(env: Env, ratee: Address) -> Result<(), BatchRatingError> {
        ratee.require_auth();

        let key = DataKey::Profile(ratee);
        if env.storage().persistent().has(&key) {
            return Ok(()); // idempotent
        }

        let profile = ReputationProfile {
            total_rating_points: 0,
            rating_count: 0,
            average_rating: 0,
        };
        env.storage().persistent().set(&key, &profile);
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);
        Ok(())
    }

    /// Submit a batch of ratings. All-or-nothing: if any entry fails validation,
    /// the entire transaction is rolled back (panic via Soroban semantics).
    ///
    /// Validation per entry:
    /// - score must be 1-5
    /// - shipment must not already have a rating from this caller
    /// - ratee must be a registered user
    ///
    /// Max 10 entries per batch.
    pub fn add_ratings_batch(
        env: Env,
        rater: Address,
        ratings: Vec<RatingEntry>,
    ) -> Result<(), BatchRatingError> {
        rater.require_auth();

        let batch_size = ratings.len();
        if batch_size == 0 {
            return Err(BatchRatingError::EmptyBatch);
        }
        if batch_size > MAX_BATCH_SIZE {
            return Err(BatchRatingError::BatchLimitExceeded);
        }

        // Validate ALL entries first (all-or-nothing)
        for i in 0..batch_size {
            let entry = ratings.get(i).unwrap();

            if entry.score < 1 || entry.score > 5 {
                return Err(BatchRatingError::InvalidScore);
            }

            // Check ratee is registered
            if !env
                .storage()
                .persistent()
                .has(&DataKey::Profile(entry.ratee.clone()))
            {
                return Err(BatchRatingError::UserNotFound);
            }

            // Check not already rated
            let raters: Vec<Address> = env
                .storage()
                .persistent()
                .get(&DataKey::ShipmentRaters(entry.shipment_id.clone()))
                .unwrap_or_else(|| Vec::new(&env));

            if raters.contains(&rater) {
                return Err(BatchRatingError::AlreadyRatedShipment);
            }
        }

        // Apply all ratings
        for i in 0..batch_size {
            let entry = ratings.get(i).unwrap();

            // Mark rater for this shipment
            let ship_key = DataKey::ShipmentRaters(entry.shipment_id.clone());
            let mut raters: Vec<Address> = env
                .storage()
                .persistent()
                .get(&ship_key)
                .unwrap_or_else(|| Vec::new(&env));
            raters.push_back(rater.clone());
            env.storage().persistent().set(&ship_key, &raters);
            env.storage()
                .persistent()
                .extend_ttl(&ship_key, TTL_LEDGERS, TTL_LEDGERS);

            // Update ratee's reputation profile
            let profile_key = DataKey::Profile(entry.ratee.clone());
            let mut profile: ReputationProfile = env
                .storage()
                .persistent()
                .get(&profile_key)
                .unwrap();

            profile.total_rating_points += entry.score * 100;
            profile.rating_count += 1;
            profile.average_rating = profile.total_rating_points / profile.rating_count;

            env.storage().persistent().set(&profile_key, &profile);
            env.storage()
                .persistent()
                .extend_ttl(&profile_key, TTL_LEDGERS, TTL_LEDGERS);
        }

        Ok(())
    }

    // ── Queries ───────────────────────────────────────────────────────────

    pub fn get_profile(env: Env, ratee: Address) -> Result<ReputationProfile, BatchRatingError> {
        env.storage()
            .persistent()
            .get(&DataKey::Profile(ratee))
            .ok_or(BatchRatingError::UserNotFound)
    }

    pub fn has_rated_shipment(env: Env, shipment_id: BytesN<32>, rater: Address) -> bool {
        let raters: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::ShipmentRaters(shipment_id))
            .unwrap_or_else(|| Vec::new(&env));
        raters.contains(&rater)
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, BytesN as _},
        Env,
    };

    fn setup() -> (Env, Address, ReputationBatchContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let contract_id = env.register(ReputationBatchContract {}, ());
        let client = ReputationBatchContractClient::new(&env, &contract_id);
        client.initialize(&admin);
        (env, admin, client)
    }

    #[test]
    fn test_all_valid_entries() {
        let (env, _, client) = setup();
        let rater = Address::generate(&env);
        let ratee = Address::generate(&env);

        client.register_ratee(&ratee);

        let ship1: BytesN<32> = BytesN::random(&env);
        let ship2: BytesN<32> = BytesN::random(&env);
        let ship3: BytesN<32> = BytesN::random(&env);

        let mut ratings = Vec::new(&env);
        ratings.push_back(RatingEntry {
            shipment_id: ship1.clone(),
            ratee: ratee.clone(),
            score: 5,
            timestamp: 1000,
        });
        ratings.push_back(RatingEntry {
            shipment_id: ship2.clone(),
            ratee: ratee.clone(),
            score: 4,
            timestamp: 2000,
        });
        ratings.push_back(RatingEntry {
            shipment_id: ship3.clone(),
            ratee: ratee.clone(),
            score: 3,
            timestamp: 3000,
        });

        client.add_ratings_batch(&rater, &ratings);

        let profile = client.get_profile(&ratee);
        assert_eq!(profile.rating_count, 3);
        // (5+4+3)*100 / 3 = 400
        assert_eq!(profile.average_rating, 400);

        assert!(client.has_rated_shipment(&ship1, &rater));
        assert!(client.has_rated_shipment(&ship2, &rater));
        assert!(client.has_rated_shipment(&ship3, &rater));
    }

    #[test]
    fn test_duplicate_entry_causes_full_rollback() {
        let (env, _, client) = setup();
        let rater = Address::generate(&env);
        let ratee = Address::generate(&env);

        client.register_ratee(&ratee);

        let ship1: BytesN<32> = BytesN::random(&env);

        // First, submit a single rating for ship1
        let mut first_batch = Vec::new(&env);
        first_batch.push_back(RatingEntry {
            shipment_id: ship1.clone(),
            ratee: ratee.clone(),
            score: 5,
            timestamp: 1000,
        });
        client.add_ratings_batch(&rater, &first_batch);

        // Now try a batch where ship1 is duplicated
        let ship2: BytesN<32> = BytesN::random(&env);
        let mut second_batch = Vec::new(&env);
        second_batch.push_back(RatingEntry {
            shipment_id: ship2.clone(),
            ratee: ratee.clone(),
            score: 4,
            timestamp: 2000,
        });
        second_batch.push_back(RatingEntry {
            shipment_id: ship1.clone(), // already rated!
            ratee: ratee.clone(),
            score: 3,
            timestamp: 3000,
        });

        let result = client.try_add_ratings_batch(&rater, &second_batch);
        assert_eq!(result, Err(Ok(BatchRatingError::AlreadyRatedShipment)));

        // Profile should still show only the first rating (rollback)
        let profile = client.get_profile(&ratee);
        assert_eq!(profile.rating_count, 1);
        assert_eq!(profile.average_rating, 500);
    }

    #[test]
    fn test_batch_size_limit_exceeded() {
        let (env, _, client) = setup();
        let rater = Address::generate(&env);
        let ratee = Address::generate(&env);

        client.register_ratee(&ratee);

        // Create 11 entries (exceeds limit of 10)
        let mut ratings = Vec::new(&env);
        for _ in 0..11u32 {
            ratings.push_back(RatingEntry {
                shipment_id: BytesN::random(&env),
                ratee: ratee.clone(),
                score: 4,
                timestamp: 1000,
            });
        }

        let result = client.try_add_ratings_batch(&rater, &ratings);
        assert_eq!(result, Err(Ok(BatchRatingError::BatchLimitExceeded)));
    }

    #[test]
    fn test_invalid_score_causes_rollback() {
        let (env, _, client) = setup();
        let rater = Address::generate(&env);
        let ratee = Address::generate(&env);

        client.register_ratee(&ratee);

        let mut ratings = Vec::new(&env);
        ratings.push_back(RatingEntry {
            shipment_id: BytesN::random(&env),
            ratee: ratee.clone(),
            score: 5,
            timestamp: 1000,
        });
        ratings.push_back(RatingEntry {
            shipment_id: BytesN::random(&env),
            ratee: ratee.clone(),
            score: 6, // invalid!
            timestamp: 2000,
        });

        let result = client.try_add_ratings_batch(&rater, &ratings);
        assert_eq!(result, Err(Ok(BatchRatingError::InvalidScore)));

        // No ratings should have been applied
        let profile = client.get_profile(&ratee);
        assert_eq!(profile.rating_count, 0);
    }

    #[test]
    fn test_unregistered_ratee_causes_rollback() {
        let (env, _, client) = setup();
        let rater = Address::generate(&env);
        let ratee = Address::generate(&env); // NOT registered

        let mut ratings = Vec::new(&env);
        ratings.push_back(RatingEntry {
            shipment_id: BytesN::random(&env),
            ratee: ratee.clone(),
            score: 4,
            timestamp: 1000,
        });

        let result = client.try_add_ratings_batch(&rater, &ratings);
        assert_eq!(result, Err(Ok(BatchRatingError::UserNotFound)));
    }

    #[test]
    fn test_composite_score_recalculated_per_ratee() {
        let (env, _, client) = setup();
        let rater = Address::generate(&env);
        let ratee1 = Address::generate(&env);
        let ratee2 = Address::generate(&env);

        client.register_ratee(&ratee1);
        client.register_ratee(&ratee2);

        let mut ratings = Vec::new(&env);
        ratings.push_back(RatingEntry {
            shipment_id: BytesN::random(&env),
            ratee: ratee1.clone(),
            score: 5,
            timestamp: 1000,
        });
        ratings.push_back(RatingEntry {
            shipment_id: BytesN::random(&env),
            ratee: ratee2.clone(),
            score: 3,
            timestamp: 2000,
        });

        client.add_ratings_batch(&rater, &ratings);

        let p1 = client.get_profile(&ratee1);
        assert_eq!(p1.average_rating, 500); // 5 * 100

        let p2 = client.get_profile(&ratee2);
        assert_eq!(p2.average_rating, 300); // 3 * 100
    }
}
