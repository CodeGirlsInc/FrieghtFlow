//! Dispute lifecycle: either party raises, the admin resolves.

use soroban_sdk::{Address, BytesN, Env};

use crate::errors::ShipmentError;
use crate::types::ShipmentStatus;
use crate::{events, storage};

/// Either party can raise a dispute when the shipment is InTransit or Delivered.
///
/// `reason_hash` is optional: it can point at an off-chain statement without
/// putting its contents on-chain. The raiser and time are always recorded
/// under `DataKey::Dispute` (#1863); the `Shipment` record itself is unchanged.
pub fn raise(
    env: &Env,
    caller: Address,
    shipment_id: u64,
    reason_hash: Option<BytesN<32>>,
) -> Result<(), ShipmentError> {
    caller.require_auth();
    storage::require_not_paused(env)?;

    let mut shipment = storage::load(env, shipment_id)?;

    if !shipment.is_party(&caller) {
        return Err(ShipmentError::Unauthorized);
    }
    if !matches!(
        shipment.status,
        ShipmentStatus::InTransit | ShipmentStatus::Delivered
    ) {
        return Err(ShipmentError::InvalidStatus);
    }

    let now = env.ledger().timestamp();
    shipment.status = ShipmentStatus::Disputed;
    shipment.updated_at = now;
    storage::save(env, &shipment);

    storage::store_dispute(
        env,
        shipment_id,
        &crate::types::Dispute {
            raised_by: caller,
            raised_at: now,
            reason_hash,
        },
    );

    events::disputed(env, &shipment);
    Ok(())
}

/// Admin resolves a dispute: completed → pays carrier, cancelled → refunds shipper.
pub fn resolve(
    env: &Env,
    shipment_id: u64,
    resolve_as_completed: bool,
) -> Result<(), ShipmentError> {
    storage::admin(env)?.require_auth();
    storage::require_not_paused(env)?;

    let mut shipment = storage::load(env, shipment_id)?;

    if shipment.status != ShipmentStatus::Disputed {
        return Err(ShipmentError::InvalidStatus);
    }

    shipment.status = if resolve_as_completed {
        ShipmentStatus::Completed
    } else {
        ShipmentStatus::Cancelled
    };
    shipment.updated_at = env.ledger().timestamp();
    storage::save(env, &shipment);

    // A single `resolved` event; its payload's `status` says which way it went.
    events::resolved(env, &shipment);
    Ok(())
}
