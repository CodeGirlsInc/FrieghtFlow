#![cfg(test)]

use soroban_sdk::testutils::{Address as _, AuthorizedFunction, MockAuthInvoke};
use soroban_sdk::{
    symbol_short, vec as svec, Address, BytesN, Env, InvokeError, String, Symbol,
};

use crate::{RewardDistribution, RewardDistributionClient};
use crate::types::RewardType;

#[test]
fn test_init() {
    let env = Env::default();
    let client = RewardDistributionClient::new(&env, &env.register_contract(None, RewardDistribution));
    let admin = Address::random(&env);

    client.init(&admin);

    // Verify admin is set
    assert_eq!(client.is_authorized_caller(&admin), true);
}

#[test]
fn test_init_already_initialized() {
    let env = Env::default();
    let client = RewardDistributionClient::new(&env, &env.register_contract(None, RewardDistribution));
    let admin = Address::random(&env);

    client.init(&admin);

    // Try to initialize again - should fail
    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        client.init(&admin);
    }));
    assert!(result.is_err());
}

#[test]
fn test_initialize_user_rewards() {
    let env = Env::default();
    let client = RewardDistributionClient::new(&env, &env.register_contract(None, RewardDistribution));
    let admin = Address::random(&env);
    let user = Address::random(&env);

    client.init(&admin);
    client.initialize_user_rewards(&user);

    // Verify user balance is 0
    assert_eq!(client.get_balance(&user), 0);
    assert_eq!(client.get_total_earned(&user), 0);
}

#[test]
fn test_award_tokens() {
    let env = Env::default();
    let contract_id = env.register_contract(None, RewardDistribution);
    let client = RewardDistributionClient::new(&env, &contract_id);
    let admin = Address::random(&env);
    let user = Address::random(&env);

    client.init(&admin);
    client.add_authorized_caller(&admin).unwrap();

    // Award shipment completion tokens
    let event_id = client
        .award_tokens(
            &user,
            &RewardType::ShipmentCompleted,
            1,
            &None,
        )
        .unwrap();

    // Verify balance updated
    let expected_amount = client.get_reward_amount(&RewardType::ShipmentCompleted);
    assert_eq!(client.get_balance(&user), expected_amount);
    assert_eq!(client.get_total_earned(&user), expected_amount);
    assert!(event_id > 0);
}

#[test]
fn test_award_tokens_unauthorized() {
    let env = Env::default();
    let contract_id = env.register_contract(None, RewardDistribution);
    let client = RewardDistributionClient::new(&env, &contract_id);
    let admin = Address::random(&env);
    let unauthorized = Address::random(&env);
    let user = Address::random(&env);

    client.init(&admin);

    // Try to award tokens without authorization - should fail
    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        client.award_tokens(
            &user,
            &RewardType::ShipmentCompleted,
            1,
            &None,
        );
    }));
    assert!(result.is_err());
}

#[test]
fn test_spend_tokens() {
    let env = Env::default();
    let contract_id = env.register_contract(None, RewardDistribution);
    let client = RewardDistributionClient::new(&env, &contract_id);
    let admin = Address::random(&env);
    let user = Address::random(&env);

    client.init(&admin);
    client.add_authorized_caller(&admin).unwrap();

    // Award tokens
    let reward_amount = client.get_reward_amount(&RewardType::ShipmentCompleted);
    client
        .award_tokens(
            &user,
            &RewardType::ShipmentCompleted,
            1,
            &None,
        )
        .unwrap();

    // Spend some tokens
    let spend_amount = reward_amount / 2;
    let reason = String::from_slice(&env, "premium_features");
    let result = client.spend_tokens(&user, &spend_amount, &reason).unwrap();

    assert!(result); // Should succeed
    assert_eq!(client.get_balance(&user), reward_amount - spend_amount);
    assert_eq!(client.get_total_spent(&user), spend_amount);
}

#[test]
fn test_spend_tokens_insufficient_balance() {
    let env = Env::default();
    let contract_id = env.register_contract(None, RewardDistribution);
    let client = RewardDistributionClient::new(&env, &contract_id);
    let admin = Address::random(&env);
    let user = Address::random(&env);

    client.init(&admin);
    client.add_authorized_caller(&admin).unwrap();

    // Award tokens
    let reward_amount = client.get_reward_amount(&RewardType::ShipmentCompleted);
    client
        .award_tokens(
            &user,
            &RewardType::ShipmentCompleted,
            1,
            &None,
        )
        .unwrap();

    // Try to spend more than balance
    let reason = String::from_slice(&env, "premium_features");
    let result = client.spend_tokens(&user, &(reward_amount * 2), &reason).unwrap();

    assert!(!result); // Should fail
    assert_eq!(client.get_balance(&user), reward_amount); // Balance should not change
}

#[test]
fn test_get_balance() {
    let env = Env::default();
    let contract_id = env.register_contract(None, RewardDistribution);
    let client = RewardDistributionClient::new(&env, &contract_id);
    let admin = Address::random(&env);
    let user = Address::random(&env);

    client.init(&admin);
    client.add_authorized_caller(&admin).unwrap();

    // New user should have 0 balance
    assert_eq!(client.get_balance(&user), 0);

    // Award tokens
    let reward_amount = client.get_reward_amount(&RewardType::ShipmentCompleted);
    client
        .award_tokens(
            &user,
            &RewardType::ShipmentCompleted,
            1,
            &None,
        )
        .unwrap();

    assert_eq!(client.get_balance(&user), reward_amount);
}

#[test]
fn test_get_reward_history() {
    let env = Env::default();
    let contract_id = env.register_contract(None, RewardDistribution);
    let client = RewardDistributionClient::new(&env, &contract_id);
    let admin = Address::random(&env);
    let user = Address::random(&env);

    client.init(&admin);
    client.add_authorized_caller(&admin).unwrap();

    // Award multiple tokens
    let event_id_1 = client
        .award_tokens(
            &user,
            &RewardType::ShipmentCompleted,
            1,
            &None,
        )
        .unwrap();

    let event_id_2 = client
        .award_tokens(
            &user,
            &RewardType::OnTimeDelivery,
            2,
            &None,
        )
        .unwrap();

    // Get history
    let history = client.get_reward_history(&user);
    assert_eq!(history.len(), 2);
    assert_eq!(history.get(0), event_id_1);
    assert_eq!(history.get(1), event_id_2);
}

#[test]
fn test_get_reward_event() {
    let env = Env::default();
    let contract_id = env.register_contract(None, RewardDistribution);
    let client = RewardDistributionClient::new(&env, &contract_id);
    let admin = Address::random(&env);
    let user = Address::random(&env);

    client.init(&admin);
    client.add_authorized_caller(&admin).unwrap();

    // Award tokens
    let event_id = client
        .award_tokens(
            &user,
            &RewardType::ShipmentCompleted,
            123,
            &None,
        )
        .unwrap();

    // Get event
    let event = client.get_reward_event(&event_id).unwrap();
    assert_eq!(event.event_id, event_id);
    assert_eq!(event.user_address, user);
    assert_eq!(event.event_type, RewardType::ShipmentCompleted);
    assert_eq!(event.reference_id, 123);
}

#[test]
fn test_update_reward_amount() {
    let env = Env::default();
    let contract_id = env.register_contract(None, RewardDistribution);
    let client = RewardDistributionClient::new(&env, &contract_id);
    let admin = Address::random(&env);

    client.init(&admin);

    // Get initial amount
    let initial_amount = client.get_reward_amount(&RewardType::ShipmentCompleted);
    assert_eq!(initial_amount, 10); // Default

    // Update amount
    client
        .update_reward_amount(&RewardType::ShipmentCompleted, &20)
        .unwrap();

    // Verify update
    let new_amount = client.get_reward_amount(&RewardType::ShipmentCompleted);
    assert_eq!(new_amount, 20);
}

#[test]
fn test_update_reward_amount_unauthorized() {
    let env = Env::default();
    let contract_id = env.register_contract(None, RewardDistribution);
    let client = RewardDistributionClient::new(&env, &contract_id);
    let admin = Address::random(&env);
    let unauthorized = Address::random(&env);

    client.init(&admin);

    // Try to update without authorization - should fail
    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        client.update_reward_amount(&RewardType::ShipmentCompleted, &20);
    }));
    assert!(result.is_err());
}

#[test]
fn test_calculate_bonus_multiplier() {
    let env = Env::default();
    let client = RewardDistributionClient::new(&env, &env.register_contract(None, RewardDistribution));
    let admin = Address::random(&env);

    client.init(&admin);

    // Test different reputation scores
    assert_eq!(client.calculate_bonus_multiplier(&0), 100); // 1.0x
    assert_eq!(client.calculate_bonus_multiplier(&200), 100); // 1.0x
    assert_eq!(client.calculate_bonus_multiplier(&201), 120); // 1.2x
    assert_eq!(client.calculate_bonus_multiplier(&400), 120); // 1.2x
    assert_eq!(client.calculate_bonus_multiplier(&401), 150); // 1.5x
    assert_eq!(client.calculate_bonus_multiplier(&600), 150); // 1.5x
    assert_eq!(client.calculate_bonus_multiplier(&601), 180); // 1.8x
    assert_eq!(client.calculate_bonus_multiplier(&800), 180); // 1.8x
    assert_eq!(client.calculate_bonus_multiplier(&801), 200); // 2.0x
    assert_eq!(client.calculate_bonus_multiplier(&1000), 200); // 2.0x
}

#[test]
fn test_award_bonus() {
    let env = Env::default();
    let contract_id = env.register_contract(None, RewardDistribution);
    let client = RewardDistributionClient::new(&env, &contract_id);
    let admin = Address::random(&env);
    let user = Address::random(&env);

    client.init(&admin);
    client.add_authorized_caller(&admin).unwrap();

    // Award bonus with 1.5x multiplier
    let base_tokens = 100u128;
    let multiplier = 150u32; // 1.5x
    let event_id = client
        .award_bonus(&user, &base_tokens, &multiplier, &1)
        .unwrap();

    // Verify bonus calculation: 100 * 150 / 100 = 150
    let expected_bonus = 150u128;
    assert_eq!(client.get_balance(&user), expected_bonus);
    assert!(event_id > 0);
}

#[test]
fn test_award_first_shipment_bonus() {
    let env = Env::default();
    let contract_id = env.register_contract(None, RewardDistribution);
    let client = RewardDistributionClient::new(&env, &contract_id);
    let admin = Address::random(&env);
    let user = Address::random(&env);

    client.init(&admin);
    client.add_authorized_caller(&admin).unwrap();

    // Award first shipment bonus
    let event_id = client
        .award_first_shipment_bonus(&user, &1)
        .unwrap();

    let first_shipment_amount = client.get_reward_amount(&RewardType::FirstShipment);
    assert_eq!(client.get_balance(&user), first_shipment_amount);
    assert!(event_id > 0);
}

#[test]
fn test_award_first_shipment_bonus_one_time_only() {
    let env = Env::default();
    let contract_id = env.register_contract(None, RewardDistribution);
    let client = RewardDistributionClient::new(&env, &contract_id);
    let admin = Address::random(&env);
    let user = Address::random(&env);

    client.init(&admin);
    client.add_authorized_caller(&admin).unwrap();

    // Award first shipment bonus
    client.award_first_shipment_bonus(&user, &1).unwrap();

    // Try to award again - should fail
    let result = client.award_first_shipment_bonus(&user, &2);
    assert!(result.is_err());
}

#[test]
fn test_get_total_distributed() {
    let env = Env::default();
    let contract_id = env.register_contract(None, RewardDistribution);
    let client = RewardDistributionClient::new(&env, &contract_id);
    let admin = Address::random(&env);
    let user1 = Address::random(&env);
    let user2 = Address::random(&env);

    client.init(&admin);
    client.add_authorized_caller(&admin).unwrap();

    // Initial total should be 0
    assert_eq!(client.get_total_distributed(), 0);

    // Award tokens to user1
    let amount1 = client.get_reward_amount(&RewardType::ShipmentCompleted);
    client
        .award_tokens(&user1, &RewardType::ShipmentCompleted, &1, &None)
        .unwrap();

    assert_eq!(client.get_total_distributed(), amount1);

    // Award tokens to user2
    let amount2 = client.get_reward_amount(&RewardType::OnTimeDelivery);
    client
        .award_tokens(&user2, &RewardType::OnTimeDelivery, &2, &None)
        .unwrap();

    assert_eq!(client.get_total_distributed(), amount1 + amount2);
}

#[test]
fn test_add_remove_authorized_caller() {
    let env = Env::default();
    let contract_id = env.register_contract(None, RewardDistribution);
    let client = RewardDistributionClient::new(&env, &contract_id);
    let admin = Address::random(&env);
    let caller = Address::random(&env);

    client.init(&admin);

    // Initially not authorized
    assert_eq!(client.is_authorized_caller(&caller), false);

    // Add as authorized
    client.add_authorized_caller(&caller).unwrap();
    assert_eq!(client.is_authorized_caller(&caller), true);

    // Remove from authorized
    client.remove_authorized_caller(&caller).unwrap();
    assert_eq!(client.is_authorized_caller(&caller), false);
}

#[test]
fn test_complex_reward_flow() {
    let env = Env::default();
    let contract_id = env.register_contract(None, RewardDistribution);
    let client = RewardDistributionClient::new(&env, &contract_id);
    let admin = Address::random(&env);
    let user = Address::random(&env);

    client.init(&admin);
    client.add_authorized_caller(&admin).unwrap();

    // Award first shipment bonus
    client.award_first_shipment_bonus(&user, &1).unwrap();
    let first_shipment_amount = client.get_reward_amount(&RewardType::FirstShipment);

    // Award shipment completed
    client
        .award_tokens(&user, &RewardType::ShipmentCompleted, &1, &None)
        .unwrap();
    let shipment_amount = client.get_reward_amount(&RewardType::ShipmentCompleted);

    // Award on-time delivery bonus
    client
        .award_tokens(&user, &RewardType::OnTimeDelivery, &1, &None)
        .unwrap();
    let ontime_amount = client.get_reward_amount(&RewardType::OnTimeDelivery);

    // Check total earned
    let total_earned = first_shipment_amount + shipment_amount + ontime_amount;
    assert_eq!(client.get_total_earned(&user), total_earned);
    assert_eq!(client.get_balance(&user), total_earned);

    // Spend some tokens
    let reason = String::from_slice(&env, "premium_features");
    let spend_amount = 30u128;
    client.spend_tokens(&user, &spend_amount, &reason).unwrap();

    // Verify final state
    assert_eq!(client.get_balance(&user), total_earned - spend_amount);
    assert_eq!(client.get_total_spent(&user), spend_amount);
    assert_eq!(client.get_total_earned(&user), total_earned);

    // Verify history
    let history = client.get_reward_history(&user);
    assert_eq!(history.len(), 3); // First shipment + 2 regular rewards
}
