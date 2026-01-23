use soroban_sdk::{Address, Env, Map, Symbol, Vec};
use crate::types::{RewardBalance, RewardEvent, RewardType};

// Storage keys
const ADMIN_KEY: Symbol = soroban_sdk::symbol_short!("ADMIN");
const REWARD_BALANCES_KEY: Symbol = soroban_sdk::symbol_short!("RBALANCES");
const REWARD_EVENTS_KEY: Symbol = soroban_sdk::symbol_short!("REVENTS");
const USER_EVENT_IDS_KEY: Symbol = soroban_sdk::symbol_short!("UEVENTIDS");
const EVENT_COUNTER_KEY: Symbol = soroban_sdk::symbol_short!("EVENTCTR");
const TOTAL_DISTRIBUTED_KEY: Symbol = soroban_sdk::symbol_short!("TOTALDIST");
const REWARD_CONFIG_KEY: Symbol = soroban_sdk::symbol_short!("REWARDCFG");
const AUTHORIZED_CALLERS_KEY: Symbol = soroban_sdk::symbol_short!("AUTHCALL");
const FIRST_SHIPMENT_CLAIMED_KEY: Symbol = soroban_sdk::symbol_short!("FIRSTCLAIM");

/// Get the admin address
pub fn get_admin(env: &Env) -> Address {
    env.storage()
        .persistent()
        .get(&ADMIN_KEY)
        .expect("Admin not set")
}

/// Set the admin address
pub fn set_admin(env: &Env, admin: Address) {
    env.storage().persistent().set(&ADMIN_KEY, &admin);
}

/// Get all reward balances
pub fn get_reward_balances(env: &Env) -> Map<Address, RewardBalance> {
    env.storage()
        .persistent()
        .get(&REWARD_BALANCES_KEY)
        .unwrap_or_else(|| Map::new(env))
}

/// Set reward balances
pub fn set_reward_balances(env: &Env, balances: &Map<Address, RewardBalance>) {
    env.storage()
        .persistent()
        .set(&REWARD_BALANCES_KEY, balances);
}

/// Get reward balance for a specific user
pub fn get_user_balance(env: &Env, user: &Address) -> Option<RewardBalance> {
    get_reward_balances(env).get(user.clone())
}

/// Set reward balance for a specific user
pub fn set_user_balance(env: &Env, user: &Address, balance: &RewardBalance) {
    let mut balances = get_reward_balances(env);
    balances.set(user.clone(), balance.clone());
    set_reward_balances(env, &balances);
}

/// Get all reward events
pub fn get_reward_events(env: &Env) -> Map<u64, RewardEvent> {
    env.storage()
        .persistent()
        .get(&REWARD_EVENTS_KEY)
        .unwrap_or_else(|| Map::new(env))
}

/// Set reward events
pub fn set_reward_events(env: &Env, events: &Map<u64, RewardEvent>) {
    env.storage()
        .persistent()
        .set(&REWARD_EVENTS_KEY, events);
}

/// Get reward event by ID
pub fn get_reward_event(env: &Env, event_id: u64) -> Option<RewardEvent> {
    get_reward_events(env).get(event_id)
}

/// Add a reward event
pub fn add_reward_event(env: &Env, event_id: u64, event: &RewardEvent) {
    let mut events = get_reward_events(env);
    events.set(event_id, event.clone());
    set_reward_events(env, &events);
}

/// Get event IDs for a specific user
pub fn get_user_event_ids(env: &Env, user: &Address) -> Vec<u64> {
    env.storage()
        .persistent()
        .get(&(USER_EVENT_IDS_KEY, user))
        .unwrap_or_else(|| Vec::new(env))
}

/// Add event ID for a user
pub fn add_user_event_id(env: &Env, user: &Address, event_id: u64) {
    let mut event_ids = get_user_event_ids(env, user);
    event_ids.push_back(event_id);
    env.storage()
        .persistent()
        .set(&(USER_EVENT_IDS_KEY, user), &event_ids);
}

/// Get event counter
pub fn get_event_counter(env: &Env) -> u64 {
    env.storage()
        .persistent()
        .get(&EVENT_COUNTER_KEY)
        .unwrap_or(0)
}

/// Increment and get next event ID
pub fn next_event_id(env: &Env) -> u64 {
    let current = get_event_counter(env);
    let next = current + 1;
    env.storage().persistent().set(&EVENT_COUNTER_KEY, &next);
    next
}

/// Get total tokens distributed
pub fn get_total_distributed(env: &Env) -> u128 {
    env.storage()
        .persistent()
        .get(&TOTAL_DISTRIBUTED_KEY)
        .unwrap_or(0)
}

/// Set total tokens distributed
pub fn set_total_distributed(env: &Env, amount: u128) {
    env.storage()
        .persistent()
        .set(&TOTAL_DISTRIBUTED_KEY, &amount);
}

/// Add to total distributed tokens
pub fn add_to_total_distributed(env: &Env, amount: u128) {
    let current = get_total_distributed(env);
    set_total_distributed(env, current + amount);
}

/// Get reward amount for a specific reward type
pub fn get_reward_amount(env: &Env, reward_type: &RewardType) -> u128 {
    let config: Map<RewardType, u128> = env
        .storage()
        .persistent()
        .get(&REWARD_CONFIG_KEY)
        .unwrap_or_else(|| {
            let mut map = Map::new(env);
            // Default values
            map.set(RewardType::ShipmentCompleted, 10);
            map.set(RewardType::OnTimeDelivery, 5);
            map.set(RewardType::HighRating, 1);
            map.set(RewardType::MilestoneReached, 15);
            map.set(RewardType::ReferralBonus, 20);
            map.set(RewardType::FirstShipment, 50);
            map
        });
    config.get(reward_type.clone()).unwrap_or(0)
}

/// Set reward amount for a specific reward type
pub fn set_reward_amount(env: &Env, reward_type: &RewardType, amount: u128) {
    let mut config: Map<RewardType, u128> = env
        .storage()
        .persistent()
        .get(&REWARD_CONFIG_KEY)
        .unwrap_or_else(|| {
            let mut map = Map::new(env);
            map.set(RewardType::ShipmentCompleted, 10);
            map.set(RewardType::OnTimeDelivery, 5);
            map.set(RewardType::HighRating, 1);
            map.set(RewardType::MilestoneReached, 15);
            map.set(RewardType::ReferralBonus, 20);
            map.set(RewardType::FirstShipment, 50);
            map
        });
    config.set(reward_type.clone(), amount);
    env.storage()
        .persistent()
        .set(&REWARD_CONFIG_KEY, &config);
}

/// Check if an address is an authorized caller
pub fn is_authorized_caller(env: &Env, caller: &Address) -> bool {
    let authorized: Map<Address, bool> = env
        .storage()
        .persistent()
        .get(&AUTHORIZED_CALLERS_KEY)
        .unwrap_or_else(|| Map::new(env));
    authorized.get(caller.clone()).unwrap_or(false)
}

/// Add an authorized caller
pub fn add_authorized_caller(env: &Env, caller: &Address) {
    let mut authorized: Map<Address, bool> = env
        .storage()
        .persistent()
        .get(&AUTHORIZED_CALLERS_KEY)
        .unwrap_or_else(|| Map::new(env));
    authorized.set(caller.clone(), true);
    env.storage()
        .persistent()
        .set(&AUTHORIZED_CALLERS_KEY, &authorized);
}

/// Remove an authorized caller
pub fn remove_authorized_caller(env: &Env, caller: &Address) {
    let mut authorized: Map<Address, bool> = env
        .storage()
        .persistent()
        .get(&AUTHORIZED_CALLERS_KEY)
        .unwrap_or_else(|| Map::new(env));
    if authorized.contains(caller.clone()) {
        authorized.remove(caller.clone());
    }
    env.storage()
        .persistent()
        .set(&AUTHORIZED_CALLERS_KEY, &authorized);
}

/// Check if user has claimed first shipment reward
pub fn has_claimed_first_shipment(env: &Env, user: &Address) -> bool {
    let claimed: Map<Address, bool> = env
        .storage()
        .persistent()
        .get(&FIRST_SHIPMENT_CLAIMED_KEY)
        .unwrap_or_else(|| Map::new(env));
    claimed.get(user.clone()).unwrap_or(false)
}

/// Mark first shipment reward as claimed
pub fn mark_first_shipment_claimed(env: &Env, user: &Address) {
    let mut claimed: Map<Address, bool> = env
        .storage()
        .persistent()
        .get(&FIRST_SHIPMENT_CLAIMED_KEY)
        .unwrap_or_else(|| Map::new(env));
    claimed.set(user.clone(), true);
    env.storage()
        .persistent()
        .set(&FIRST_SHIPMENT_CLAIMED_KEY, &claimed);
}
