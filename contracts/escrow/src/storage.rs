//! Storage accessors shared by the contract's entrypoint modules.

use common::TTL_LEDGERS;
use soroban_sdk::{token, Address, Env};

use crate::errors::EscrowError;
use crate::types::{DataKey, EscrowRecord};

pub fn admin(env: &Env) -> Result<Address, EscrowError> {
    env.storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(EscrowError::NotInitialized)
}

pub fn require_not_paused(env: &Env) -> Result<(), EscrowError> {
    if env
        .storage()
        .instance()
        .get(&DataKey::Paused)
        .unwrap_or(false)
    {
        return Err(EscrowError::Paused);
    }
    Ok(())
}

pub fn token(env: &Env) -> Result<token::Client<'_>, EscrowError> {
    let token_addr: Address = env
        .storage()
        .instance()
        .get(&DataKey::TokenContract)
        .ok_or(EscrowError::NotInitialized)?;
    Ok(token::Client::new(env, &token_addr))
}

pub fn load(env: &Env, shipment_id: u64) -> Result<EscrowRecord, EscrowError> {
    env.storage()
        .persistent()
        .get(&DataKey::Escrow(shipment_id))
        .ok_or(EscrowError::NotFound)
}

pub fn store(env: &Env, record: &EscrowRecord) {
    env.storage()
        .persistent()
        .set(&DataKey::Escrow(record.shipment_id), record);
    env.storage().persistent().extend_ttl(
        &DataKey::Escrow(record.shipment_id),
        TTL_LEDGERS,
        TTL_LEDGERS,
    );
}

/// The fee (in base units) retained by the platform the last time this
/// escrow was settled as a partial refund, or `0` when it has never been
/// settled that way (or not settled at all).
pub fn settlement_fee(env: &Env, shipment_id: u64) -> i128 {
    env.storage()
        .persistent()
        .get(&DataKey::EscrowFee(shipment_id))
        .unwrap_or(0)
}

/// Record the fee retained by a partial refund. Called only on the
/// settlement path that actually splits the funds, so a full refund or a
/// release never leaves a fee behind.
pub fn store_settlement_fee(env: &Env, shipment_id: u64, fee: i128) {
    if fee <= 0 {
        return;
    }
    let key = DataKey::EscrowFee(shipment_id);
    env.storage().persistent().set(&key, &fee);
    env.storage().persistent().extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);
}

/// Settlement requires the platform admin's authorisation.
///
/// `DataKey::ShipmentContract` records the contract that may settle an escrow
/// atomically, but it deliberately does **not** gate settlement here. This
/// function used to return as soon as a shipment contract was configured and
/// never evaluated `admin.require_auth()`, which silently revoked the admin's
/// settlement authority the moment `set_shipment_contract` was called — while
/// `set_shipment_contract`'s own doc comment claimed the admin "remains
/// supported for custody-model compatibility". The backend settles with the
/// admin key, so enabling the link broke every backend settlement path, and an
/// admin could no longer rescue funds if the shipment contract misbehaved.
///
/// # Why this is admin-only rather than "admin OR shipment contract"
///
/// The obvious policy is "either authority is enough", and it cannot be
/// expressed with the current SDK. `Address::require_auth` *accumulates*
/// requirements, so calling it on both the admin and the shipment contract
/// demands both signatures and breaks the backend path just as badly. Choosing
/// between them needs to know who is actually invoking, and `Env::invoker` was
/// removed in soroban-sdk 22. Requiring the admin is therefore the only
/// encoding that fails safe: it restores the path that works today and never
/// silently removes an authority that something depends on.
///
/// Supporting atomic cross-contract settlement needs either separate
/// admin- and contract-authorised entrypoints, or invoker detection once the SDK
/// exposes it again. That is a policy decision for the maintainers, not something
/// to smuggle in as a storage-layer change.
pub fn require_settlement_authority(env: &Env) -> Result<(), EscrowError> {
    admin(env)?.require_auth();
    Ok(())
}
