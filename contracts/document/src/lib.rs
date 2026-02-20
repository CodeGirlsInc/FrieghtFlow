#![no_std]

//! Document Registry Contract
//!
//! Stores tamper-proof hashes of freight documents (Bill of Lading, Proof of
//! Delivery, Invoices, etc.) on-chain.  The IPFS CID provides the location
//! of the full document; the on-chain hash proves the document has not been
//! altered since it was registered.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, Address, Bytes, BytesN, Env, Vec,
};

// ── Errors ────────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum DocumentError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    NotFound = 3,
    Unauthorized = 4,
    AlreadyVerified = 5,
    HashMismatch = 6,
}

// ── Types ─────────────────────────────────────────────────────────────────────

/// Categories of freight documents.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DocumentType {
    BillOfLading,
    ProofOfDelivery,
    Invoice,
    CustomsDeclaration,
    InsuranceCertificate,
    Photo,
    Other,
}

/// A registered document record.
#[contracttype]
#[derive(Clone, Debug)]
pub struct DocumentRecord {
    pub id: u64,
    pub shipment_id: u64,
    pub uploader: Address,
    pub doc_type: DocumentType,
    /// SHA-256 hash of the document content (32 bytes).
    pub content_hash: BytesN<32>,
    /// IPFS CID encoded as raw bytes (typically 46 bytes for CIDv0 / up to 59 for CIDv1).
    pub ipfs_cid: Bytes,
    pub uploaded_at: u64,
    pub is_verified: bool,
    pub verified_by: Option<Address>,
    pub verified_at: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Counter,
    Document(u64),
    ShipmentDocs(u64), // shipment_id → Vec<u64> of doc IDs
}

const TTL_LEDGERS: u32 = 6_307_200; // ~1 year

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct DocumentContract;

#[contractimpl]
impl DocumentContract {
    // ── Setup ─────────────────────────────────────────────────────────────

    pub fn initialize(env: Env, admin: Address) -> Result<(), DocumentError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(DocumentError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().persistent().set(&DataKey::Counter, &0u64);
        Ok(())
    }

    // ── Document registration ─────────────────────────────────────────────

    /// Register a new document for a shipment.
    ///
    /// `content_hash` — 32-byte SHA-256 hash of the document file.
    /// `ipfs_cid`     — IPFS CID (as bytes) pointing to the full document.
    pub fn register_document(
        env: Env,
        uploader: Address,
        shipment_id: u64,
        doc_type: DocumentType,
        content_hash: BytesN<32>,
        ipfs_cid: Bytes,
    ) -> Result<u64, DocumentError> {
        uploader.require_auth();

        let id = Self::next_id(&env);
        let now = env.ledger().timestamp();

        let doc = DocumentRecord {
            id,
            shipment_id,
            uploader,
            doc_type,
            content_hash,
            ipfs_cid,
            uploaded_at: now,
            is_verified: false,
            verified_by: None,
            verified_at: 0,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Document(id), &doc);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Document(id), TTL_LEDGERS, TTL_LEDGERS);

        // Append to shipment's document list.
        let mut list: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::ShipmentDocs(shipment_id))
            .unwrap_or_else(|| Vec::new(&env));
        list.push_back(id);
        env.storage()
            .persistent()
            .set(&DataKey::ShipmentDocs(shipment_id), &list);

        Ok(id)
    }
