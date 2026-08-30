//! Storage accessors shared by the contract's entrypoint modules.

use soroban_sdk::{Address, Env, Vec};

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

/// Slice `list[offset..offset+limit]`, clamped to the list's bounds.
///
/// Registration is uncapped — like the shipment contract's per-shipper and
/// per-carrier shipment lists, growth is naturally rate-limited by the
/// authorized parties' willingness to pay a transaction fee per document —
/// but returning the whole list from `get_documents_by_shipment` in one call
/// would make read cost grow unbounded with it. Pagination bounds that cost
/// the same way `shipment::storage::paginate` bounds the shipment lists'.
pub fn paginate(env: &Env, list: Vec<u64>, offset: u32, limit: u32) -> Vec<u64> {
    let mut paged = Vec::new(env);
    let len = list.len();

    if offset >= len {
        return paged;
    }

    let end = (offset + limit).min(len);
    for i in offset..end {
        if let Some(item) = list.get(i) {
            paged.push_back(item);
        }
    }
    paged
}
