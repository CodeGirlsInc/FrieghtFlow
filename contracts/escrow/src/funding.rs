//! Locking a shipper's funds into the contract.

use soroban_sdk::{Address, Env};

use crate::errors::EscrowError;
use crate::shipment::{ShipmentClient, ShipmentStatus};
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

    // A payee identical to the payer produces an escrow that releases to the
    // address that funded it (issue #1675). That is never a real shipment: it
    // settles without cargo moving, which is only useful for farming settlement
    // events or for confusing indexers and the backend's escrow reconciliation,
    // both of which treat a release as evidence of a completed job.
    //
    // Checked before any token is pulled so a rejected escrow cannot leave a
    // balance stranded in the contract.
    if carrier == shipper {
        return Err(EscrowError::InvalidParties);
    }

    // Ensure no double-funding for the same shipment.
    if env
        .storage()
        .persistent()
        .has(&DataKey::Escrow(shipment_id))
    {
        let existing = storage::load(env, shipment_id)?;
        match existing.status {
            EscrowStatus::Funded => return Err(EscrowError::AlreadyFunded),
            EscrowStatus::Released | EscrowStatus::Refunded | EscrowStatus::Disputed => {
                return Err(EscrowError::InvalidStatus);
            }
            // `Pending` records are never created today; keep the arm so a
            // future `Pending -> Funded` transition stays a valid one.
            EscrowStatus::Pending => {}
        }
    }

    // #1861: when a shipment contract is linked, refuse to lock funds for a
    // shipment that is not Accepted, for a carrier that is not assigned to it,
    // or for an amount that differs from its price. With no link configured
    // the old trusted/off-chain mode is preserved.
    validate_against_shipment(env, &carrier, shipment_id, amount)?;

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
    // #1862: only `Funded`/`Disputed` escrows count as locked. Raising a
    // dispute keeps the status live and leaves this counter untouched.
    storage::add_locked(env, amount);

    events::funded(env, &record);
    Ok(())
}

/// Cross-check funding inputs against the linked shipment contract (#1861).
fn validate_against_shipment(
    env: &Env,
    carrier: &Address,
    shipment_id: u64,
    amount: i128,
) -> Result<(), EscrowError> {
    let Some(shipment_contract) = storage::shipment_contract(env) else {
        // No link: the caller is trusted to supply correct shipment data
        // off-chain. This mode is retained for existing deployments.
        return Ok(());
    };

    let client = ShipmentClient::new(env, &shipment_contract);
    let shipment = client
        .try_get_shipment(&shipment_id)
        .map_err(|_| EscrowError::ShipmentLookupFailed)?
        .map_err(|_| EscrowError::ShipmentLookupFailed)?;

    if shipment.status != ShipmentStatus::Accepted {
        return Err(EscrowError::ShipmentNotAccepted);
    }
    if shipment.carrier.as_ref() != Some(carrier) {
        return Err(EscrowError::CarrierMismatch);
    }
    if shipment.price != amount {
        return Err(EscrowError::AmountMismatch);
    }
    Ok(())
}
