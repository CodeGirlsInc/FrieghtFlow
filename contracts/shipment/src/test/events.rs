//! Every state-changing entrypoint must emit exactly one event carrying the
//! post-transition [`Shipment`] record.
//!
//! The test `Env` only keeps the events of the most recent top-level
//! invocation, so each assertion sits directly after the call it covers.

use soroban_sdk::{testutils::Address as _, Address, TryFromVal};

use super::{emitted, emitted_key, make_shipment, no_events, setup, str, Ctx};
use crate::types::{Shipment, ShipmentStatus};

/// Asserts the call that just ran emitted exactly one `action` event, and
/// returns its payload.
fn only_event(ctx: &Ctx, action: &str) -> Shipment {
    let payloads = emitted(&ctx.env, &ctx.client.address, action);
    assert_eq!(payloads.len(), 1, "expected exactly one `{}` event", action);
    Shipment::try_from_val(&ctx.env, &payloads.get_unchecked(0)).unwrap()
}

#[test]
fn test_create_emits_created() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);

    let payload = only_event(&ctx, "created");
    assert_eq!(payload.id, id);
    assert_eq!(payload.shipper, shipper);
    assert_eq!(payload.status, ShipmentStatus::Created);

    let key: u64 = emitted_key(&ctx.env, &ctx.client.address, "created");
    assert_eq!(key, id);

    // Querying the contract clears the event buffer, so do it last.
    assert_eq!(payload, ctx.client.get_shipment(&id));
}

#[test]
fn test_update_emits_updated() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);
    assert_eq!(only_event(&ctx, "created").status, ShipmentStatus::Created);

    ctx.client.update_shipment(
        &shipper,
        &id,
        &str(&ctx.env, "Accra, Ghana"),
        &str(&ctx.env, "Furniture — 10 units"),
        &200u32,
        &6_000_000_000i128,
    );

    let payload = only_event(&ctx, "updated");
    assert_eq!(payload.destination, str(&ctx.env, "Accra, Ghana"));
    assert_eq!(payload.weight_kg, 200);
    assert_eq!(payload.status, ShipmentStatus::Created);

    // Querying the contract clears the event buffer, so do it last.
    assert_eq!(payload, ctx.client.get_shipment(&id));
}

#[test]
fn test_happy_path_emits_every_transition() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);
    let carrier = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);
    assert_eq!(only_event(&ctx, "created").status, ShipmentStatus::Created);

    ctx.client.accept_shipment(&carrier, &id);
    let accepted = only_event(&ctx, "accepted");
    assert_eq!(accepted.status, ShipmentStatus::Accepted);
    assert_eq!(accepted.carrier, Some(carrier.clone()));

    ctx.client.mark_in_transit(&carrier, &id);
    assert_eq!(
        only_event(&ctx, "intransit").status,
        ShipmentStatus::InTransit
    );

    ctx.client.mark_delivered(&carrier, &id);
    assert_eq!(
        only_event(&ctx, "delivered").status,
        ShipmentStatus::Delivered
    );

    ctx.client.confirm_delivery(&shipper, &id);
    let completed = only_event(&ctx, "completed");
    assert_eq!(completed.status, ShipmentStatus::Completed);
    assert_eq!(completed, ctx.client.get_shipment(&id));
}

#[test]
fn test_cancel_emits_cancelled() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);
    ctx.client.cancel_shipment(&shipper, &id);

    assert_eq!(
        only_event(&ctx, "cancelled").status,
        ShipmentStatus::Cancelled
    );
}

#[test]
fn test_dispute_and_resolution_emit_events() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);
    let carrier = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);
    ctx.client.accept_shipment(&carrier, &id);
    ctx.client.mark_in_transit(&carrier, &id);

    ctx.client.raise_dispute(&shipper, &id);
    assert_eq!(
        only_event(&ctx, "disputed").status,
        ShipmentStatus::Disputed
    );

    ctx.client.resolve_dispute(&id, &true);
    // A single `resolved` event; the payload's status says which way it went.
    assert_eq!(
        only_event(&ctx, "resolved").status,
        ShipmentStatus::Completed
    );

    let key: u64 = emitted_key(&ctx.env, &ctx.client.address, "resolved");
    assert_eq!(key, id);
}

#[test]
fn test_resolution_as_cancelled_emits_resolved() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);
    let carrier = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);
    ctx.client.accept_shipment(&carrier, &id);
    ctx.client.mark_in_transit(&carrier, &id);
    ctx.client.raise_dispute(&carrier, &id);
    ctx.client.resolve_dispute(&id, &false);

    assert_eq!(
        only_event(&ctx, "resolved").status,
        ShipmentStatus::Cancelled
    );
}

#[test]
fn test_rejected_transition_emits_nothing() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);
    let impostor = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);

    // Wrong caller, and wrong status — the call is rejected and emits nothing.
    let _ = ctx.client.try_confirm_delivery(&impostor, &id);
    assert!(no_events(&ctx.env));
}
