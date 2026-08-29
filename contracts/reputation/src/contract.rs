//! The contract's ABI surface.
//!
//! Every entrypoint is declared here in one `#[contractimpl]` block so the
//! externally callable interface can be read in one place; the logic behind
//! each one lives in [`crate::users`], [`crate::rating`] or [`crate::stats`].

use soroban_sdk::{contract, contractimpl, Address, Env, Vec};

use crate::errors::ReputationError;
use crate::types::{DataKey, RatingRecord, Reputation, UserType};
use crate::{rating, stats, storage, users};

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {
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
        env.storage().instance().set(&DataKey::Paused, &false);
        env.storage()
            .instance()
            .set(&DataKey::AuthorizedContract, &authorized_contract);
        env.storage()
            .persistent()
            .set(&DataKey::RatingCounter, &0u64);
        Ok(())
    }

    /// Transfer admin rights to a new address. Callable only by the current admin.
    pub fn rotate_admin(
        env: Env,
        current_admin: Address,
        new_admin: Address,
    ) -> Result<(), ReputationError> {
        current_admin.require_auth();
        if current_admin != storage::admin(&env)? {
            return Err(ReputationError::Unauthorized);
        }
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        Ok(())
    }

    /// Admin-only: pause all state-mutating entrypoints.
    pub fn pause(env: Env, admin: Address) -> Result<(), ReputationError> {
        admin.require_auth();
        if admin != storage::admin(&env)? {
            return Err(ReputationError::Unauthorized);
        }
        env.storage().instance().set(&DataKey::Paused, &true);
        Ok(())
    }

    /// Admin-only: resume state-mutating entrypoints.
    pub fn unpause(env: Env, admin: Address) -> Result<(), ReputationError> {
        admin.require_auth();
        if admin != storage::admin(&env)? {
            return Err(ReputationError::Unauthorized);
        }
        env.storage().instance().set(&DataKey::Paused, &false);
        Ok(())
    }

    /// Register a user. See [`users::register`].
    pub fn register_user(
        env: Env,
        user: Address,
        user_type: UserType,
    ) -> Result<(), ReputationError> {
        users::register(&env, user, user_type)
    }

    /// Submit a 1-5 star rating. See [`rating::submit`].
    pub fn submit_rating(
        env: Env,
        rater: Address,
        shipment_id: u64,
        rated: Address,
        score: u32,
    ) -> Result<u64, ReputationError> {
        rating::submit(&env, rater, shipment_id, rated, score)
    }

    /// Admin voids a rating. See [`rating::void`].
    pub fn void_rating(env: Env, rating_id: u64) -> Result<(), ReputationError> {
        rating::void(&env, rating_id)
    }

    /// Record a completed shipment. See [`stats::update`].
    pub fn update_stats(
        env: Env,
        caller: Address,
        user: Address,
        was_on_time: bool,
        was_successful: bool,
    ) -> Result<(), ReputationError> {
        stats::update(&env, caller, user, was_on_time, was_successful)
    }

    /// Composite 0-1000 reputation score. See [`stats::score`].
    pub fn calculate_score(env: Env, user: Address) -> Result<u32, ReputationError> {
        stats::score(&env, user)
    }

    pub fn get_reputation(env: Env, user: Address) -> Result<Reputation, ReputationError> {
        storage::load_reputation(&env, &user)
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
}
