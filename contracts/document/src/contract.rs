//! The contract's ABI surface.
//!
//! Every entrypoint is declared here in one `#[contractimpl]` block so the
//! externally callable interface can be read in one place; the logic behind
//! each one lives in [`crate::registry`] or [`crate::verification`].

use soroban_sdk::{contract, contractimpl, Address, Bytes, BytesN, Env, Vec};

use crate::errors::DocumentError;
use crate::types::{DataKey, DocumentRecord, DocumentType};
use crate::{registry, storage, verification};

#[contract]
pub struct DocumentContract;

#[contractimpl]
impl DocumentContract {
    /// One-time setup.
    ///
    /// `shipment_contract` is the shipment contract every `register_document`
    /// call validates its `shipment_id` against.
    pub fn initialize(
        env: Env,
        admin: Address,
        shipment_contract: Address,
    ) -> Result<(), DocumentError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(DocumentError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::ShipmentContract, &shipment_contract);
        env.storage().persistent().set(&DataKey::Counter, &0u64);
        Ok(())
    }

    /// Admin-only: repoint this registry at a different shipment contract
    /// (e.g. after the shipment contract is redeployed).
    pub fn set_shipment_contract(
        env: Env,
        shipment_contract: Address,
    ) -> Result<(), DocumentError> {
        storage::admin(&env)?.require_auth();
        env.storage()
            .instance()
            .set(&DataKey::ShipmentContract, &shipment_contract);
        Ok(())
    }

    /// Anchor a document to a shipment. See [`registry::register`].
    pub fn register_document(
        env: Env,
        uploader: Address,
        shipment_id: u64,
        doc_type: DocumentType,
        content_hash: BytesN<32>,
        ipfs_cid: Bytes,
    ) -> Result<u64, DocumentError> {
        registry::register(
            &env,
            uploader,
            shipment_id,
            doc_type,
            content_hash,
            ipfs_cid,
        )
    }

    /// Admin marks a document authentic. See [`verification::verify`].
    pub fn verify_document(env: Env, verifier: Address, doc_id: u64) -> Result<(), DocumentError> {
        verification::verify(&env, verifier, doc_id)
    }

    /// Check a hash against the registered one. See [`verification::check_integrity`].
    pub fn check_integrity(
        env: Env,
        doc_id: u64,
        hash_to_check: BytesN<32>,
    ) -> Result<bool, DocumentError> {
        verification::check_integrity(&env, doc_id, hash_to_check)
    }

    pub fn get_document(env: Env, doc_id: u64) -> Result<DocumentRecord, DocumentError> {
        storage::load(&env, doc_id)
    }

    pub fn get_documents_by_shipment(env: Env, shipment_id: u64) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::ShipmentDocs(shipment_id))
            .unwrap_or_else(|| Vec::new(&env))
    }

    pub fn get_total_documents(env: Env) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::Counter)
            .unwrap_or(0)
    }

    /// The shipment contract this registry validates against.
    pub fn get_shipment_contract(env: Env) -> Result<Address, DocumentError> {
        storage::shipment_contract(&env)
    }
}
