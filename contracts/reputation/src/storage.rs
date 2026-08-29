//! Storage accessors shared by the contract's entrypoint modules.

use soroban_sdk::{Address, Env};

use crate::errors::ReputationError;
use crate::types::{DataKey, Reputation, TTL_LEDGERS};

pub fn admin(env: &Env) -> Result<Address, ReputationError> {
    env.storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(ReputationError::NotInitialized)
}

pub fn require_not_paused(env: &Env) -> Result<(), ReputationError> {
    if env
        .storage()
        .instance()
        .get(&DataKey::Paused)
        .unwrap_or(false)
    {
        return Err(ReputationError::Paused);
    }
    Ok(())
}

pub fn authorized_contract(env: &Env) -> Result<Address, ReputationError> {
    env.storage()
        .instance()
        .get(&DataKey::AuthorizedContract)
        .ok_or(ReputationError::NotInitialized)
}

pub fn load_reputation(env: &Env, user: &Address) -> Result<Reputation, ReputationError> {
    env.storage()
        .persistent()
        .get(&DataKey::Reputation(user.clone()))
        .ok_or(ReputationError::UserNotFound)
}

pub fn save_reputation(env: &Env, rep: &Reputation) {
    let key = DataKey::Reputation(rep.user.clone());
    env.storage().persistent().set(&key, rep);
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);
}

pub fn next_rating_id(env: &Env) -> u64 {
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
