use soroban_sdk::{testutils::Address as _, Address};

use super::{make_shipment, setup};
use crate::errors::ShipmentError;

#[test]
fn test_shipper_carrier_lists() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);
    let carrier = Address::generate(&ctx.env);

    let id1 = make_shipment(&ctx, &shipper);
    let id2 = make_shipment(&ctx, &shipper);
    ctx.client.accept_shipment(&carrier, &id1);
    ctx.client.accept_shipment(&carrier, &id2);

    let by_shipper = ctx.client.get_shipments_by_shipper(&shipper);
    assert_eq!(by_shipper.len(), 2);

    let by_carrier = ctx.client.get_shipments_by_carrier(&carrier);
    assert_eq!(by_carrier.len(), 2);
}

#[test]
fn test_not_found_error() {
    let ctx = setup();
    let result = ctx.client.try_get_shipment(&999);
    assert_eq!(result, Err(Ok(ShipmentError::NotFound)));
}

#[test]
fn test_double_initialize_fails() {
    let ctx = setup();

    // `setup` already initialized the contract with `ctx.admin`.
    let result = ctx.client.try_initialize(&ctx.admin);
    assert_eq!(result, Err(Ok(ShipmentError::AlreadyInitialized)));
}
