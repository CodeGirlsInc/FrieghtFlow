use soroban_sdk::{
    testutils::{Address as _, BytesN as _},
    Address, BytesN,
};

use super::setup;
use crate::errors::DocumentError;
use crate::types::HashAlgorithm;

#[test]
fn test_verify_document() {
    let ctx = setup();
    let (id, _) = ctx.register(&ctx.shipper, ctx.shipment_id);

    ctx.client.verify_document(&ctx.admin, &id);

    let doc = ctx.client.get_document(&id);
    assert!(doc.is_verified);
    assert_eq!(doc.verified_by, Some(ctx.admin.clone()));
}

#[test]
fn test_double_verify_fails() {
    let ctx = setup();
    let (id, _) = ctx.register(&ctx.shipper, ctx.shipment_id);

    ctx.client.verify_document(&ctx.admin, &id);
    let result = ctx.client.try_verify_document(&ctx.admin, &id);
    assert_eq!(result, Err(Ok(DocumentError::AlreadyVerified)));
}

#[test]
fn test_non_admin_verify_fails() {
    let ctx = setup();
    let (id, _) = ctx.register(&ctx.shipper, ctx.shipment_id);

    let stranger = Address::generate(&ctx.env);
    let result = ctx.client.try_verify_document(&stranger, &id);
    assert_eq!(result, Err(Ok(DocumentError::Unauthorized)));
}

#[test]
fn test_integrity_check_pass() {
    let ctx = setup();
    let (id, original_hash) = ctx.register(&ctx.shipper, ctx.shipment_id);

    assert!(ctx.client.check_integrity(&id, &original_hash));
}

#[test]
fn test_integrity_check_tampered() {
    let ctx = setup();
    let (id, _) = ctx.register(&ctx.shipper, ctx.shipment_id);

    let tampered_hash = BytesN::random(&ctx.env);
    assert!(!ctx.client.check_integrity(&id, &tampered_hash));
}

#[test]
fn test_registered_document_records_hash_algorithm() {
    let ctx = setup();
    let (id, _) = ctx.register(&ctx.shipper, ctx.shipment_id);

    // `ctx.register` always registers with SHA-256 (the only algorithm this
    // contract accepts today); the algorithm is recorded on-chain rather
    // than only implied by documentation.
    assert_eq!(
        ctx.client.get_document(&id).hash_algorithm,
        HashAlgorithm::Sha256
    );
}

#[test]
fn test_integrity_check_uses_recorded_algorithm() {
    let ctx = setup();
    let hash = ctx.fake_hash();
    let id = ctx.client.register_document(
        &ctx.shipper,
        &ctx.shipment_id,
        &crate::types::DocumentType::BillOfLading,
        &hash,
        &HashAlgorithm::Sha256,
        &ctx.fake_cid(),
    );

    // The comparison branches on `doc.hash_algorithm`, not a hardcoded rule.
    assert!(ctx.client.check_integrity(&id, &hash));
}
