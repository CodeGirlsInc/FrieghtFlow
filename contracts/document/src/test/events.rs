//! Every state-changing entrypoint must emit exactly one event carrying the
//! post-transition [`DocumentRecord`].
//!
//! The test `Env` only keeps the events of the most recent top-level
//! invocation, so each assertion sits directly after the call it covers.

use soroban_sdk::{testutils::Address as _, Address, TryFromVal};

use super::{emitted, emitted_key, no_events, setup, Ctx};
use crate::types::{DocumentRecord, DocumentType, HashAlgorithm};

/// Asserts the call that just ran emitted exactly one `action` event, and
/// returns its payload.
fn only_event(ctx: &Ctx, action: &str) -> DocumentRecord {
    let payloads = emitted(&ctx.env, &ctx.client.address, action);
    assert_eq!(payloads.len(), 1, "expected exactly one `{}` event", action);
    DocumentRecord::try_from_val(&ctx.env, &payloads.get_unchecked(0)).unwrap()
}

#[test]
fn test_register_emits_registered() {
    let ctx = setup();

    let (id, hash) = ctx.register(&ctx.shipper, ctx.shipment_id);

    let payload = only_event(&ctx, "registered");
    assert_eq!(payload.id, id);
    assert_eq!(payload.shipment_id, ctx.shipment_id);
    assert_eq!(payload.uploader, ctx.shipper);
    assert_eq!(payload.content_hash, hash);
    assert_eq!(payload.hash_algorithm, HashAlgorithm::Sha256);
    assert!(!payload.is_verified);

    let key: u64 = emitted_key(&ctx.env, &ctx.client.address, "registered");
    assert_eq!(key, id);

    // Querying the contract clears the event buffer, so do it last.
    assert_eq!(payload, ctx.client.get_document(&id));
}

#[test]
fn test_verify_emits_verified() {
    let ctx = setup();
    let (id, _) = ctx.register(&ctx.shipper, ctx.shipment_id);

    ctx.client.verify_document(&ctx.admin, &id);

    let payload = only_event(&ctx, "verified");
    assert!(payload.is_verified);
    assert_eq!(payload.verified_by, Some(ctx.admin.clone()));

    let key: u64 = emitted_key(&ctx.env, &ctx.client.address, "verified");
    assert_eq!(key, id);

    // Querying the contract clears the event buffer, so do it last.
    assert_eq!(payload, ctx.client.get_document(&id));
}

#[test]
fn test_rejected_registration_emits_nothing() {
    let ctx = setup();
    let stranger = Address::generate(&ctx.env);

    let _ = ctx.client.try_register_document(
        &stranger,
        &ctx.shipment_id,
        &DocumentType::BillOfLading,
        &ctx.fake_hash(),
        &HashAlgorithm::Sha256,
        &ctx.fake_cid(),
    );

    assert!(no_events(&ctx.env));
}
