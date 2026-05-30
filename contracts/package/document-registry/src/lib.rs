#![no_std]

//! Document Registry Contract with Expiry Support (CT-05)
//!
//! Stores tamper-proof document hashes on-chain with optional expiry timestamps.
//! Expired documents are preserved for audit purposes but marked as invalid.

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Bytes, BytesN, Env, String};

// ── Errors ────────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum DocumentError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    NotFound = 3,
    Unauthorized = 4,
    AlreadyRevoked = 5,
}

// ── Types ─────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DocumentStatus {
    Active,
    Expired,
    Revoked,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct DocumentRecord {
    pub id: u64,
    pub uploader: Address,
    pub content_hash: BytesN<32>,
    pub ipfs_cid: Bytes,
    pub doc_type: String,
    pub registered_at: u64,
    /// Unix timestamp after which the document is considered expired.
    /// None means permanently valid unless revoked.
    pub expires_at: Option<u64>,
    pub is_revoked: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Counter,
    Document(u64),
}

const TTL_LEDGERS: u32 = 6_307_200; // ~1 year

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct DocumentRegistryContract;

#[contractimpl]
impl DocumentRegistryContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), DocumentError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(DocumentError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().persistent().set(&DataKey::Counter, &0u64);
        Ok(())
    }

    /// Register a document with an optional expiry timestamp (Unix seconds).
    pub fn register_document(
        env: Env,
        uploader: Address,
        content_hash: BytesN<32>,
        ipfs_cid: Bytes,
        doc_type: String,
        expires_at: Option<u64>,
    ) -> Result<u64, DocumentError> {
        uploader.require_auth();

        let id = Self::next_id(&env);
        let doc = DocumentRecord {
            id,
            uploader,
            content_hash,
            ipfs_cid,
            doc_type,
            registered_at: env.ledger().timestamp(),
            expires_at,
            is_revoked: false,
        };

        env.storage().persistent().set(&DataKey::Document(id), &doc);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Document(id), TTL_LEDGERS, TTL_LEDGERS);

        Ok(id)
    }

    /// Returns false if the document is revoked or past its expiry timestamp.
    pub fn is_valid(env: Env, doc_id: u64) -> Result<bool, DocumentError> {
        let doc = Self::load(&env, doc_id)?;
        if doc.is_revoked {
            return Ok(false);
        }
        if let Some(expires_at) = doc.expires_at {
            if env.ledger().timestamp() > expires_at {
                return Ok(false);
            }
        }
        Ok(true)
    }

    /// Returns the document's current status: Active, Expired, or Revoked.
    pub fn get_document_status(env: Env, doc_id: u64) -> Result<DocumentStatus, DocumentError> {
        let doc = Self::load(&env, doc_id)?;
        if doc.is_revoked {
            return Ok(DocumentStatus::Revoked);
        }
        if let Some(expires_at) = doc.expires_at {
            if env.ledger().timestamp() > expires_at {
                return Ok(DocumentStatus::Expired);
            }
        }
        Ok(DocumentStatus::Active)
    }

    /// Admin revokes a document. The hash record is preserved for audit.
    pub fn revoke_document(env: Env, admin: Address, doc_id: u64) -> Result<(), DocumentError> {
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(DocumentError::NotInitialized)?;
        if admin != stored_admin {
            return Err(DocumentError::Unauthorized);
        }
        admin.require_auth();

        let mut doc = Self::load(&env, doc_id)?;
        if doc.is_revoked {
            return Err(DocumentError::AlreadyRevoked);
        }
        doc.is_revoked = true;
        env.storage().persistent().set(&DataKey::Document(doc.id), &doc);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Document(doc.id), TTL_LEDGERS, TTL_LEDGERS);
        Ok(())
    }

    pub fn get_document(env: Env, doc_id: u64) -> Result<DocumentRecord, DocumentError> {
        Self::load(&env, doc_id)
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    fn load(env: &Env, id: u64) -> Result<DocumentRecord, DocumentError> {
        env.storage()
            .persistent()
            .get(&DataKey::Document(id))
            .ok_or(DocumentError::NotFound)
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
        testutils::{Address as _, BytesN as _, Ledger},
        Bytes, BytesN, Env, String,
    };

    fn setup() -> (Env, Address, DocumentRegistryContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let id = env.register(DocumentRegistryContract {}, ());
        let client = DocumentRegistryContractClient::new(&env, &id);
        client.initialize(&admin);
        (env, admin, client)
    }

    fn fake_hash(env: &Env) -> BytesN<32> {
        BytesN::random(env)
    }

    fn fake_cid(env: &Env) -> Bytes {
        Bytes::from_slice(env, b"QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG")
    }

    fn doc_type(env: &Env) -> String {
        String::from_str(env, "BillOfLading")
    }

    #[test]
    fn test_document_with_future_expiry_is_valid() {
        let (env, _, client) = setup();
        let uploader = Address::generate(&env);

        // Current ledger timestamp is 0 by default; set it to 1000
        env.ledger().set_timestamp(1000);

        // Expires far in the future
        let id = client.register_document(
            &uploader,
            &fake_hash(&env),
            &fake_cid(&env),
            &doc_type(&env),
            &Some(9_999_999u64),
        );

        assert!(client.is_valid(&id));
        assert_eq!(client.get_document_status(&id), DocumentStatus::Active);
    }

    #[test]
    fn test_document_with_past_expiry_is_invalid() {
        let (env, _, client) = setup();
        let uploader = Address::generate(&env);

        // Register at timestamp 500 with expiry at 1000
        env.ledger().set_timestamp(500);
        let id = client.register_document(
            &uploader,
            &fake_hash(&env),
            &fake_cid(&env),
            &doc_type(&env),
            &Some(1000u64),
        );

        // Advance time past expiry
        env.ledger().set_timestamp(1001);

        assert!(!client.is_valid(&id));
        assert_eq!(client.get_document_status(&id), DocumentStatus::Expired);
    }

    #[test]
    fn test_document_with_no_expiry_is_always_valid() {
        let (env, _, client) = setup();
        let uploader = Address::generate(&env);

        let id = client.register_document(
            &uploader,
            &fake_hash(&env),
            &fake_cid(&env),
            &doc_type(&env),
            &None,
        );

        // Advance time far into the future
        env.ledger().set_timestamp(999_999_999);

        assert!(client.is_valid(&id));
        assert_eq!(client.get_document_status(&id), DocumentStatus::Active);
    }

    #[test]
    fn test_revoked_document_is_invalid() {
        let (env, admin, client) = setup();
        let uploader = Address::generate(&env);

        let id = client.register_document(
            &uploader,
            &fake_hash(&env),
            &fake_cid(&env),
            &doc_type(&env),
            &None,
        );

        assert!(client.is_valid(&id));
        client.revoke_document(&admin, &id);
        assert!(!client.is_valid(&id));
        assert_eq!(client.get_document_status(&id), DocumentStatus::Revoked);
    }

    #[test]
    fn test_expired_document_hash_preserved() {
        let (env, _, client) = setup();
        let uploader = Address::generate(&env);
        let hash = fake_hash(&env);

        env.ledger().set_timestamp(500);
        let id = client.register_document(
            &uploader,
            &hash,
            &fake_cid(&env),
            &doc_type(&env),
            &Some(1000u64),
        );

        env.ledger().set_timestamp(2000);

        // Document is expired but record still exists with original hash
        let doc = client.get_document(&id);
        assert_eq!(doc.content_hash, hash);
        assert_eq!(doc.expires_at, Some(1000u64));
        assert!(!doc.is_revoked);
    }

    #[test]
    fn test_not_found_error() {
        let (_, _, client) = setup();
        assert_eq!(
            client.try_get_document(&999u64),
            Err(Ok(DocumentError::NotFound))
        );
    }
}
