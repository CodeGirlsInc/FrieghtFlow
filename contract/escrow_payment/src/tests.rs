#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

#[test]
fn full_escrow_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let payer = Address::generate(&env);
    let payee = Address::generate(&env);

    let contract_id = env.register_contract(None, EscrowPaymentContract);
    let client = EscrowPaymentContractClient::new(&env, &contract_id);

    client.initialize(&admin, &arbitrator);

    let shipment = BytesN::from_array(&env, &[1; 32]);

    let id = client.create_escrow(&shipment, &payee, &1000);
    let escrow = client.get_payment(&id);

    assert_eq!(escrow.amount, 1000);
    assert_eq!(escrow.status, PaymentStatus::Locked);

    client.initiate_dispute(&id, &String::from_str(&env, "Issue"));
    let disputed = client.get_payment(&id);
    assert_eq!(disputed.status, PaymentStatus::Disputed);

    client.resolve_dispute(&id, &true);
    let resolved = client.get_payment(&id);
    assert_eq!(resolved.status, PaymentStatus::Released);
}

#[test]
#[should_panic]
fn reject_zero_amount() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let payee = Address::generate(&env);

    let contract_id = env.register_contract(None, EscrowPaymentContract);
    let client = EscrowPaymentContractClient::new(&env, &contract_id);

    client.initialize(&admin, &arbitrator);

    let shipment = BytesN::from_array(&env, &[9; 32]);
    client.create_escrow(&shipment, &payee, &0);
}
