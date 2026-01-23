#![no_std]

mod access;
mod events;
mod storage;
mod types;

#[cfg(test)]
mod tests;

use soroban_sdk::{contract, contractimpl, Address, BytesN, Env, String, Vec};
use types::{RewardBalance, RewardEvent, RewardType};

#[contract]
pub struct RewardDistribution;

#[contractimpl]
impl RewardDistribution {
    /// Initialize the reward distribution contract with an admin
    pub fn init(env: Env, admin: Address) {
        admin.require_auth();
        
        if let Some(_) = env.storage().persistent().get::<_, Address>(&soroban_sdk::symbol_short!("ADMIN")) {
            panic!("Contract already initialized");
        }
        
        storage::set_admin(&env, admin);
        
        events::emit_user_rewards_initialized(&env, admin.clone(), env.ledger().timestamp());
    }

    /// Initialize user rewards - called automatically on first reward or manually
    pub fn initialize_user_rewards(env: Env, user_address: Address) {
        if storage::get_user_balance(&env, &user_address).is_some() {
            panic!("User rewards already initialized");
        }

        let now = env.ledger().timestamp();
        let balance = RewardBalance {
            user_address: user_address.clone(),
            total_tokens_earned: 0,
            total_tokens_spent: 0,
            current_balance: 0,
            last_reward_timestamp: now,
            is_initialized: true,
        };

        storage::set_user_balance(&env, &user_address, &balance);
        events::emit_user_rewards_initialized(&env, user_address.clone(), now);
    }

    /// Award tokens to a user for a specific reward type
    /// Only callable by authorized system contracts
    pub fn award_tokens(
        env: Env,
        user_address: Address,
        event_type: RewardType,
        reference_id: u64,
        description_hash: Option<BytesN<32>>,
    ) -> Result<u64, String> {
        access::require_authorized(&env);

        let now = env.ledger().timestamp();

        // Initialize user if not already initialized
        if storage::get_user_balance(&env, &user_address).is_none() {
            Self::initialize_user_rewards(env.clone(), user_address.clone());
        }

        // Get the token amount for this reward type
        let token_amount = storage::get_reward_amount(&env, &event_type);
        if token_amount == 0 {
            return Err(String::from_slice(&env, "Invalid reward type"));
        }

        // Create reward event
        let event_id = storage::next_event_id(&env);
        let event = RewardEvent {
            event_id,
            user_address: user_address.clone(),
            event_type,
            tokens_awarded: token_amount,
            reference_id,
            timestamp: now,
            description_hash,
        };

        // Update user balance
        let mut balance = storage::get_user_balance(&env, &user_address)
            .expect("User balance should exist");

        balance.total_tokens_earned += token_amount;
        balance.current_balance += token_amount;
        balance.last_reward_timestamp = now;

        storage::set_user_balance(&env, &user_address, &balance);
        storage::add_reward_event(&env, event_id, &event);
        storage::add_user_event_id(&env, &user_address, event_id);
        storage::add_to_total_distributed(&env, token_amount);

        // Emit event
        events::emit_tokens_awarded(&env, user_address.clone(), event_type, token_amount, reference_id, now);

        Ok(event_id)
    }

    /// Spend tokens from user's balance
    /// Returns true if successful, false if insufficient balance
    pub fn spend_tokens(
        env: Env,
        user_address: Address,
        amount: u128,
        reason: String,
    ) -> Result<bool, String> {
        user_address.require_auth();

        let now = env.ledger().timestamp();

        let mut balance = storage::get_user_balance(&env, &user_address)
            .ok_or(String::from_slice(&env, "User not initialized"))?;

        if balance.current_balance < amount {
            return Ok(false); // Insufficient balance
        }

        balance.current_balance -= amount;
        balance.total_tokens_spent += amount;

        storage::set_user_balance(&env, &user_address, &balance);
        events::emit_tokens_spent(&env, user_address.clone(), amount, reason, now);

        Ok(true)
    }

    /// Get current balance of a user
    pub fn get_balance(env: Env, user_address: Address) -> u128 {
        match storage::get_user_balance(&env, &user_address) {
            Some(balance) => balance.current_balance,
            None => 0,
        }
    }

    /// Get total tokens earned by a user
    pub fn get_total_earned(env: Env, user_address: Address) -> u128 {
        match storage::get_user_balance(&env, &user_address) {
            Some(balance) => balance.total_tokens_earned,
            None => 0,
        }
    }

    /// Get total tokens spent by a user
    pub fn get_total_spent(env: Env, user_address: Address) -> u128 {
        match storage::get_user_balance(&env, &user_address) {
            Some(balance) => balance.total_tokens_spent,
            None => 0,
        }
    }

    /// Get reward history (event IDs) for a user
    pub fn get_reward_history(env: Env, user_address: Address) -> Vec<u64> {
        storage::get_user_event_ids(&env, &user_address)
    }

    /// Get a specific reward event by ID
    pub fn get_reward_event(env: Env, event_id: u64) -> Option<RewardEvent> {
        storage::get_reward_event(&env, event_id)
    }

    /// Update the token amount for a reward type (admin only)
    pub fn update_reward_amount(
        env: Env,
        reward_type: RewardType,
        new_amount: u128,
    ) -> Result<(), String> {
        access::require_admin(&env);

        let old_amount = storage::get_reward_amount(&env, &reward_type);
        storage::set_reward_amount(&env, &reward_type, new_amount);

        events::emit_reward_amount_updated(
            &env,
            reward_type,
            old_amount,
            new_amount,
            env.ledger().timestamp(),
        );

        Ok(())
    }

    /// Get current configured reward amount for a reward type
    pub fn get_reward_amount(env: Env, reward_type: RewardType) -> u128 {
        storage::get_reward_amount(&env, &reward_type)
    }

    /// Calculate bonus multiplier based on reputation score
    /// Returns multiplier as u32 (e.g., 100 = 1.0x, 150 = 1.5x, 200 = 2.0x)
    pub fn calculate_bonus_multiplier(
        _env: Env,
        reputation_score: u64,
    ) -> u32 {
        // Multiplier calculation: 0-200: 100%, 201-400: 120%, 401-600: 150%, 601-800: 180%, 801-1000: 200%
        match reputation_score {
            0..=200 => 100,
            201..=400 => 120,
            401..=600 => 150,
            601..=800 => 180,
            _ => 200, // 801+
        }
    }

    /// Award bonus tokens with multiplier applied (system contracts only)
    pub fn award_bonus(
        env: Env,
        user_address: Address,
        base_tokens: u128,
        multiplier: u32, // e.g., 150 for 1.5x
        reference_id: u64,
    ) -> Result<u64, String> {
        access::require_authorized(&env);

        let now = env.ledger().timestamp();

        // Initialize user if not already initialized
        if storage::get_user_balance(&env, &user_address).is_none() {
            Self::initialize_user_rewards(env.clone(), user_address.clone());
        }

        // Calculate bonus: base_tokens * (multiplier / 100)
        let bonus_tokens = (base_tokens * (multiplier as u128)) / 100;

        // Create reward event for bonus
        let event_id = storage::next_event_id(&env);
        let event = RewardEvent {
            event_id,
            user_address: user_address.clone(),
            event_type: RewardType::MilestoneReached, // Use as generic bonus type
            tokens_awarded: bonus_tokens,
            reference_id,
            timestamp: now,
            description_hash: None,
        };

        // Update user balance
        let mut balance = storage::get_user_balance(&env, &user_address)
            .expect("User balance should exist");

        balance.total_tokens_earned += bonus_tokens;
        balance.current_balance += bonus_tokens;
        balance.last_reward_timestamp = now;

        storage::set_user_balance(&env, &user_address, &balance);
        storage::add_reward_event(&env, event_id, &event);
        storage::add_user_event_id(&env, &user_address, event_id);
        storage::add_to_total_distributed(&env, bonus_tokens);

        // Emit event
        events::emit_bonus_awarded(&env, user_address.clone(), base_tokens, multiplier, bonus_tokens, now);

        Ok(event_id)
    }

    /// Get total tokens distributed across all users
    pub fn get_total_distributed(env: Env) -> u128 {
        storage::get_total_distributed(&env)
    }

    /// Add an authorized caller (admin only)
    pub fn add_authorized_caller(env: Env, caller: Address) -> Result<(), String> {
        access::require_admin(&env);
        storage::add_authorized_caller(&env, &caller);
        Ok(())
    }

    /// Remove an authorized caller (admin only)
    pub fn remove_authorized_caller(env: Env, caller: Address) -> Result<(), String> {
        access::require_admin(&env);
        storage::remove_authorized_caller(&env, &caller);
        Ok(())
    }

    /// Check if an address is authorized to call reward functions
    pub fn is_authorized_caller(env: Env, address: Address) -> bool {
        access::is_authorized(&env, &address)
    }

    /// Award first shipment bonus (one-time only)
    pub fn award_first_shipment_bonus(
        env: Env,
        user_address: Address,
        reference_id: u64,
    ) -> Result<u64, String> {
        access::require_authorized(&env);

        // Check if already claimed
        if storage::has_claimed_first_shipment(&env, &user_address) {
            return Err(String::from_slice(&env, "First shipment bonus already claimed"));
        }

        let now = env.ledger().timestamp();

        // Initialize user if not already initialized
        if storage::get_user_balance(&env, &user_address).is_none() {
            Self::initialize_user_rewards(env.clone(), user_address.clone());
        }

        let token_amount = storage::get_reward_amount(&env, &RewardType::FirstShipment);

        // Create reward event
        let event_id = storage::next_event_id(&env);
        let event = RewardEvent {
            event_id,
            user_address: user_address.clone(),
            event_type: RewardType::FirstShipment,
            tokens_awarded: token_amount,
            reference_id,
            timestamp: now,
            description_hash: None,
        };

        // Update user balance
        let mut balance = storage::get_user_balance(&env, &user_address)
            .expect("User balance should exist");

        balance.total_tokens_earned += token_amount;
        balance.current_balance += token_amount;
        balance.last_reward_timestamp = now;

        storage::set_user_balance(&env, &user_address, &balance);
        storage::add_reward_event(&env, event_id, &event);
        storage::add_user_event_id(&env, &user_address, event_id);
        storage::add_to_total_distributed(&env, token_amount);
        storage::mark_first_shipment_claimed(&env, &user_address);

        // Emit event
        events::emit_tokens_awarded(&env, user_address.clone(), RewardType::FirstShipment, token_amount, reference_id, now);

        Ok(event_id)
    }
}
