#![no_std]

//! Document Registry Contract
//!
//! Stores tamper-proof hashes of freight documents (Bill of Lading, Proof of
//! Delivery, Invoices, etc.) on-chain. The IPFS CID provides the location of
//! the full document; the on-chain hash proves the document has not been
//! altered since it was registered.
//!
//! Enhancements over the base version:
//! - Documents move through a Pending -> Verified/Rejected workflow instead
//!   of a single boolean, with an optional rejection reason.
//! - Every state-changing action emits an event for off-chain indexing.
//! - Admin key can be rotated via `transfer_admin`.
//! - `register_document` validates that the IPFS CID isn't empty.
//! - Shipment document lists can be read page-by-page so a shipment with
//!   many documents doesn't force callers to load one huge vector.
//! - TTL bumps use a threshold/extend-to pair so storage isn't re-written
//!   on every single read/write once it's already got plenty of life left.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Bytes, BytesN,
    Env, String, Vec,
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
    NotPending = 5,
    HashMismatch = 6,
    InvalidInput = 7,
    SameAdmin = 8,
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

/// Lifecycle state of a document. A document starts Pending and can move to
/// Verified or Rejected exactly once — after that the decision is final.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DocumentStatus {
    Pending,
    Verified,
    Rejected,
}

/// A registered document record.
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
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
    pub status: DocumentStatus,
    /// Who verified or rejected the document (None while Pending).
    pub decided_by: Option<Address>,
    /// When the verify/reject decision was made (0 while Pending).
    pub decided_at: u64,
    /// Populated only when status is Rejected.
    pub rejection_reason: Option<String>,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Counter,
    Document(u64),
    ShipmentDocs(u64), // shipment_id → Vec<u64> of doc IDs
}

/// Total lifetime an entry is bumped to when refreshed (~1 year in ledgers).
const TTL_EXTEND_TO: u32 = 6_307_200;
/// Only bump the TTL once remaining life falls below this — avoids paying
/// for a storage write on every single touch of an entry that already has
/// plenty of life left.
const TTL_THRESHOLD: u32 = 6_307_200 - 518_400; // re-bump inside the last ~30 days

/// Max documents returned by a single paginated shipment-docs query.
const MAX_PAGE_SIZE: u32 = 100;

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

    /// Rotate the admin key. Only the current admin can do this.
    pub fn transfer_admin(env: Env, current_admin: Address, new_admin: Address) -> Result<(), DocumentError> {
        let admin = Self::get_admin(env.clone())?;
        if current_admin != admin {
            return Err(DocumentError::Unauthorized);
        }
        if new_admin == admin {
            return Err(DocumentError::SameAdmin);
        }
        current_admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &new_admin);

        env.events().publish(
            (symbol_short!("admin_chg"),),
            (current_admin, new_admin),
        );
        Ok(())
    }

    pub fn get_admin(env: Env) -> Result<Address, DocumentError> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(DocumentError::NotInitialized)
    }

    // ── Document registration ─────────────────────────────────────────────

    /// Register a new document for a shipment.
    ///
    /// `content_hash` — 32-byte SHA-256 hash of the document file.
    /// `ipfs_cid`     — IPFS CID (as bytes) pointing to the full document. Must not be empty.
    pub fn register_document(
        env: Env,
        uploader: Address,
        shipment_id: u64,
        doc_type: DocumentType,
        content_hash: BytesN<32>,
        ipfs_cid: Bytes,
    ) -> Result<u64, DocumentError> {
        uploader.require_auth();

        if ipfs_cid.is_empty() {
            return Err(DocumentError::InvalidInput);
        }

        let id = Self::next_id(&env);
        let now = env.ledger().timestamp();

        let doc = DocumentRecord {
            id,
            shipment_id,
            uploader: uploader.clone(),
            doc_type,
            content_hash,
            ipfs_cid,
            uploaded_at: now,
            status: DocumentStatus::Pending,
            decided_by: None,
            decided_at: 0,
            rejection_reason: None,
        };

        Self::store(&env, &doc);

        // Append to shipment's document list.
        let key = DataKey::ShipmentDocs(shipment_id);
        let mut list: Vec<u64> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| Vec::new(&env));
        list.push_back(id);
        env.storage().persistent().set(&key, &list);
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);

        env.events().publish(
            (symbol_short!("reg_doc"), id),
            (shipment_id, uploader),
        );

        Ok(id)
    }

    // ── Verification ──────────────────────────────────────────────────────

    /// Admin verifies that a document is authentic. Once decided (verified
    /// or rejected) the record is final.
    pub fn verify_document(env: Env, verifier: Address, doc_id: u64) -> Result<(), DocumentError> {
        let admin = Self::get_admin(env.clone())?;
        if verifier != admin {
            return Err(DocumentError::Unauthorized);
        }
        verifier.require_auth();

        let mut doc = Self::load(&env, doc_id)?;
        if doc.status != DocumentStatus::Pending {
            return Err(DocumentError::NotPending);
        }

        doc.status = DocumentStatus::Verified;
        doc.decided_by = Some(verifier.clone());
        doc.decided_at = env.ledger().timestamp();
        Self::store(&env, &doc);

        env.events()
            .publish((symbol_short!("doc_verif"), doc_id), verifier);
        Ok(())
    }

    /// Admin rejects a document (e.g. hash doesn't match the physical
    /// paperwork, or the upload was fraudulent). Once decided the record
    /// is final — a corrected document should be registered as a new entry.
    pub fn reject_document(
        env: Env,
        verifier: Address,
        doc_id: u64,
        reason: String,
    ) -> Result<(), DocumentError> {
        let admin = Self::get_admin(env.clone())?;
        if verifier != admin {
            return Err(DocumentError::Unauthorized);
        }
        verifier.require_auth();

        let mut doc = Self::load(&env, doc_id)?;
        if doc.status != DocumentStatus::Pending {
            return Err(DocumentError::NotPending);
        }

        doc.status = DocumentStatus::Rejected;
        doc.decided_by = Some(verifier.clone());
        doc.decided_at = env.ledger().timestamp();
        doc.rejection_reason = Some(reason);
        Self::store(&env, &doc);

        env.events()
            .publish((symbol_short!("doc_rej"), doc_id), verifier);
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

    /// Full list of document IDs for a shipment. Fine for shipments with a
    /// modest number of documents; for large shipments prefer
    /// `get_documents_by_shipment_page`.
    pub fn get_documents_by_shipment(env: Env, shipment_id: u64) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::ShipmentDocs(shipment_id))
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Page through a shipment's document IDs. `offset` is the starting
    /// index, `limit` is capped at `MAX_PAGE_SIZE` regardless of what's
    /// requested.
    pub fn get_documents_by_shipment_page(
        env: Env,
        shipment_id: u64,
        offset: u32,
        limit: u32,
    ) -> Vec<u64> {
        let all: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::ShipmentDocs(shipment_id))
            .unwrap_or_else(|| Vec::new(&env));

        let capped_limit = limit.min(MAX_PAGE_SIZE);
        let mut page = Vec::new(&env);
        let mut i = offset;
        let end = offset.saturating_add(capped_limit).min(all.len());
        while i < end {
            page.push_back(all.get(i).unwrap());
            i += 1;
        }
        page
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
        let key = DataKey::Document(doc.id);
        env.storage().persistent().set(&key, doc);
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
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
            .extend_ttl(&DataKey::Counter, TTL_THRESHOLD, TTL_EXTEND_TO);
        next
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, BytesN as _},
        Bytes, BytesN, Env, String,
    };

    fn setup() -> (Env, Address, DocumentContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let id = env.register(DocumentContract {}, ());
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
        assert_eq!(doc.status, DocumentStatus::Pending);
        assert!(doc.decided_by.is_none());
    }

    #[test]
    fn test_register_document_rejects_empty_cid() {
        let (env, _, client) = setup();
        let uploader = Address::generate(&env);

        let result = client.try_register_document(
            &uploader,
            &1u64,
            &DocumentType::BillOfLading,
            &fake_hash(&env),
            &Bytes::new(&env),
        );
        assert_eq!(result, Err(Ok(DocumentError::InvalidInput)));
    }

    #[test]
    fn test_verify_document() {
        let (env, admin, client) = setup();
        let uploader = Address::generate(&env);

        let (id, _) = register(&env, &client, &uploader, 1);

        client.verify_document(&admin, &id);

        let doc = client.get_document(&id);
        assert_eq!(doc.status, DocumentStatus::Verified);
        assert_eq!(doc.decided_by, Some(admin));
    }

    #[test]
    fn test_reject_document() {
        let (env, admin, client) = setup();
        let uploader = Address::generate(&env);
        let (id, _) = register(&env, &client, &uploader, 1);

        let reason = String::from_str(&env, "hash does not match physical BOL");
        client.reject_document(&admin, &id, &reason);

        let doc = client.get_document(&id);
        assert_eq!(doc.status, DocumentStatus::Rejected);
        assert_eq!(doc.decided_by, Some(admin));
        assert_eq!(doc.rejection_reason, Some(reason));
    }

    #[test]
    fn test_double_decide_fails() {
        let (env, admin, client) = setup();
        let uploader = Address::generate(&env);
        let (id, _) = register(&env, &client, &uploader, 1);

        client.verify_document(&admin, &id);
        let result = client.try_verify_document(&admin, &id);
        assert_eq!(result, Err(Ok(DocumentError::NotPending)));

        let reason = String::from_str(&env, "too late");
        let result = client.try_reject_document(&admin, &id, &reason);
        assert_eq!(result, Err(Ok(DocumentError::NotPending)));
    }

    #[test]
    fn test_non_admin_verify_fails() {
        let (env, _, client) = setup();
        let uploader = Address::generate(&env);
        let (id, _) = register(&env, &client, &uploader, 1);

        let stranger = Address::generate(&env);
        let result = client.try_verify_document(&stranger, &id);
        assert_eq!(result, Err(Ok(DocumentError::Unauthorized)));
    }

    #[test]
    fn test_transfer_admin() {
        let (env, admin, client) = setup();
        let new_admin = Address::generate(&env);

        client.transfer_admin(&admin, &new_admin);
        assert_eq!(client.get_admin(), new_admin);

        // Old admin can no longer verify; new admin can.
        let uploader = Address::generate(&env);
        let (id, _) = register(&env, &client, &uploader, 1);
        let result = client.try_verify_document(&admin, &id);
        assert_eq!(result, Err(Ok(DocumentError::Unauthorized)));

        client.verify_document(&new_admin, &id);
        assert_eq!(client.get_document(&id).status, DocumentStatus::Verified);
    }

    #[test]
    fn test_transfer_admin_rejects_same_admin() {
        let (env, admin, client) = setup();
        let result = client.try_transfer_admin(&admin, &admin);
        assert_eq!(result, Err(Ok(DocumentError::SameAdmin)));
    }

    #[test]
    fn test_integrity_check_pass() {
        let (env, _, client) = setup();
        let uploader = Address::generate(&env);
        let (id, original_hash) = register(&env, &client, &uploader, 1);

        assert!(client.check_integrity(&id, &original_hash));
    }

    #[test]
    fn test_integrity_check_tampered() {
        let (env, _, client) = setup();
        let uploader = Address::generate(&env);
        let (id, _) = register(&env, &client, &uploader, 1);

        let tampered_hash = BytesN::random(&env);
        assert!(!client.check_integrity(&id, &tampered_hash));
    }

    #[test]
    fn test_multiple_docs_per_shipment() {
        let (env, _, client) = setup();
        let uploader = Address::generate(&env);

        let (id1, _) = register(&env, &client, &uploader, 7);
        let hash2 = fake_hash(&env);
        let id2 = client.register_document(
            &uploader,
            &7u64,
            &DocumentType::ProofOfDelivery,
            &hash2,
            &fake_cid(&env),
        );

        let docs = client.get_documents_by_shipment(&7u64);
        assert_eq!(docs.len(), 2);
        assert_eq!(docs.get(0).unwrap(), id1);
        assert_eq!(docs.get(1).unwrap(), id2);
    }

    #[test]
    fn test_shipment_docs_pagination() {
        let (env, _, client) = setup();
        let uploader = Address::generate(&env);

        let mut ids = Vec::new(&env);
        for _ in 0..5 {
            let hash = fake_hash(&env);
            let id = client.register_document(
                &uploader,
                &9u64,
                &DocumentType::Photo,
                &hash,
                &fake_cid(&env),
            );
            ids.push_back(id);
        }

        let page1 = client.get_documents_by_shipment_page(&9u64, &0u32, &2u32);
        assert_eq!(page1.len(), 2);
        assert_eq!(page1.get(0).unwrap(), ids.get(0).unwrap());
        assert_eq!(page1.get(1).unwrap(), ids.get(1).unwrap());

        let page2 = client.get_documents_by_shipment_page(&9u64, &2u32, &2u32);
        assert_eq!(page2.len(), 2);
        assert_eq!(page2.get(0).unwrap(), ids.get(2).unwrap());

        let page3 = client.get_documents_by_shipment_page(&9u64, &4u32, &2u32);
        assert_eq!(page3.len(), 1);
        assert_eq!(page3.get(0).unwrap(), ids.get(4).unwrap());

        let page4 = client.get_documents_by_shipment_page(&9u64, &5u32, &2u32);
        assert_eq!(page4.len(), 0);
    }

    #[test]
    fn test_all_document_types() {
        let (env, _, client) = setup();
        let uploader = Address::generate(&env);

        let types = [
            DocumentType::BillOfLading,
            DocumentType::ProofOfDelivery,
            DocumentType::Invoice,
            DocumentType::CustomsDeclaration,
            DocumentType::InsuranceCertificate,
            DocumentType::Photo,
            DocumentType::Other,
        ];

        for doc_type in types {
            let id = client.register_document(
                &uploader,
                &1u64,
                &doc_type,
                &fake_hash(&env),
                &fake_cid(&env),
            );
            let doc = client.get_document(&id);
            assert_eq!(doc.doc_type, doc_type);
        }
    }

    #[test]
    fn test_not_found_error() {
        let (_, _, client) = setup();
        let result = client.try_get_document(&404u64);
        assert_eq!(result, Err(Ok(DocumentError::NotFound)));
    }
}