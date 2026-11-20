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

/// Cancel a `Funded` escrow while retaining a cancellation fee for the
/// platform.
///
/// `fee_amount` is in the token's base unit. The shipper receives
/// `amount - fee_amount` and the platform's admin receives `fee_amount`, so
/// the contract's token balance is fully drained across the two transfers
/// and no dust is stranded. A `fee_amount` of `0` is a plain full refund and
/// is equivalent to [`refund`].
///
/// The fee goes to the contract's configured admin — the same address
/// `require_settlement_authority` already treats as the platform authority,
/// so there is exactly one canonical fee recipient and no second
/// configuration to keep in sync.
///
/// # Errors
///
/// - [`EscrowError::InvalidAmount`] if `fee_amount` is negative, or is
///   greater than or equal to the escrowed `amount`. A fee may not
///   consume the whole balance: that would leave the shipper with nothing
///   and would be indistinguishable, on-chain, from paying the carrier.
/// - [`EscrowError::InvalidStatus`] if the escrow is not `Funded`. A
///   `Disputed` escrow must be settled through [`resolve_dispute`], and an
///   already-settled one is a no-op error — so calling this twice can
///   never pay out twice.
pub fn refund_with_fee(
    env: &Env,
    shipment_id: u64,
    fee_amount: i128,
) -> Result<(), EscrowError> {
    storage::require_settlement_authority(env)?;
    storage::require_not_paused(env)?;

    let mut record = storage::load(env, shipment_id)?;

    if record.status != EscrowStatus::Funded {
        return Err(EscrowError::InvalidStatus);
    }
    if fee_amount < 0 || fee_amount >= record.amount {
        return Err(EscrowError::InvalidAmount);
    }

    let refund_amount = record.amount - fee_amount;
    let token = storage::token(env)?;
    token.transfer(
        &env.current_contract_address(),
        &record.shipper,
        &refund_amount,
    );

    if fee_amount > 0 {
        // Fee recipient is the configured platform admin.
        token.transfer(
            &env.current_contract_address(),
            &storage::admin(env)?,
            &fee_amount,
        );
        storage::store_settlement_fee(env, shipment_id, fee_amount);
    }

    record.status = EscrowStatus::Refunded;
    record.settled_at = env.ledger().timestamp();
    storage::store(env, &record);

    // Same `refunded` action as a full refund — the event convention
    // (`contracts/EVENTS.md`) is one post-transition `EscrowRecord` payload
    // per action, and the retained fee is read back via
    // `get_settlement_fee` rather than smuggled into the payload as a
    // bespoke struct.
    events::refunded(env, &record);
    Ok(())
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
