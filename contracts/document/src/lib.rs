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

    
    // ── Verification ──────────────────────────────────────────────────────

    /// Admin verifies that a document is authentic.
    /// Once verified the record is immutable.
    pub fn verify_document(
        env: Env,
        verifier: Address,
        doc_id: u64,
    ) -> Result<(), DocumentError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(DocumentError::NotInitialized)?;

        // Only admin can verify.
        if verifier != admin {
            return Err(DocumentError::Unauthorized);
        }
        verifier.require_auth();

        let mut doc = Self::load(&env, doc_id)?;

        if doc.is_verified {
            return Err(DocumentError::AlreadyVerified);
        }

        doc.is_verified = true;
        doc.verified_by = Some(verifier);
        doc.verified_at = env.ledger().timestamp();
        Self::store(&env, &doc);
        Ok(())
    }

    // ── Integrity check ───────────────────────────────────────────────────

    /// Verify that a given hash matches the registered content_hash.
    /// Returns `true` if the hash matches, `false` otherwise.
    /// This lets anyone prove a document is untampered without downloading
    /// the full file from IPFS.
    pub fn check_integrity(
        env: Env,
        doc_id: u64,
        hash_to_check: BytesN<32>,
    ) -> Result<bool, DocumentError> {
        let doc = Self::load(&env, doc_id)?;
        Ok(doc.content_hash == hash_to_check)
    }

    // ── Queries ───────────────────────────────────────────────────────────

    pub fn get_document(env: Env, doc_id: u64) -> Result<DocumentRecord, DocumentError> {
        Self::load(&env, doc_id)
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

    // ── Helpers ───────────────────────────────────────────────────────────

    fn load(env: &Env, id: u64) -> Result<DocumentRecord, DocumentError> {
        env.storage()
            .persistent()
            .get(&DataKey::Document(id))
            .ok_or(DocumentError::NotFound)
    }

    fn store(env: &Env, doc: &DocumentRecord) {
        env.storage()
            .persistent()
            .set(&DataKey::Document(doc.id), doc);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Document(doc.id), TTL_LEDGERS, TTL_LEDGERS);
    }

    fn next_id(env: &Env) -> u64 {
        let current: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::Counter)
            .unwrap_or(0);
        let next = current + 1;
        env.storage().persistent().set(&DataKey::Counter, &next);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Counter, TTL_LEDGERS, TTL_LEDGERS);
        next
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, BytesN as _},
        Bytes, BytesN, Env,
    };

    fn setup() -> (Env, Address, DocumentContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let id = env.register_contract(None, DocumentContract);
        let client = DocumentContractClient::new(&env, &id);
        client.initialize(&admin);
        (env, admin, client)
    }

    fn fake_hash(env: &Env) -> BytesN<32> {
        BytesN::random(env)
    }

    fn fake_cid(env: &Env) -> Bytes {
        // Simulate a CIDv0 string encoded as bytes.
        Bytes::from_slice(env, b"QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG")
    }

    fn register(
        env: &Env,
        client: &DocumentContractClient,
        uploader: &Address,
        shipment_id: u64,
    ) -> (u64, BytesN<32>) {
        let hash = fake_hash(env);
        let id = client.register_document(
            uploader,
            &shipment_id,
            &DocumentType::BillOfLading,
            &hash,
            &fake_cid(env),
        );
        (id, hash)
    }

    #[test]
    fn test_register_document() {
        let (env, _, client) = setup();
        let uploader = Address::generate(&env);

        let (id, hash) = register(&env, &client, &uploader, 1);

        assert_eq!(id, 1);
        assert_eq!(client.get_total_documents(), 1);

        let doc = client.get_document(&id);
        assert_eq!(doc.id, 1);
        assert_eq!(doc.shipment_id, 1);
        assert_eq!(doc.uploader, uploader);
        assert_eq!(doc.doc_type, DocumentType::BillOfLading);
        assert_eq!(doc.content_hash, hash);
        assert!(!doc.is_verified);
        assert!(doc.verified_by.is_none());
    }
