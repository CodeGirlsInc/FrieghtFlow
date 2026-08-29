//! Paying out, refunding, and resolving disputed escrows.

use soroban_sdk::{Address, Env};

use crate::errors::EscrowError;
use crate::types::EscrowStatus;
use crate::{events, storage};

/// Release locked funds to the carrier.
/// Called when a shipment is Completed (shipper confirmed delivery).
/// In production this would be called by an authorized shipment contract;
/// for now admin can also trigger it after off-chain verification.
pub fn release(env: &Env, shipment_id: u64) -> Result<(), EscrowError> {
    settle(env, shipment_id, true)
}

/// Refund locked funds back to the shipper.
/// Called when a shipment is Cancelled.
pub fn refund(env: &Env, shipment_id: u64) -> Result<(), EscrowError> {
    settle(env, shipment_id, false)
}

/// Pay out a `Funded` escrow to the carrier or back to the shipper.
fn settle(env: &Env, shipment_id: u64, to_carrier: bool) -> Result<(), EscrowError> {
    storage::require_settlement_authority(env)?;
    storage::require_not_paused(env)?;

    let mut record = storage::load(env, shipment_id)?;

    if record.status != EscrowStatus::Funded {
        return Err(EscrowError::InvalidStatus);
    }

    let recipient = if to_carrier {
        record.carrier.clone()
    } else {
        record.shipper.clone()
    };
    storage::token(env)?.transfer(&env.current_contract_address(), &recipient, &record.amount);

    record.status = if to_carrier {
        EscrowStatus::Released
    } else {
        EscrowStatus::Refunded
    };
    record.settled_at = env.ledger().timestamp();
    storage::store(env, &record);

    if to_carrier {
        events::released(env, &record);
    } else {
        events::refunded(env, &record);
    }
    Ok(())
}

/// Raise a dispute for the escrow (mirrors the shipment dispute).
/// Either party can call this; admin then resolves via release or refund.
pub fn raise_dispute(env: &Env, caller: Address, shipment_id: u64) -> Result<(), EscrowError> {
    caller.require_auth();
    storage::require_not_paused(env)?;

    let mut record = storage::load(env, shipment_id)?;

    let is_party = record.shipper == caller || record.carrier == caller;
    if !is_party {
        return Err(EscrowError::Unauthorized);
    }
    if record.status != EscrowStatus::Funded {
        return Err(EscrowError::InvalidStatus);
    }

    record.status = EscrowStatus::Disputed;
    storage::store(env, &record);

    events::disputed(env, &record);
    Ok(())
}

/// Admin resolves a disputed escrow.
/// `release_to_carrier = true` → funds go to carrier.
/// `release_to_carrier = false` → funds returned to shipper.
pub fn resolve_dispute(
    env: &Env,
    shipment_id: u64,
    release_to_carrier: bool,
) -> Result<(), EscrowError> {
    storage::require_settlement_authority(env)?;
    storage::require_not_paused(env)?;

    let mut record = storage::load(env, shipment_id)?;

    if record.status != EscrowStatus::Disputed {
        return Err(EscrowError::InvalidStatus);
    }

    let recipient = if release_to_carrier {
        record.carrier.clone()
    } else {
        record.shipper.clone()
    };
    storage::token(env)?.transfer(&env.current_contract_address(), &recipient, &record.amount);

    record.status = if release_to_carrier {
        EscrowStatus::Released
    } else {
        EscrowStatus::Refunded
    };
    record.settled_at = env.ledger().timestamp();
    storage::store(env, &record);

    // A single `resolved` event; its payload's `status` says which way it went.
    events::resolved(env, &record);
    Ok(())
}
