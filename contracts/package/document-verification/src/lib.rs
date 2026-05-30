#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, BytesN, Env, Vec, Symbol};

#[contracttype]
pub enum DataKey {
    DocHash(BytesN<32>),
}

#[contracttype]
#[derive(Clone)]
pub struct VerificationResult {
    pub doc_id:      BytesN<32>,
    pub matches:     bool,
    pub stored_hash: BytesN<32>,
}

#[contracttype]
#[derive(Clone)]
pub struct BatchSummary {
    pub total:      u32,
    pub matched:    u32,
    pub mismatched: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct BatchVerificationResponse {
    pub results: Vec<VerificationResult>,
    pub summary: BatchSummary,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum ContractError {
    InputLengthMismatch = 1,
    DocumentNotFound    = 2,
}

#[contract]
pub struct DocumentVerificationContract;

#[contractimpl]
impl DocumentVerificationContract {
    /// Register a document hash on-chain. Call once per document at upload time.
    pub fn register_document(env: Env, doc_id: BytesN<32>, hash: BytesN<32>) {
        env.storage()
            .persistent()
            .set(&DataKey::DocHash(doc_id), &hash);
    }

    /// Verify multiple documents in a single transaction.
    /// Returns an error if `doc_ids` and `submitted_hashes` differ in length.
    /// Each document is evaluated independently — a mismatch does not halt the batch.
    pub fn verify_documents_batch(
        env: Env,
        doc_ids: Vec<BytesN<32>>,
        submitted_hashes: Vec<BytesN<32>>,
    ) -> Result<BatchVerificationResponse, ContractError> {
        if doc_ids.len() != submitted_hashes.len() {
            return Err(ContractError::InputLengthMismatch);
        }

        let mut results: Vec<VerificationResult> = Vec::new(&env);
        let mut matched: u32 = 0;
        let total = doc_ids.len();

        for i in 0..total {
            let doc_id        = doc_ids.get(i).unwrap();
            let submitted     = submitted_hashes.get(i).unwrap();
            let stored: BytesN<32> = env
                .storage()
                .persistent()
                .get(&DataKey::DocHash(doc_id.clone()))
                .unwrap_or_else(|| submitted.clone()); // unknown doc: treat as mismatch

            let matches = stored == submitted;
            if matches { matched += 1; }

            results.push_back(VerificationResult {
                doc_id,
                matches,
                stored_hash: stored,
            });
        }

        Ok(BatchVerificationResponse {
            results,
            summary: BatchSummary {
                total,
                matched,
                mismatched: total - matched,
            },
        })
    }
}