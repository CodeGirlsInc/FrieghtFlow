use soroban_sdk::{testutils::Address as _, Address};

use super::{make_shipment, setup, str};
use crate::errors::ShipmentError;

#[test]
fn test_pause_blocks_shipment_creation_and_admin_rotation_works() {
    let ctx = setup();
    let new_admin = Address::generate(&ctx.env);
    let shipper = Address::generate(&ctx.env);

    ctx.client.rotate_admin(&ctx.admin, &new_admin);
    ctx.client.pause(&new_admin);

    let result = ctx.client.try_create_shipment(
        &shipper,
        &str(&ctx.env, "A"),
        &str(&ctx.env, "B"),
        &str(&ctx.env, "cargo"),
        &100u32,
        &1_000i128,
    );
    assert_eq!(result, Err(Ok(ShipmentError::Paused)));

    ctx.client.unpause(&new_admin);
    make_shipment(&ctx, &shipper);
}

#[test]
fn test_rotate_admin_requires_current_admin() {
    let ctx = setup();
    let impostor = Address::generate(&ctx.env);
    let new_admin = Address::generate(&ctx.env);

    let result = ctx.client.try_rotate_admin(&impostor, &new_admin);
    assert_eq!(result, Err(Ok(ShipmentError::Unauthorized)));
}
