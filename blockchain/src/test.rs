#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env, String};

#[test]
fn test_initialize_contract() {
    let env = Env::default();
    let contract_id = env.register_contract(None, FreightFlowContract);
    let client = FreightFlowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    let role = client.get_user_role(&admin);
    assert_eq!(role, UserRole::Admin);
}

#[test]
fn test_create_shipment() {
    let env = Env::default();
    let contract_id = env.register_contract(None, FreightFlowContract);
    let client = FreightFlowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let shipper = Address::generate(&env);
    let carrier = Address::generate(&env);
    let receiver = Address::generate(&env);

    client.initialize(&admin);

    let shipment_id = client.create_shipment(
        &shipper,
        &carrier,
        &receiver,
        &String::from_str(&env, "New York"),
        &String::from_str(&env, "Los Angeles"),
        &String::from_str(&env, "Electronics"),
        &1000u64,
        &50000u64,
        &String::from_str(&env, "TRK123456789"),
    );

    let shipment = client.get_shipment(&shipment_id);
    assert_eq!(shipment.shipper, shipper);
    assert_eq!(shipment.carrier, carrier);
    assert_eq!(shipment.receiver, receiver);
    assert_eq!(shipment.status, ShipmentStatus::Created);
}

#[test]
fn test_update_shipment_status() {
    let env = Env::default();
    let contract_id = env.register_contract(None, FreightFlowContract);
    let client = FreightFlowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let shipper = Address::generate(&env);
    let carrier = Address::generate(&env);
    let receiver = Address::generate(&env);

    client.initialize(&admin);
    client.set_user_role(&admin, &carrier, &UserRole::Carrier);

    let shipment_id = client.create_shipment(
        &shipper,
        &carrier,
        &receiver,
        &String::from_str(&env, "New York"),
        &String::from_str(&env, "Los Angeles"),
        &String::from_str(&env, "Electronics"),
        &1000u64,
        &50000u64,
        &String::from_str(&env, "TRK123456789"),
    );

    client.update_shipment_status(&carrier, &shipment_id, &ShipmentStatus::InTransit);

    let shipment = client.get_shipment(&shipment_id);
    assert_eq!(shipment.status, ShipmentStatus::InTransit);
}

#[test]
fn test_payment_flow() {
    let env = Env::default();
    let contract_id = env.register_contract(None, FreightFlowContract);
    let client = FreightFlowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let shipper = Address::generate(&env);
    let carrier = Address::generate(&env);
    let receiver = Address::generate(&env);

    client.initialize(&admin);
    client.set_user_role(&admin, &carrier, &UserRole::Carrier);

    let shipment_id = client.create_shipment(
        &shipper,
        &carrier,
        &receiver,
        &String::from_str(&env, "New York"),
        &String::from_str(&env, "Los Angeles"),
        &String::from_str(&env, "Electronics"),
        &1000u64,
        &50000u64,
        &String::from_str(&env, "TRK123456789"),
    );

    let payment_id = client.create_payment(
        &shipper,
        &carrier,
        &shipment_id,
        &50000u64,
        &String::from_str(&env, "USDC"),
    );

    client.process_payment(&shipper, &payment_id);

    let payment = client.get_payment(&payment_id);
    assert_eq!(payment.status, PaymentStatus::Escrowed);

    // Update shipment to delivered
    client.update_shipment_status(&carrier, &shipment_id, &ShipmentStatus::Delivered);

    // Release payment
    client.release_payment(&shipper, &payment_id);

    let payment = client.get_payment(&payment_id);
    assert_eq!(payment.status, PaymentStatus::Released);
}
