use super::{setup, AMOUNT, SHIPMENT_ID};
use crate::errors::EscrowError;
use crate::types::EscrowStatus;
use soroban_sdk::{Address, Env, token};

#[test]
fn test_fund_holds_tokens() {
    let ctx = setup(AMOUNT);
    ctx.fund();

    let record = ctx.client.get_escrow(&SHIPMENT_ID);
    assert_eq!(record.status, EscrowStatus::Funded);
    assert_eq!(record.amount, AMOUNT);

    assert_eq!(ctx.token().balance(&ctx.client.address), AMOUNT);
    assert_eq!(ctx.client.get_balance(), Ok(AMOUNT));
}

#[test]
fn test_get_balance_before_initialization_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_addr = {
        let address = env.register_stellar_asset_contract_v2(admin.clone()).address();
        let sac = token::StellarAssetClient::new(&env, &address);
        sac.mint(&admin, &AMOUNT);
        address
    };

    let contract_id = env.register(crate::contract::EscrowContract {}, ());
    let client = crate::contract::EscrowContractClient::new(&env, &contract_id);

    let result = client.get_balance();
    assert_eq!(result, Err(EscrowError::NotInitialized));
}

#[test]
fn test_double_fund_fails() {
    let ctx = setup(AMOUNT * 2);
    ctx.fund();

    let result = ctx
        .client
        .try_fund_escrow(&ctx.shipper, &ctx.carrier, &SHIPMENT_ID, &AMOUNT);
    assert_eq!(result, Err(Ok(EscrowError::AlreadyFunded)));
}

#[test]
fn test_refund_after_released_fails() {
    let ctx = setup(AMOUNT * 2);
    ctx.fund();
    ctx.client.release_payment(&SHIPMENT_ID);

    let result = ctx
        .client
        .try_fund_escrow(&ctx.shipper, &ctx.carrier, &SHIPMENT_ID, &AMOUNT);
    assert_eq!(result, Err(Ok(EscrowError::InvalidStatus)));
}

#[test]
fn test_refund_after_refunded_fails() {
    let ctx = setup(AMOUNT * 2);
    ctx.fund();
    ctx.client.refund_payment(&SHIPMENT_ID);

    let result = ctx
        .client
        .try_fund_escrow(&ctx.shipper, &ctx.carrier, &SHIPMENT_ID, &AMOUNT);
    assert_eq!(result, Err(Ok(EscrowError::InvalidStatus)));
}

#[test]
fn test_invalid_amount_fails() {
    let ctx = setup(AMOUNT);

    let result = ctx
        .client
        .try_fund_escrow(&ctx.shipper, &ctx.carrier, &SHIPMENT_ID, &0i128);
    assert_eq!(result, Err(Ok(EscrowError::InvalidAmount)));
}

#[test]
fn test_get_admin_returns_configured_admin() {
    let ctx = setup(AMOUNT);
    assert_eq!(ctx.client.get_admin(), ctx.admin);
}
