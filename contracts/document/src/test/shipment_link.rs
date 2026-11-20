//! CONTRACT-40: `register_document` must prove the shipment exists and that
//! the uploader is a party to it, via a real cross-contract call.

use soroban_sdk::testutils::Address as _;
use soroban_sdk::Address;

use super::setup;
use crate::errors::DocumentError;
use crate::shipment::{ShipmentClient, ShipmentStatus};
use crate::types::{DocumentType, HashAlgorithm};

#[test]
fn test_register_against_nonexistent_shipment_fails() {
    let ctx = setup();

    let result = ctx.client.try_register_document(
        &ctx.shipper,
        &9_999u64,
        &DocumentType::BillOfLading,
        &ctx.fake_hash(),
        &HashAlgorithm::Sha256,
        &ctx.fake_cid(),
    );

    assert_eq!(result, Err(Ok(DocumentError::ShipmentNotFound)));
    assert_eq!(ctx.client.get_total_documents(), 0);
    assert!(ctx
        .client
        .get_documents_by_shipment(&9_999u64, &0, &10)
        .is_empty());
}

#[test]
fn test_register_by_non_party_fails() {
    let ctx = setup();
    let stranger = Address::generate(&ctx.env);

    let result = ctx.client.try_register_document(
        &stranger,
        &ctx.shipment_id,
        &DocumentType::BillOfLading,
        &ctx.fake_hash(),
        &HashAlgorithm::Sha256,
        &ctx.fake_cid(),
    );

    assert_eq!(result, Err(Ok(DocumentError::NotShipmentParty)));
    assert_eq!(ctx.client.get_total_documents(), 0);
}

#[test]
fn test_both_shipper_and_carrier_may_upload() {
    let ctx = setup();

    ctx.register(&ctx.shipper, ctx.shipment_id);
    ctx.register(&ctx.carrier, ctx.shipment_id);

    assert_eq!(ctx.client.get_total_documents(), 2);
}

#[test]
fn test_carrier_of_another_shipment_is_not_a_party() {
    let ctx = setup();

    // A second shipment the carrier never accepted.
    let other = ctx.new_shipment();

    let result = ctx.client.try_register_document(
        &ctx.carrier,
        &other,
        &DocumentType::BillOfLading,
        &ctx.fake_hash(),
        &HashAlgorithm::Sha256,
        &ctx.fake_cid(),
    );

    assert_eq!(result, Err(Ok(DocumentError::NotShipmentParty)));
}

#[test]
fn test_unaccepted_shipment_still_accepts_shipper_uploads() {
    let ctx = setup();
    let other = ctx.new_shipment(); // carrier is None

    let (id, _) = ctx.register(&ctx.shipper, other);
    assert_eq!(ctx.client.get_document(&id).shipment_id, other);
}

#[test]
fn test_registry_can_be_repointed_at_another_shipment_contract() {
    let ctx = setup();

    // A fresh shipment contract that knows nothing about `ctx.shipment_id`.
    let other_addr = ctx.env.register(shipment::ShipmentContract {}, ());
    shipment::ShipmentContractClient::new(&ctx.env, &other_addr).initialize(&ctx.admin);

    ctx.client.set_shipment_contract(&other_addr);
    assert_eq!(ctx.client.get_shipment_contract(), other_addr);

    let result = ctx.client.try_register_document(
        &ctx.shipper,
        &ctx.shipment_id,
        &DocumentType::BillOfLading,
        &ctx.fake_hash(),
        &HashAlgorithm::Sha256,
        &ctx.fake_cid(),
    );
    assert_eq!(result, Err(Ok(DocumentError::ShipmentNotFound)));
}

/// The `Shipment` type in [`crate::shipment`] mirrors the shipment contract's
/// own definition by hand. If the two ever drift, this decode fails — which is
/// exactly what would otherwise break `register_document` in production.
#[test]
fn test_mirrored_shipment_type_matches_the_real_contract() {
    let ctx = setup();

    let mirrored =
        ShipmentClient::new(&ctx.env, &ctx.shipment.address).get_shipment(&ctx.shipment_id);
    let real = ctx.shipment.get_shipment(&ctx.shipment_id);

    assert_eq!(mirrored.id, real.id);
    assert_eq!(mirrored.shipper, real.shipper);
    assert_eq!(mirrored.carrier, real.carrier);
    assert_eq!(mirrored.origin, real.origin);
    assert_eq!(mirrored.destination, real.destination);
    assert_eq!(mirrored.cargo_description, real.cargo_description);
    assert_eq!(mirrored.weight_kg, real.weight_kg);
    assert_eq!(mirrored.price, real.price);
    assert_eq!(mirrored.created_at, real.created_at);
    assert_eq!(mirrored.updated_at, real.updated_at);

    // The status enum is mirrored too, variant for variant.
    assert_eq!(mirrored.status, ShipmentStatus::Accepted);
    assert_eq!(real.status, shipment::ShipmentStatus::Accepted);
}
