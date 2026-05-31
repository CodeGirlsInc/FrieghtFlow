#![no_std]

//! Bulk Document Registration Contract (CT-12)
//!
//! Registers multiple documents atomically in a single transaction.
//! Maximum 10 documents per batch. Fails entirely if any document is invalid.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, BytesN, Env, String, Vec,
};

// ── Errors ────────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum BulkDocumentError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    BatchLimitExceeded = 3,
    HashAlreadyRegistered = 4,
}

// ── Types ─────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct DocumentEntry {
    pub hash: BytesN<32>,
    pub doc_type: String,
    pub ipfs_cid: String,
    pub expires_at: Option<u64>,
}

#[contracttype]
pub enum DataKey {
    Counter,
    Hash(BytesN<32>), // tracks registered hashes for uniqueness
}

const MAX_BATCH: u32 = 10;
const TTL_LEDGERS: u32 = 6_307_200;

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct DocumentBulkContract;

#[contractimpl]
impl DocumentBulkContract {
    pub fn initialize(env: Env) -> Result<(), BulkDocumentError> {
        if env.storage().persistent().has(&DataKey::Counter) {
            return Err(BulkDocumentError::AlreadyInitialized);
        }
        env.storage().persistent().set(&DataKey::Counter, &0u64);
        Ok(())
    }

    /// Register multiple documents atomically.
    ///
    /// - Max 10 documents per batch; exceeding returns `BatchLimitExceeded`.
    /// - Any duplicate hash returns `HashAlreadyRegistered` and rolls back the entire batch.
    /// - Returns the list of document IDs created.
    pub fn register_documents_batch(
        env: Env,
        docs: Vec<DocumentEntry>,
    ) -> Result<Vec<BytesN<32>>, BulkDocumentError> {
        if docs.len() > MAX_BATCH {
            return Err(BulkDocumentError::BatchLimitExceeded);
        }

        // Validate all docs before writing anything (atomicity).
        // Check against already-registered hashes AND within-batch duplicates.
        let mut batch_hashes: Vec<BytesN<32>> = Vec::new(&env);
        for i in 0..docs.len() {
            let entry = docs.get(i).unwrap();
            // Already on-chain?
            if env
                .storage()
                .persistent()
                .has(&DataKey::Hash(entry.hash.clone()))
            {
                return Err(BulkDocumentError::HashAlreadyRegistered);
            }
            // Duplicate within this batch?
            if batch_hashes.contains(&entry.hash) {
                return Err(BulkDocumentError::HashAlreadyRegistered);
            }
            batch_hashes.push_back(entry.hash.clone());
        }

        // All valid — commit.
        let mut ids: Vec<BytesN<32>> = Vec::new(&env);
        for i in 0..docs.len() {
            let entry = docs.get(i).unwrap();
            env.storage()
                .persistent()
                .set(&DataKey::Hash(entry.hash.clone()), &true);
            env.storage().persistent().extend_ttl(
                &DataKey::Hash(entry.hash.clone()),
                TTL_LEDGERS,
                TTL_LEDGERS,
            );
            ids.push_back(entry.hash);
        }

        Ok(ids)
    }

    /// Returns true if the given hash has been registered.
    pub fn is_registered(env: Env, hash: BytesN<32>) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::Hash(hash))
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{
        testutils::BytesN as _,
        BytesN, Env, String, Vec,
    };

    fn setup() -> (Env, DocumentBulkContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let id = env.register(DocumentBulkContract {}, ());
        let client = DocumentBulkContractClient::new(&env, &id);
        client.initialize();
        (env, client)
    }

    fn make_entry(env: &Env, hash: BytesN<32>) -> DocumentEntry {
        DocumentEntry {
            hash,
            doc_type: String::from_str(env, "BillOfLading"),
            ipfs_cid: String::from_str(env, "QmFake"),
            expires_at: None,
        }
    }

    fn make_docs(env: &Env, n: u32) -> Vec<DocumentEntry> {
        let mut docs = Vec::new(env);
        for _ in 0..n {
            docs.push_back(make_entry(env, BytesN::random(env)));
        }
        docs
    }

    #[test]
    fn test_valid_batch_of_5() {
        let (env, client) = setup();
        let docs = make_docs(&env, 5);
        let ids = client.register_documents_batch(&docs);
        assert_eq!(ids.len(), 5);
        // Each returned ID should be registered
        for i in 0..ids.len() {
            assert!(client.is_registered(&ids.get(i).unwrap()));
        }
    }

    #[test]
    fn test_batch_exceeding_10_returns_error() {
        let (env, client) = setup();
        let docs = make_docs(&env, 11);
        let result = client.try_register_documents_batch(&docs);
        assert_eq!(result, Err(Ok(BulkDocumentError::BatchLimitExceeded)));
    }

    #[test]
    fn test_duplicate_hash_causes_full_rollback() {
        let (env, client) = setup();
        let hash = BytesN::random(&env);

        // First register the hash alone
        let single = {
            let mut v = Vec::new(&env);
            v.push_back(make_entry(&env, hash.clone()));
            v
        };
        client.register_documents_batch(&single);

        // Now try a batch that includes the already-registered hash
        let mut docs = make_docs(&env, 4);
        docs.push_back(make_entry(&env, hash.clone())); // duplicate

        let result = client.try_register_documents_batch(&docs);
        assert_eq!(result, Err(Ok(BulkDocumentError::HashAlreadyRegistered)));

        // The 4 new hashes from the failed batch must NOT be registered
        for i in 0..4 {
            assert!(!client.is_registered(&docs.get(i).unwrap().hash));
        }
    }

    #[test]
    fn test_within_batch_duplicate_causes_rollback() {
        let (env, client) = setup();
        let dup_hash = BytesN::random(&env);

        let mut docs = Vec::new(&env);
        docs.push_back(make_entry(&env, BytesN::random(&env)));
        docs.push_back(make_entry(&env, dup_hash.clone()));
        docs.push_back(make_entry(&env, dup_hash.clone())); // duplicate within batch

        let result = client.try_register_documents_batch(&docs);
        assert_eq!(result, Err(Ok(BulkDocumentError::HashAlreadyRegistered)));

        // Nothing should be registered
        assert!(!client.is_registered(&dup_hash));
    }

    #[test]
    fn test_batch_of_exactly_10_succeeds() {
        let (env, client) = setup();
        let docs = make_docs(&env, 10);
        let ids = client.register_documents_batch(&docs);
        assert_eq!(ids.len(), 10);
    }
}
