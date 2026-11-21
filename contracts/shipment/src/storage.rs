//! Storage accessors shared by the contract's entrypoint modules.

use common::TTL_LEDGERS;
use soroban_sdk::{Address, Env, Vec};

use crate::errors::ShipmentError;
use crate::types::{DataKey, Dispute, Milestones, Shipment};

pub fn admin(env: &Env) -> Result<Address, ShipmentError> {
    env.storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(ShipmentError::NotInitialized)
}

pub fn require_not_paused(env: &Env) -> Result<(), ShipmentError> {
    if env
        .storage()
        .instance()
        .get(&DataKey::Paused)
        .unwrap_or(false)
    {
        return Err(ShipmentError::Paused);
    }
    Ok(())
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
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);
}

/// Drop `id` from `key`, removing the entry entirely once the list is empty.
///
/// The counterpart to [`append_to_list`]. Leaving a stale id behind is not
/// cosmetic: `get_shipments_by_carrier` reads this list verbatim, so an id that
/// is never removed keeps resolving as a live shipment for that carrier
/// (issue #1677).
pub fn remove_from_list(env: &Env, key: DataKey, id: u64) {
    let list: Vec<u64> = env
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Vec::new(env));

    let mut remaining = Vec::new(env);
    for item in list.iter() {
        if item != id {
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

/// Clear a shipment's carrier assignment and its reverse index entry.
///
/// Shared by the carrier's `withdraw_acceptance` (#1864) and both routes to
/// `Cancelled`; leaving either the field or `CarrierList(carrier)` in place
/// would hand out stale jobs and keep an ex-carrier as `is_party`.
pub fn unassign_carrier(env: &Env, shipment: &mut Shipment) {
    if let Some(carrier) = shipment.carrier.take() {
        remove_from_list(env, DataKey::CarrierList(carrier), shipment.id);
    }
}

/// The dispute record for a shipment, if one has been raised (#1863).
pub fn dispute(env: &Env, shipment_id: u64) -> Result<Dispute, ShipmentError> {
    env.storage()
        .persistent()
        .get(&DataKey::Dispute(shipment_id))
        .ok_or(ShipmentError::NotFound)
}

pub fn store_dispute(env: &Env, shipment_id: u64, dispute: &Dispute) {
    let key = DataKey::Dispute(shipment_id);
    env.storage().persistent().set(&key, dispute);
    env.storage().persistent().extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);
}

/// Milestone timestamps for a shipment, zero-filled when none were recorded
/// (e.g. for a shipment created before milestones existed) (#1865).
pub fn milestones(env: &Env, shipment_id: u64) -> Milestones {
    env.storage()
        .persistent()
        .get(&DataKey::Milestones(shipment_id))
        .unwrap_or_default()
}

pub fn store_milestones(env: &Env, shipment_id: u64, milestones: &Milestones) {
    let key = DataKey::Milestones(shipment_id);
    env.storage().persistent().set(&key, milestones);
    env.storage().persistent().extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);
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
