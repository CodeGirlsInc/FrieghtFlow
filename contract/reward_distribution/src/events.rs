use soroban_sdk::{Address, Env, Symbol};
use crate::types::RewardType;

/// Emit UserRewardsInitialized event
pub fn emit_user_rewards_initialized(env: &Env, user_address: Address, timestamp: u64) {
    env.events().publish(
        (Symbol::new(env, "UserRewardsInitialized"), user_address.clone()),
        timestamp,
    );
}

/// Emit TokensAwarded event
pub fn emit_tokens_awarded(
    env: &Env,
    user_address: Address,
    event_type: RewardType,
    amount: u128,
    reference_id: u64,
    timestamp: u64,
) {
    env.events().publish(
        (Symbol::new(env, "TokensAwarded"), user_address.clone()),
        (event_type as u32, amount, reference_id, timestamp),
    );
}

/// Emit TokensSpent event
pub fn emit_tokens_spent(
    env: &Env,
    user_address: Address,
    amount: u128,
    reason: soroban_sdk::String,
    timestamp: u64,
) {
    env.events().publish(
        (Symbol::new(env, "TokensSpent"), user_address.clone()),
        (amount, reason, timestamp),
    );
}

/// Emit RewardAmountUpdated event
pub fn emit_reward_amount_updated(
    env: &Env,
    reward_type: RewardType,
    old_amount: u128,
    new_amount: u128,
    timestamp: u64,
) {
    env.events().publish(
        Symbol::new(env, "RewardAmountUpdated"),
        (reward_type as u32, old_amount, new_amount, timestamp),
    );
}

/// Emit BonusAwarded event
pub fn emit_bonus_awarded(
    env: &Env,
    user_address: Address,
    base_tokens: u128,
    multiplier: u32,
    bonus_tokens: u128,
    timestamp: u64,
) {
    env.events().publish(
        (Symbol::new(env, "BonusAwarded"), user_address.clone()),
        (base_tokens, multiplier, bonus_tokens, timestamp),
    );
}
