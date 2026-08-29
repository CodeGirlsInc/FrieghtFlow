use soroban_sdk::{testutils::Address as _, Address};

use super::{make_shipment, setup};
use crate::types::ShipmentStatus;

#[test]
fn test_dispute_and_admin_resolve() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);
    let carrier = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);
    ctx.client.accept_shipment(&carrier, &id);
    ctx.client.mark_in_transit(&carrier, &id);

    // Shipper raises dispute
    ctx.client.raise_dispute(&shipper, &id);
    assert_eq!(
        ctx.client.get_shipment(&id).status,
        ShipmentStatus::Disputed
    );

    // Admin resolves in carrier's favour
    ctx.client.resolve_dispute(&id, &true);
    assert_eq!(
        ctx.client.get_shipment(&id).status,
        ShipmentStatus::Completed
    );
}

#[test]
fn test_dispute_resolved_as_cancelled() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);
    let carrier = Address::generate(&ctx.env);

    let id = make_shipment(&ctx, &shipper);
    ctx.client.accept_shipment(&carrier, &id);
    ctx.client.mark_in_transit(&carrier, &id);
    ctx.client.raise_dispute(&carrier, &id);
    ctx.client.resolve_dispute(&id, &false);
    assert_eq!(
        ctx.client.get_shipment(&id).status,
        ShipmentStatus::Cancelled
    );
}
