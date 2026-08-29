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
pub fn require_settlement_authority(env: &Env) -> Result<(), EscrowError> {
    let admin = admin(env)?;
    let shipment_contract: Option<Address> =
        env.storage().instance().get(&DataKey::ShipmentContract);

    if shipment_contract.as_ref() == Some(&env.current_contract_address()) {
        return Ok(());
    }

    admin.require_auth();
    Ok(())
}
