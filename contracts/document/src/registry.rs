//! Registering a document against a shipment.

use soroban_sdk::{Address, Bytes, BytesN, Env, Vec};

use crate::errors::DocumentError;
use crate::shipment::{Shipment, ShipmentClient};
use crate::types::{DataKey, DocumentRecord, DocumentType, TTL_LEDGERS};
use crate::{events, storage};

/// Register a new document for a shipment.
///
/// `content_hash` — 32-byte SHA-256 hash of the document file.
/// `ipfs_cid`     — IPFS CID (as bytes) pointing to the full document.
///
/// The shipment must exist in the configured shipment contract, and
/// `uploader` must be a party to it (its shipper or its carrier). Without both
/// checks a document could be anchored to a nonexistent or unrelated shipment,
/// which is exactly the claim this registry exists to make trustworthy.
pub fn register(
    env: &Env,
    uploader: Address,
    shipment_id: u64,
    doc_type: DocumentType,
    content_hash: BytesN<32>,
    ipfs_cid: Bytes,
) -> Result<u64, DocumentError> {
    uploader.require_auth();
    storage::require_not_paused(env)?;

    let shipment = fetch_shipment(env, shipment_id)?;
    if !shipment.is_party(&uploader) {
        return Err(DocumentError::NotShipmentParty);
    }

    let id = storage::next_id(env);
    let doc = DocumentRecord {
        id,
        shipment_id,
        uploader,
        doc_type,
        content_hash,
        ipfs_cid,
        uploaded_at: env.ledger().timestamp(),
        is_verified: false,
        verified_by: None,
        verified_at: 0,
        flagged_by: None,
        flagged_at: 0,
        flag_reason: None,
    };

    storage::store(env, &doc);

    // Append to the shipment's document list.
    let mut list: Vec<u64> = env
        .storage()
        .persistent()
        .get(&DataKey::ShipmentDocs(shipment_id))
        .unwrap_or_else(|| Vec::new(env));
    list.push_back(id);
    env.storage()
        .persistent()
        .set(&DataKey::ShipmentDocs(shipment_id), &list);
    env.storage().persistent().extend_ttl(
        &DataKey::ShipmentDocs(shipment_id),
        TTL_LEDGERS,
        TTL_LEDGERS,
    );

    events::registered(env, &doc);
    Ok(id)
}

/// Cross-contract read of `shipment_id` from the configured shipment contract,
/// mapping "no such shipment" onto a typed error instead of letting the
/// callee's trap unwind this contract.
fn fetch_shipment(env: &Env, shipment_id: u64) -> Result<Shipment, DocumentError> {
    let client = ShipmentClient::new(env, &storage::shipment_contract(env)?);

    client
        .try_get_shipment(&shipment_id)
        // The shipment contract returned an error — the id is unknown.
        .map_err(|_| DocumentError::ShipmentNotFound)?
        // A decode failure means our mirrored `Shipment` has drifted from the
        // shipment contract's; that is a deployment bug, not user input.
        .map_err(|_| DocumentError::ShipmentNotFound)
}
