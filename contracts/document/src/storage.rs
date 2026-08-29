//! Storage accessors shared by the contract's entrypoint modules.

use soroban_sdk::{Address, Env};

use crate::errors::DocumentError;
use crate::types::{DataKey, DocumentRecord, TTL_LEDGERS};

pub fn admin(env: &Env) -> Result<Address, DocumentError> {
    env.storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(DocumentError::NotInitialized)
}

pub fn require_not_paused(env: &Env) -> Result<(), DocumentError> {
    if env
        .storage()
        .instance()
        .get(&DataKey::Paused)
        .unwrap_or(false)
    {
        return Err(DocumentError::Paused);
    }
    Ok(())
}

/// Address of the shipment contract `register_document` validates against.
pub fn shipment_contract(env: &Env) -> Result<Address, DocumentError> {
    env.storage()
        .instance()
        .get(&DataKey::ShipmentContract)
        .ok_or(DocumentError::NotInitialized)
}

pub fn load(env: &Env, id: u64) -> Result<DocumentRecord, DocumentError> {
    env.storage()
        .persistent()
        .get(&DataKey::Document(id))
        .ok_or(DocumentError::NotFound)
}

pub fn store(env: &Env, doc: &DocumentRecord) {
    env.storage()
        .persistent()
        .set(&DataKey::Document(doc.id), doc);
    env.storage()
        .persistent()
        .extend_ttl(&DataKey::Document(doc.id), TTL_LEDGERS, TTL_LEDGERS);
}

pub fn next_id(env: &Env) -> u64 {
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
