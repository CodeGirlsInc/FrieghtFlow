#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Ledger, BytesN, Env, Vec};

fn make_env() -> Env {
    Env::default()
}

fn hash(env: &Env, seed: u8) -> BytesN<32> {
    BytesN::from_array(env, &[seed; 32])
}

fn setup_contract(env: &Env) -> DocumentVerificationContractClient {
    let contract_id = env.register_contract(None, DocumentVerificationContract);
    DocumentVerificationContractClient::new(env, &contract_id)
}

#[test]
fn test_all_match() {
    let env = make_env();
    let client = setup_contract(&env);

    let id1 = hash(&env, 1);
    let id2 = hash(&env, 2);
    let h1  = hash(&env, 10);
    let h2  = hash(&env, 20);

    client.register_document(&id1, &h1);
    client.register_document(&id2, &h2);

    let mut ids    = Vec::new(&env);
    let mut hashes = Vec::new(&env);
    ids.push_back(id1); ids.push_back(id2);
    hashes.push_back(h1); hashes.push_back(h2);

    let resp = client.verify_documents_batch(&ids, &hashes).unwrap();
    assert_eq!(resp.summary.total,      2);
    assert_eq!(resp.summary.matched,    2);
    assert_eq!(resp.summary.mismatched, 0);
    assert!(resp.results.get(0).unwrap().matches);
    assert!(resp.results.get(1).unwrap().matches);
}

#[test]
fn test_partial_match() {
    let env = make_env();
    let client = setup_contract(&env);

    let id1 = hash(&env, 1);
    let id2 = hash(&env, 2);
    let id3 = hash(&env, 3);
    let h1  = hash(&env, 10);
    let h2  = hash(&env, 20);
    let h3  = hash(&env, 30);

    client.register_document(&id1, &h1);
    client.register_document(&id2, &h2);
    client.register_document(&id3, &h3);

    let mut ids    = Vec::new(&env);
    let mut hashes = Vec::new(&env);
    ids.push_back(id1); ids.push_back(id2); ids.push_back(id3);
    hashes.push_back(h1); hashes.push_back(hash(&env, 99)); hashes.push_back(h3);

    let resp = client.verify_documents_batch(&ids, &hashes).unwrap();
    assert_eq!(resp.summary.total,      3);
    assert_eq!(resp.summary.matched,    2);
    assert_eq!(resp.summary.mismatched, 1);
    assert!(!resp.results.get(1).unwrap().matches);
}

#[test]
fn test_all_mismatch() {
    let env = make_env();
    let client = setup_contract(&env);

    let id1 = hash(&env, 1);
    let h1  = hash(&env, 10);
    client.register_document(&id1, &h1);

    let mut ids    = Vec::new(&env);
    let mut hashes = Vec::new(&env);
    ids.push_back(id1);
    hashes.push_back(hash(&env, 99));

    let resp = client.verify_documents_batch(&ids, &hashes).unwrap();
    assert_eq!(resp.summary.matched,    0);
    assert_eq!(resp.summary.mismatched, 1);
}

#[test]
fn test_empty_input() {
    let env = make_env();
    let client = setup_contract(&env);

    let ids:    Vec<BytesN<32>> = Vec::new(&env);
    let hashes: Vec<BytesN<32>> = Vec::new(&env);

    let resp = client.verify_documents_batch(&ids, &hashes).unwrap();
    assert_eq!(resp.summary.total, 0);
    assert_eq!(resp.results.len(), 0);
}

#[test]
fn test_length_mismatch_returns_error() {
    let env = make_env();
    let client = setup_contract(&env);

    let mut ids    = Vec::new(&env);
    let     hashes: Vec<BytesN<32>> = Vec::new(&env);
    ids.push_back(hash(&env, 1));

    let err = client.try_verify_documents_batch(&ids, &hashes).unwrap_err();
    assert_eq!(err.unwrap(), ContractError::InputLengthMismatch);
}