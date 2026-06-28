#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, BytesN as _},
    Bytes, BytesN, Env,
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

/// Register a document; get_document returns the correct hash and CID-bearing record.
#[test]
fn test_register_document_hash() {
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
    assert!(!doc.is_revoked);
}

/// Registering the same (hash, uploader) pair twice should fail.
#[test]
fn test_register_duplicate_hash_fails() {
    let (env, _, client) = setup();
    let uploader = Address::generate(&env);
    let hash = fake_hash(&env);

    client.register_document(
        &uploader,
        &1u64,
        &DocumentType::BillOfLading,
        &hash,
        &fake_cid(&env),
    );

    let result = client.try_register_document(
        &uploader,
        &1u64,
        &DocumentType::BillOfLading,
        &hash,
        &fake_cid(&env),
    );
    assert_eq!(result, Err(Ok(DocumentError::DuplicateHash)));
}

/// verify_integrity with the correct hash returns true.
#[test]
fn test_verify_integrity_correct_hash() {
    let (env, _, client) = setup();
    let uploader = Address::generate(&env);
    let (id, original_hash) = register(&env, &client, &uploader, 1);

    assert!(client.check_integrity(&id, &original_hash));
}

/// verify_integrity with a tampered hash returns false.
#[test]
fn test_verify_integrity_wrong_hash() {
    let (env, _, client) = setup();
    let uploader = Address::generate(&env);
    let (id, _) = register(&env, &client, &uploader, 1);

    let tampered_hash = BytesN::random(&env);
    assert!(!client.check_integrity(&id, &tampered_hash));
}

/// Admin calls verify_document; document.is_verified becomes true.
#[test]
fn test_admin_verify_document() {
    let (env, admin, client) = setup();
    let uploader = Address::generate(&env);

    let (id, _) = register(&env, &client, &uploader, 1);

    client.verify_document(&admin, &id);

    let doc = client.get_document(&id);
    assert!(doc.is_verified);
    assert_eq!(doc.verified_by, Some(admin));
}

#[test]
fn test_double_verify_fails() {
    let (env, admin, client) = setup();
    let uploader = Address::generate(&env);
    let (id, _) = register(&env, &client, &uploader, 1);

    client.verify_document(&admin, &id);
    let result = client.try_verify_document(&admin, &id);
    assert_eq!(result, Err(Ok(DocumentError::AlreadyVerified)));
}

/// Non-admin calling verify_document should fail with Unauthorized.
#[test]
fn test_non_admin_cannot_verify() {
    let (env, _, client) = setup();
    let uploader = Address::generate(&env);
    let (id, _) = register(&env, &client, &uploader, 1);

    let stranger = Address::generate(&env);
    let result = client.try_verify_document(&stranger, &id);
    assert_eq!(result, Err(Ok(DocumentError::Unauthorized)));
}

/// Revoking a document sets is_revoked = true; subsequent integrity checks fail.
#[test]
fn test_revoke_document() {
    let (env, admin, client) = setup();
    let uploader = Address::generate(&env);
    let (id, original_hash) = register(&env, &client, &uploader, 1);

    // Sanity: integrity check passes before revocation.
    assert!(client.check_integrity(&id, &original_hash));

    client.revoke_document(&admin, &id);

    let doc = client.get_document(&id);
    assert!(doc.is_revoked);

    // Even with the correct hash, a revoked document never passes integrity.
    assert!(!client.check_integrity(&id, &original_hash));
}

/// Revoking the same document twice should fail.
#[test]
fn test_double_revoke_fails() {
    let (env, admin, client) = setup();
    let uploader = Address::generate(&env);
    let (id, _) = register(&env, &client, &uploader, 1);

    client.revoke_document(&admin, &id);
    let result = client.try_revoke_document(&admin, &id);
    assert_eq!(result, Err(Ok(DocumentError::AlreadyRevoked)));
}

/// Non-admin calling revoke_document should fail with Unauthorized.
#[test]
fn test_non_admin_cannot_revoke() {
    let (env, _, client) = setup();
    let uploader = Address::generate(&env);
    let (id, _) = register(&env, &client, &uploader, 1);

    let stranger = Address::generate(&env);
    let result = client.try_revoke_document(&stranger, &id);
    assert_eq!(result, Err(Ok(DocumentError::Unauthorized)));

    // Document remains unrevoked after the failed attempt.
    assert!(!client.get_document(&id).is_revoked);
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
