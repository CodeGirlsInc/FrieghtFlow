//! Locking a shipper's funds into the contract.

use soroban_sdk::{Address, Env};

use crate::errors::EscrowError;
use crate::types::{DataKey, EscrowRecord, EscrowStatus};
use crate::{events, storage};

/// Shipper locks funds for a shipment.
///
/// **Pre-condition:** the shipper must have called `approve` on the token
/// contract, granting this escrow contract an allowance ≥ `amount`.
///
/// The contract pulls the tokens from `shipper` via `transfer_from`.
pub fn fund(
    env: &Env,
    shipper: Address,
    carrier: Address,
    shipment_id: u64,
    amount: i128,
) -> Result<(), EscrowError> {
    shipper.require_auth();
    storage::require_not_paused(env)?;

    if amount <= 0 {
        return Err(EscrowError::InvalidAmount);
    }

    // Ensure no double-funding for the same shipment.
    if env
        .storage()
        .persistent()
        .has(&DataKey::Escrow(shipment_id))
    {
        let existing = storage::load(env, shipment_id)?;
        if existing.status == EscrowStatus::Funded {
            return Err(EscrowError::AlreadyFunded);
        }
    }

    // Pull tokens from shipper into this contract.
    // transfer_from: spender=this_contract, from=shipper, to=this_contract, amount
    storage::token(env)?.transfer_from(
        &env.current_contract_address(),
        &shipper,
        &env.current_contract_address(),
        &amount,
    );

    let now = env.ledger().timestamp();
    let record = EscrowRecord {
        shipment_id,
        shipper,
        carrier,
        amount,
        status: EscrowStatus::Funded,
        funded_at: now,
        settled_at: 0,
    };

    storage::store(env, &record);

    events::funded(env, &record);
    Ok(())
}
