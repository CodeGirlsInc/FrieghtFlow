use soroban_sdk::{
    testutils::{Address as _, BytesN as _},
    Address, BytesN, String,
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
fn test_flag_document_reverses_verification() {
    let ctx = setup();
    let (id, _) = ctx.register(&ctx.shipper, ctx.shipment_id);

    ctx.client.verify_document(&ctx.admin, &id);
    assert!(ctx.client.get_document(&id).is_verified);

    let reason = String::from_str(
        &ctx.env,
        "Forged bill of lading — discrepancy with carrier's manifest",
    );
    ctx.client.flag_document(&ctx.admin, &id, &reason);

    let doc = ctx.client.get_document(&id);
    assert!(!doc.is_verified);
    assert_eq!(doc.flagged_by, Some(ctx.admin.clone()));
    assert_eq!(doc.flag_reason, Some(reason));
    // The earlier verification is kept as history.
    assert_eq!(doc.verified_by, Some(ctx.admin.clone()));
}

#[test]
fn test_flag_unverified_document_fails() {
    let ctx = setup();
    let (id, _) = ctx.register(&ctx.shipper, ctx.shipment_id);

    let reason = String::from_str(&ctx.env, "not actually verified yet");
    let result = ctx.client.try_flag_document(&ctx.admin, &id, &reason);
    assert_eq!(result, Err(Ok(DocumentError::NotVerified)));
}

#[test]
fn test_non_admin_flag_fails() {
    let ctx = setup();
    let (id, _) = ctx.register(&ctx.shipper, ctx.shipment_id);
    ctx.client.verify_document(&ctx.admin, &id);

    let stranger = Address::generate(&ctx.env);
    let reason = String::from_str(&ctx.env, "impostor trying to flag");
    let result = ctx.client.try_flag_document(&stranger, &id, &reason);
    assert_eq!(result, Err(Ok(DocumentError::Unauthorized)));
}

#[test]
fn test_flagged_document_can_be_reverified() {
    let ctx = setup();
    let (id, _) = ctx.register(&ctx.shipper, ctx.shipment_id);

    ctx.client.verify_document(&ctx.admin, &id);
    let reason = String::from_str(&ctx.env, "needs a second look");
    ctx.client.flag_document(&ctx.admin, &id, &reason);

    ctx.client.verify_document(&ctx.admin, &id);
    let doc = ctx.client.get_document(&id);
    assert!(doc.is_verified);
    assert!(doc.flag_reason.is_none());
    assert!(doc.flagged_by.is_none());
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

// --- Issue #1451: field length bounds ---

/// register_document rejects an ipfs_cid longer than 512 bytes.
#[test]
fn test_register_document_rejects_oversized_ipfs_cid() {
    use soroban_sdk::Bytes;
    let ctx = setup();
    // 513 bytes — one over the limit.
    let oversized_cid = Bytes::from_slice(&ctx.env, &[b'Q'; 513]);
    let result = ctx.client.try_register_document(
        &ctx.shipper,
        &ctx.shipment_id,
        &crate::types::DocumentType::BillOfLading,
        &ctx.fake_hash(),
        &HashAlgorithm::Sha256,
        &oversized_cid,
    );
    assert_eq!(result, Err(Ok(crate::errors::DocumentError::FieldTooLong)));
}

/// register_document accepts an ipfs_cid exactly at the 512-byte limit.
#[test]
fn test_register_document_accepts_cid_at_limit() {
    use soroban_sdk::Bytes;
    let ctx = setup();
    let max_cid = Bytes::from_slice(&ctx.env, &[b'Q'; 512]);
    // Must not return FieldTooLong.
    ctx.client.register_document(
        &ctx.shipper,
        &ctx.shipment_id,
        &crate::types::DocumentType::BillOfLading,
        &ctx.fake_hash(),
        &HashAlgorithm::Sha256,
        &max_cid,
    );
}

/// flag_document rejects a reason string longer than 1 024 bytes.
#[test]
fn test_flag_document_rejects_oversized_reason() {
    let ctx = setup();
    let (id, _) = ctx.register(&ctx.shipper, ctx.shipment_id);
    ctx.client.verify_document(&ctx.admin, &id);

    // 1025-character reason string — one over the limit.
    let oversized: std::string::String = "X".repeat(1025);
    let reason = String::from_str(&ctx.env, &oversized);
    let result = ctx.client.try_flag_document(&ctx.admin, &id, &reason);
    assert_eq!(result, Err(Ok(crate::errors::DocumentError::FieldTooLong)));
}

/// flag_document accepts a reason string exactly at the 1 024-byte limit.
#[test]
fn test_flag_document_accepts_reason_at_limit() {
    let ctx = setup();
    let (id, _) = ctx.register(&ctx.shipper, ctx.shipment_id);
    ctx.client.verify_document(&ctx.admin, &id);

    let max_reason: std::string::String = "X".repeat(1024);
    let reason = String::from_str(&ctx.env, &max_reason);
    // Must not return FieldTooLong.
    ctx.client.flag_document(&ctx.admin, &id, &reason);
}
