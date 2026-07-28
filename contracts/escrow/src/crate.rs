#![no_std]
//! Bounded, paginated list storage to replace unbounded Vec growth.
//!
//! Replaces single-key `Vec<T>` patterns (ShipperList, CarrierList, etc.).
//! Each list is stored as individual persistent entries keyed by (prefix, index)
//! plus a count, so reads never load the entire list at once.

use soroban_sdk::{contracttype, Env};

/// Generic page result.
#[contracttype]
pub struct Page<T> {
    pub items: soroban_sdk::Vec<T>,
    pub total: u32,
}


    pub fn get_total_ratings(env: Env) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::RatingCounter)
            .unwrap_or(0)
    }

/// Maximum entries allowed per address per list (configurable default).
pub const DEFAULT_MAX_PER_ADDRESS: u32 = 500;

/// Append `item` under `(prefix, owner_index)` if below `max` cap.
/// Returns the new count, or None if the cap was reached.
pub fn bounded_push<K: soroban_sdk::TryIntoVal<Env, soroban_sdk::Val> + Clone,
                    T: soroban_sdk::TryIntoVal<Env, soroban_sdk::Val> + soroban_sdk::TryFromVal<Env, soroban_sdk::Val> + Clone>(
    env: &Env,
    count_key: &K,
    item_key_fn: impl Fn(u32) -> K,
    item: T,
    max: u32,
) -> Option<u32> {
    let count: u32 = env.storage().persistent().get(count_key).unwrap_or(0);
    if count >= max {
        return None; // cap reached
    }
    env.storage().persistent().set(&item_key_fn(count), &item);
    let new_count = count + 1;
    env.storage().persistent().set(count_key, &new_count);
    Some(new_count)
}

/// Read a page of items from paginated storage.
pub fn read_page<K: soroban_sdk::TryIntoVal<Env, soroban_sdk::Val> + Clone,
                 T: soroban_sdk::TryIntoVal<Env, soroban_sdk::Val> + soroban_sdk::TryFromVal<Env, soroban_sdk::Val> + Clone>(
    env: &Env,
    count_key: &K,
    item_key_fn: impl Fn(u32) -> K,
    offset: u32,
    limit: u32,
) -> Page<T> {
    let total: u32 = env.storage().persistent().get(count_key).unwrap_or(0);
    let mut items = soroban_sdk::Vec::new(env);
    let end = (offset + limit).min(total);
    for i in offset..end {
        if let Some(item) = env.storage().persistent().get::<K, T>(&item_key_fn(i)) {
            items.push_back(item);
        }
    }
    Page { items, total }
}
