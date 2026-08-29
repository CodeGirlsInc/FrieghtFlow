use soroban_sdk::{
    testutils::{Address as _, BytesN as _},
    Address, BytesN,
};

use super::setup;
use crate::errors::DocumentError;

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
