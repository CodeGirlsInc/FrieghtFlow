//! Storage accessors shared by the contract's entrypoint modules.

use soroban_sdk::{token, Address, Env};

use crate::errors::EscrowError;
use crate::types::{DataKey, EscrowRecord, TTL_LEDGERS};

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

/// Settlement is reserved for the configured shipment contract, falling back
/// to the platform admin for the custody model the backend still uses.
///
/// If a shipment contract address has been configured via
/// `set_shipment_contract`, the *caller of the enclosing entrypoint* must be
/// that address — checked with `require_auth()` on it. Otherwise the platform
/// admin is required to authorise the call instead.
///
/// Previously this compared `DataKey::ShipmentContract` against
/// `env.current_contract_address()` (the escrow contract's own address), a
/// comparison that can never be true in practice, effectively making
/// `set_shipment_contract` a no-op and always falling through to the admin
/// check. The fix compares against the *configured* shipment-contract address
/// and calls `require_auth()` on whichever authority is active.
pub fn require_settlement_authority(env: &Env) -> Result<(), EscrowError> {
    let admin = admin(env)?;
    let shipment_contract: Option<Address> =
        env.storage().instance().get(&DataKey::ShipmentContract);

    if let Some(sc) = shipment_contract {
        sc.require_auth();
        return Ok(());
    }

    admin.require_auth();
    Ok(())
}
