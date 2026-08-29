use soroban_sdk::testutils::Address as _;
use soroban_sdk::Address;

use super::{setup, AMOUNT, SHIPMENT_ID};
use crate::errors::EscrowError;
use crate::types::EscrowStatus;

#[test]
fn test_pause_blocks_funding_and_admin_rotation_works() {
    let ctx = setup(AMOUNT * 2);
    let new_admin = Address::generate(&ctx.env);

    ctx.client.rotate_admin(&ctx.admin, &new_admin);
    ctx.client.pause(&new_admin);

    ctx.token().approve(
        &ctx.shipper,
        &ctx.client.address,
        &AMOUNT,
        &(ctx.env.ledger().sequence() + 1000),
    );

    let result = ctx
        .client
        .try_fund_escrow(&ctx.shipper, &ctx.carrier, &SHIPMENT_ID, &AMOUNT);
    assert_eq!(result, Err(Ok(EscrowError::Paused)));

    ctx.client.unpause(&new_admin);
    ctx.client
        .fund_escrow(&ctx.shipper, &ctx.carrier, &SHIPMENT_ID, &AMOUNT);
    assert_eq!(
        ctx.client.get_escrow(&SHIPMENT_ID).status,
        EscrowStatus::Funded
    );
}

#[test]
fn test_rotate_admin_requires_current_admin() {
    let ctx = setup(AMOUNT);
    let impostor = Address::generate(&ctx.env);
    let new_admin = Address::generate(&ctx.env);

    let result = ctx.client.try_rotate_admin(&impostor, &new_admin);
    assert_eq!(result, Err(Ok(EscrowError::Unauthorized)));
}
