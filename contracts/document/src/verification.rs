//! Admin verification and public integrity checking.

use soroban_sdk::{Address, BytesN, Env};

use crate::errors::DocumentError;
use crate::types::HashAlgorithm;
use crate::{events, storage};

/// Admin verifies that a document is authentic.
/// Once verified the record is immutable.
pub fn verify(env: &Env, verifier: Address, doc_id: u64) -> Result<(), DocumentError> {
    // Only admin can verify.
    if verifier != storage::admin(env)? {
        return Err(DocumentError::Unauthorized);
    }
    verifier.require_auth();
    storage::require_not_paused(env)?;

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

/// Verify that a given hash matches the registered content_hash, comparing
/// with whichever algorithm was recorded for the document at registration.
/// Returns `true` if the hash matches, `false` otherwise.
/// This lets anyone prove a document is untampered without downloading the
/// full file from IPFS.
pub fn check_integrity(
    env: &Env,
    doc_id: u64,
    hash_to_check: BytesN<32>,
) -> Result<bool, DocumentError> {
    let doc = storage::load(env, doc_id)?;
    // `match` (rather than a plain `==`) so that adding a future
    // `HashAlgorithm` variant with a different comparison rule forces this
    // call site to be updated instead of silently reusing SHA-256's.
    let matches = match doc.hash_algorithm {
        HashAlgorithm::Sha256 => doc.content_hash == hash_to_check,
    };
    Ok(matches)
}
