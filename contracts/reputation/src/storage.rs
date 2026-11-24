//! Storage accessors shared by the contract's entrypoint modules.

use common::TTL_LEDGERS;
use soroban_sdk::{Address, Env, Vec};

use crate::errors::ReputationError;
use crate::types::{DataKey, Reputation};

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

/// Append `rating_id` to the list of ratings received by `user`.
pub fn append_rating_for(env: &Env, user: &Address, rating_id: u64) {
    let key = DataKey::RatingsFor(user.clone());
    let mut list: Vec<u64> = env
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Vec::new(env));
    list.push_back(rating_id);
    env.storage().persistent().set(&key, &list);
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);
}

/// Drop `rating_id` from `user`'s received-ratings list, removing the key
/// entirely once the list is empty.
pub fn remove_rating_for(env: &Env, user: &Address, rating_id: u64) {
    let key = DataKey::RatingsFor(user.clone());
    let list: Vec<u64> = env
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Vec::new(env));

    let mut remaining = Vec::new(env);
    for item in list.iter() {
        if item != rating_id {
            remaining.push_back(item);
        }
    }

    if remaining.is_empty() {
        env.storage().persistent().remove(&key);
    } else {
        env.storage().persistent().set(&key, &remaining);
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);
    }
}

/// Slice `list[offset..offset+limit]`, clamped to the list's bounds.
pub fn paginate(env: &Env, list: Vec<u64>, offset: u32, limit: u32) -> Vec<u64> {
    let mut paged = Vec::new(env);
    let len = list.len();

    if offset >= len {
        return paged;
    }

    let end = (offset + limit).min(len);
    for i in offset..end {
        if let Some(item) = list.get(i) {
            paged.push_back(item);
        }
    }
    paged
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
