use soroban_sdk::{testutils::Address as _, Address};

use super::{setup, AMOUNT, SHIPMENT_ID};
use crate::errors::EscrowError;
use crate::types::EscrowStatus;

#[test]
fn test_fund_and_release() {
    let ctx = setup(AMOUNT);
    ctx.fund();

    ctx.client.release_payment(&SHIPMENT_ID);

    let record = ctx.client.get_escrow(&SHIPMENT_ID);
    assert_eq!(record.status, EscrowStatus::Released);
    assert_eq!(ctx.token().balance(&ctx.carrier), AMOUNT);
    assert_eq!(ctx.token().balance(&ctx.client.address), 0);
}

#[test]
fn test_fund_and_refund() {
    let ctx = setup(AMOUNT);
    ctx.fund();

    ctx.client.refund_payment(&SHIPMENT_ID);

    let record = ctx.client.get_escrow(&SHIPMENT_ID);
    assert_eq!(record.status, EscrowStatus::Refunded);
    assert_eq!(ctx.token().balance(&ctx.shipper), AMOUNT);
}

#[test]
fn test_dispute_resolved_to_carrier() {
    let ctx = setup(AMOUNT);
    ctx.fund();
    ctx.client.raise_dispute(&ctx.shipper, &SHIPMENT_ID);

    let record = ctx.client.get_escrow(&SHIPMENT_ID);
    assert_eq!(record.status, EscrowStatus::Disputed);

    ctx.client.resolve_dispute(&SHIPMENT_ID, &true);
    assert_eq!(ctx.token().balance(&ctx.carrier), AMOUNT);
}

#[test]
fn test_dispute_resolved_to_shipper() {
    let ctx = setup(AMOUNT);
    ctx.fund();
    ctx.client.raise_dispute(&ctx.carrier, &SHIPMENT_ID);
    ctx.client.resolve_dispute(&SHIPMENT_ID, &false);

    assert_eq!(ctx.token().balance(&ctx.shipper), AMOUNT);
}

#[test]
fn test_release_unfunded_fails() {
    let ctx = setup(AMOUNT);

    let result = ctx.client.try_release_payment(&SHIPMENT_ID);
    assert_eq!(result, Err(Ok(EscrowError::NotFound)));
}

#[test]
fn test_unauthorized_dispute_fails() {
    let ctx = setup(AMOUNT);
    ctx.fund();

    let random = Address::generate(&ctx.env);
    let result = ctx.client.try_raise_dispute(&random, &SHIPMENT_ID);
    assert_eq!(result, Err(Ok(EscrowError::Unauthorized)));
}
