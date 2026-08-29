//! Admin verification and public integrity checking.

use soroban_sdk::{Address, BytesN, Env};

use crate::errors::DocumentError;
use crate::{events, storage};

/// Admin verifies that a document is authentic.
/// Once verified the record is immutable.
pub fn verify(env: &Env, verifier: Address, doc_id: u64) -> Result<(), DocumentError> {
    // Only admin can verify.
    if verifier != storage::admin(env)? {
        return Err(DocumentError::Unauthorized);
    }
    verifier.require_auth();

    let mut doc = storage::load(env, doc_id)?;

    if doc.is_verified {
        return Err(DocumentError::AlreadyVerified);
    }

    doc.is_verified = true;
    doc.verified_by = Some(verifier);
    doc.verified_at = env.ledger().timestamp();
    storage::store(env, &doc);

    events::verified(env, &doc);
    Ok(())
}

/// Verify that a given hash matches the registered content_hash.
/// Returns `true` if the hash matches, `false` otherwise.
/// This lets anyone prove a document is untampered without downloading the
/// full file from IPFS.
pub fn check_integrity(
    env: &Env,
    doc_id: u64,
    hash_to_check: BytesN<32>,
) -> Result<bool, DocumentError> {
    Ok(storage::load(env, doc_id)?.content_hash == hash_to_check)
}
