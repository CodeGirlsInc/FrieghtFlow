use super::{setup, AMOUNT, SHIPMENT_ID};
use crate::errors::EscrowError;
use crate::types::EscrowStatus;

#[test]
fn test_fund_holds_tokens() {
    let ctx = setup(AMOUNT);
    ctx.fund();

    let record = ctx.client.get_escrow(&SHIPMENT_ID);
    assert_eq!(record.status, EscrowStatus::Funded);
    assert_eq!(record.amount, AMOUNT);

    assert_eq!(ctx.token().balance(&ctx.client.address), AMOUNT);
    assert_eq!(ctx.client.get_balance(), AMOUNT);
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
