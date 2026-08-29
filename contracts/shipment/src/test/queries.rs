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

    let by_shipper = ctx.client.get_shipments_by_shipper(&shipper, &0, &10);
    assert_eq!(by_shipper.len(), 2);

    let by_carrier = ctx.client.get_shipments_by_carrier(&carrier, &0, &10);
    assert_eq!(by_carrier.len(), 2);
}

#[test]
fn test_shipper_list_pagination() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);

    for _ in 0..15 {
        make_shipment(&ctx, &shipper);
    }

    let page1 = ctx.client.get_shipments_by_shipper(&shipper, &0, &10);
    assert_eq!(page1.len(), 10);
    assert_eq!(page1.get(0), Some(1));
    assert_eq!(page1.get(9), Some(10));

    let page2 = ctx.client.get_shipments_by_shipper(&shipper, &10, &10);
    assert_eq!(page2.len(), 5);
    assert_eq!(page2.get(0), Some(11));
    assert_eq!(page2.get(4), Some(15));

    let page3 = ctx.client.get_shipments_by_shipper(&shipper, &20, &10);
    assert_eq!(page3.len(), 0);
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
