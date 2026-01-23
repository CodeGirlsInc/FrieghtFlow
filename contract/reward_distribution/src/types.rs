use soroban_sdk::{contracttype, Address};

/// Enum representing different types of reward events
#[contracttype]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u32)]
pub enum RewardType {
    ShipmentCompleted = 1,
    OnTimeDelivery = 2,
    HighRating = 3,
    MilestoneReached = 4,
    ReferralBonus = 5,
    FirstShipment = 6,
}

/// User reward balance tracking
#[contracttype]
#[derive(Clone, Debug)]
pub struct RewardBalance {
    pub user_address: Address,
    pub total_tokens_earned: u128,
    pub total_tokens_spent: u128,
    pub current_balance: u128,
    pub last_reward_timestamp: u64,
    pub is_initialized: bool,
}

/// Individual reward event record
#[contracttype]
#[derive(Clone, Debug)]
pub struct RewardEvent {
    pub event_id: u64,
    pub user_address: Address,
    pub event_type: RewardType,
    pub tokens_awarded: u128,
    pub reference_id: u64,
    pub timestamp: u64,
    pub description_hash: Option<soroban_sdk::BytesN<32>>,
}

/// Reward configuration
#[contracttype]
#[derive(Clone, Debug)]
pub struct RewardConfig {
    pub reward_type: RewardType,
    pub token_amount: u128,
}
