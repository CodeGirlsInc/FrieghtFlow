use soroban_sdk::{testutils::Address as _, Address};

use super::{make_shipment, setup, str};
use crate::errors::ShipmentError;
use crate::types::ShipmentStatus;

#[test]
fn test_create_shipment() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);
    assert_eq!(id, 1);
    assert_eq!(ctx.client.get_total_shipments(), 1);

    let s = ctx.client.get_shipment(&id);
    assert_eq!(s.id, 1);
    assert_eq!(s.shipper, shipper);
    assert_eq!(s.status, ShipmentStatus::Created);
    assert!(s.carrier.is_none());
    assert_eq!(s.weight_kg, 120);
    assert_eq!(s.price, 5_000_000_000);
}

#[test]
fn test_full_happy_path() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);
    let carrier = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);
    assert_eq!(ctx.client.get_shipment(&id).status, ShipmentStatus::Created);

    ctx.client.accept_shipment(&carrier, &id);
    let s = ctx.client.get_shipment(&id);
    assert_eq!(s.status, ShipmentStatus::Accepted);
    assert_eq!(s.carrier, Some(carrier.clone()));

    ctx.client.mark_in_transit(&carrier, &id);
    assert_eq!(
        ctx.client.get_shipment(&id).status,
        ShipmentStatus::InTransit
    );

    ctx.client.mark_delivered(&carrier, &id);
    assert_eq!(
        ctx.client.get_shipment(&id).status,
        ShipmentStatus::Delivered
    );

    ctx.client.confirm_delivery(&shipper, &id);
    assert_eq!(
        ctx.client.get_shipment(&id).status,
        ShipmentStatus::Completed
    );
}

#[test]
fn test_update_shipment_while_created() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);
    ctx.client.update_shipment(
        &shipper,
        &id,
        &str(&ctx.env, "Accra, Ghana"),
        &str(&ctx.env, "Furniture — 10 units"),
        &200u32,
        &6_000_000_000i128,
    );

    let s = ctx.client.get_shipment(&id);
    assert_eq!(s.destination, str(&ctx.env, "Accra, Ghana"));
    assert_eq!(s.cargo_description, str(&ctx.env, "Furniture — 10 units"));
    assert_eq!(s.weight_kg, 200);
    assert_eq!(s.price, 6_000_000_000);
    assert_eq!(s.status, ShipmentStatus::Created);
}

#[test]
fn test_update_shipment_after_accepted_fails() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);
    let carrier = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);
    ctx.client.accept_shipment(&carrier, &id);

    let result = ctx.client.try_update_shipment(
        &shipper,
        &id,
        &str(&ctx.env, "Accra, Ghana"),
        &str(&ctx.env, "Furniture — 10 units"),
        &200u32,
        &6_000_000_000i128,
    );
    assert_eq!(result, Err(Ok(ShipmentError::InvalidStatus)));

    // Terms are untouched.
    let s = ctx.client.get_shipment(&id);
    assert_eq!(s.destination, str(&ctx.env, "Nairobi, Kenya"));
}

#[test]
fn test_update_shipment_wrong_shipper_fails() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);
    let impostor = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);

    let result = ctx.client.try_update_shipment(
        &impostor,
        &id,
        &str(&ctx.env, "Accra, Ghana"),
        &str(&ctx.env, "Furniture — 10 units"),
        &200u32,
        &6_000_000_000i128,
    );
    assert_eq!(result, Err(Ok(ShipmentError::NotShipper)));
}

#[test]
fn test_cancel_from_created() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);
    ctx.client.cancel_shipment(&shipper, &id);
    assert_eq!(
        ctx.client.get_shipment(&id).status,
        ShipmentStatus::Cancelled
    );
}

#[test]
fn test_cancel_from_accepted() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);
    let carrier = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);
    ctx.client.accept_shipment(&carrier, &id);
    ctx.client.cancel_shipment(&shipper, &id);
    assert_eq!(
        ctx.client.get_shipment(&id).status,
        ShipmentStatus::Cancelled
    );
}

#[test]
fn test_cancel_in_transit_fails() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);
    let carrier = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);
    ctx.client.accept_shipment(&carrier, &id);
    ctx.client.mark_in_transit(&carrier, &id);

    let result = ctx.client.try_cancel_shipment(&shipper, &id);
    assert_eq!(result, Err(Ok(ShipmentError::InvalidStatus)));
}

#[test]
fn test_wrong_carrier_cannot_mark_in_transit() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);
    let carrier = Address::generate(&ctx.env);
    let impostor = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);
    ctx.client.accept_shipment(&carrier, &id);

    let result = ctx.client.try_mark_in_transit(&impostor, &id);
    assert_eq!(result, Err(Ok(ShipmentError::NotCarrier)));
}

#[test]
fn test_invalid_input_zero_weight() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);

    let result = ctx.client.try_create_shipment(
        &shipper,
        &str(&ctx.env, "A"),
        &str(&ctx.env, "B"),
        &str(&ctx.env, "cargo"),
        &0u32,
        &1_000i128,
    );
    assert_eq!(result, Err(Ok(ShipmentError::InvalidInput)));
}

#[test]
fn test_invalid_input_excessive_bounds() {
    const LONG_256: &str = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

    let ctx = setup();
    let shipper = Address::generate(&ctx.env);

    // Max weight exceeded
    let result = ctx.client.try_create_shipment(
        &shipper,
        &str(&ctx.env, "A"),
        &str(&ctx.env, "B"),
        &str(&ctx.env, "cargo"),
        &1_000_001u32,
        &1_000i128,
    );
    assert_eq!(result, Err(Ok(ShipmentError::InvalidInput)));

    // String length exceeded
    let result = ctx.client.try_create_shipment(
        &shipper,
        &str(&ctx.env, LONG_256),
        &str(&ctx.env, "B"),
        &str(&ctx.env, "cargo"),
        &100u32,
        &1_000i128,
    );
    assert_eq!(result, Err(Ok(ShipmentError::InvalidInput)));
}
