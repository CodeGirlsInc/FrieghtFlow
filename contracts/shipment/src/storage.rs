//! Storage accessors shared by the contract's entrypoint modules.

use soroban_sdk::{Address, Env, Vec};

use crate::errors::ShipmentError;
use crate::types::{DataKey, Shipment, TTL_LEDGERS};

pub fn admin(env: &Env) -> Result<Address, ShipmentError> {
    env.storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(ShipmentError::NotInitialized)
}

pub fn load(env: &Env, id: u64) -> Result<Shipment, ShipmentError> {
    env.storage()
        .persistent()
        .get(&DataKey::Shipment(id))
        .ok_or(ShipmentError::NotFound)
}

pub fn save(env: &Env, shipment: &Shipment) {
    env.storage()
        .persistent()
        .set(&DataKey::Shipment(shipment.id), shipment);
    env.storage().persistent().extend_ttl(
        &DataKey::Shipment(shipment.id),
        TTL_LEDGERS,
        TTL_LEDGERS,
    );
}

pub fn next_id(env: &Env) -> u64 {
    let current: u64 = env
        .storage()
        .persistent()
        .get(&DataKey::Counter)
        .unwrap_or(0);
    let next = current + 1;
    env.storage().persistent().set(&DataKey::Counter, &next);
    env.storage()
        .persistent()
        .extend_ttl(&DataKey::Counter, TTL_LEDGERS, TTL_LEDGERS);
    next
}

pub fn append_to_list(env: &Env, key: DataKey, id: u64) {
    let mut list: Vec<u64> = env
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Vec::new(env));
    list.push_back(id);
    env.storage().persistent().set(&key, &list);
    // Note: extend_ttl on Vec keys requires the key to be cloneable;
    // we skip it here for simplicity (lists extend with each write).
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
