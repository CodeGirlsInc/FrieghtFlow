//! Every state-changing entrypoint must emit exactly one event carrying the
//! post-transition [`EscrowRecord`].
//!
//! The test `Env` only keeps the events of the most recent top-level
//! invocation, so each assertion sits directly after the call it covers.

use soroban_sdk::TryFromVal;

use super::{emitted, emitted_key, no_events, setup, Ctx, AMOUNT, SHIPMENT_ID};
use crate::types::{EscrowRecord, EscrowStatus};

/// Asserts the call that just ran emitted exactly one `action` event, and
/// returns its payload.
fn only_event(ctx: &Ctx, action: &str) -> EscrowRecord {
    let payloads = emitted(&ctx.env, &ctx.client.address, action);
    assert_eq!(payloads.len(), 1, "expected exactly one `{}` event", action);
    EscrowRecord::try_from_val(&ctx.env, &payloads.get_unchecked(0)).unwrap()
}

#[test]
fn test_fund_emits_funded() {
    let ctx = setup(AMOUNT);
    ctx.fund();

    let payload = only_event(&ctx, "funded");
    assert_eq!(payload.status, EscrowStatus::Funded);
    assert_eq!(payload.amount, AMOUNT);
    assert_eq!(payload.shipper, ctx.shipper);
    assert_eq!(payload.carrier, ctx.carrier);

    let key: u64 = emitted_key(&ctx.env, &ctx.client.address, "funded");
    assert_eq!(key, SHIPMENT_ID);

    // Querying the contract clears the event buffer, so do it last.
    assert_eq!(payload, ctx.client.get_escrow(&SHIPMENT_ID));
}

#[test]
fn test_release_emits_released() {
    let ctx = setup(AMOUNT);
    ctx.fund();
    ctx.client.release_payment(&SHIPMENT_ID);

    let payload = only_event(&ctx, "released");
    assert_eq!(payload.status, EscrowStatus::Released);
    assert_eq!(payload, ctx.client.get_escrow(&SHIPMENT_ID));
}

#[test]
fn test_refund_emits_refunded() {
    let ctx = setup(AMOUNT);
    ctx.fund();
    ctx.client.refund_payment(&SHIPMENT_ID);

    assert_eq!(only_event(&ctx, "refunded").status, EscrowStatus::Refunded);
}

#[test]
fn test_dispute_and_resolution_emit_events() {
    let ctx = setup(AMOUNT);
    ctx.fund();

    ctx.client.raise_dispute(&ctx.shipper, &SHIPMENT_ID);
    assert_eq!(only_event(&ctx, "disputed").status, EscrowStatus::Disputed);

    ctx.client.resolve_dispute(&SHIPMENT_ID, &true);
    // A single `resolved` event; the payload's status says which way it went.
    assert_eq!(only_event(&ctx, "resolved").status, EscrowStatus::Released);

    let key: u64 = emitted_key(&ctx.env, &ctx.client.address, "resolved");
    assert_eq!(key, SHIPMENT_ID);
}

#[test]
fn test_resolution_to_shipper_emits_resolved() {
    let ctx = setup(AMOUNT);
    ctx.fund();
    ctx.client.raise_dispute(&ctx.carrier, &SHIPMENT_ID);
    ctx.client.resolve_dispute(&SHIPMENT_ID, &false);

    assert_eq!(only_event(&ctx, "resolved").status, EscrowStatus::Refunded);
}

#[test]
fn test_rejected_call_emits_nothing() {
    let ctx = setup(AMOUNT);

    // Releasing a nonexistent escrow must not emit anything.
    let _ = ctx.client.try_release_payment(&SHIPMENT_ID);
    assert!(no_events(&ctx.env));
}
