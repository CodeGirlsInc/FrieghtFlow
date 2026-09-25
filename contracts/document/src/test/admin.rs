use soroban_sdk::testutils::Address as _;
use soroban_sdk::Address;

use super::setup;
use crate::errors::DocumentError;
use crate::types::{DocumentType, HashAlgorithm};

#[test]
fn test_admin_rotation_and_pause_block_uploads() {
    let ctx = setup();
    let new_admin = Address::generate(&ctx.env);

    ctx.client.rotate_admin(&ctx.admin, &new_admin);
    ctx.client.pause(&new_admin);

    let result = ctx.client.try_register_document(
        &ctx.shipper,
        &ctx.shipment_id,
        &DocumentType::Invoice,
        &ctx.fake_hash(),
        &HashAlgorithm::Sha256,
        &ctx.fake_cid(),
    );
    assert_eq!(result, Err(Ok(DocumentError::Paused)));

    ctx.client.unpause(&new_admin);
    let id = ctx.client.register_document(
        &ctx.shipper,
        &ctx.shipment_id,
        &DocumentType::Invoice,
        &ctx.fake_hash(),
        &HashAlgorithm::Sha256,
        &ctx.fake_cid(),
    );
    assert_eq!(id, 1);
}

#[test]
fn test_rotate_admin_requires_current_admin() {
    let ctx = setup();
    let impostor = Address::generate(&ctx.env);
    let new_admin = Address::generate(&ctx.env);

    let result = ctx.client.try_rotate_admin(&impostor, &new_admin);
    assert_eq!(result, Err(Ok(DocumentError::Unauthorized)));
}

// --- Issue #1450: set_shipment_contract must check require_not_paused ---

/// set_shipment_contract is now blocked while the contract is paused,
/// matching the behaviour of EscrowContract::set_shipment_contract.
#[test]
fn test_set_shipment_contract_blocked_when_paused() {
    let ctx = setup();
    ctx.client.pause(&ctx.admin);

    let new_shipment = Address::generate(&ctx.env);
    let result = ctx.client.try_set_shipment_contract(&new_shipment);
    assert_eq!(result, Err(Ok(DocumentError::Paused)));
}

/// set_shipment_contract succeeds when the contract is unpaused.
#[test]
fn test_set_shipment_contract_succeeds_when_unpaused() {
    let ctx = setup();
    let new_shipment = Address::generate(&ctx.env);

    // Must not panic — contract is unpaused at this point.
    ctx.client.set_shipment_contract(&new_shipment);
}
