//! Transitions only the carrier may drive.

use soroban_sdk::{Address, Env};

use crate::errors::ShipmentError;
use crate::types::{DataKey, Shipment, ShipmentStatus};
use crate::{events, storage};

/// Carrier accepts an open shipment.
pub fn accept(env: &Env, carrier: Address, shipment_id: u64) -> Result<(), ShipmentError> {
    carrier.require_auth();
    storage::require_not_paused(env)?;

    let mut shipment = storage::load(env, shipment_id)?;

    if shipment.status != ShipmentStatus::Created {
        return Err(ShipmentError::InvalidStatus);
    }

    // A shipper cannot accept their own posting. Without this check one address
    // can carry a shipment from `Created` all the way to delivery by itself,
    // which is a cheap way to manufacture completed jobs and to inflate the
    // reputation ratings derived from them (#1676).
    if shipment.shipper == carrier {
        return Err(ShipmentError::SelfDealing);
    }

    let now = env.ledger().timestamp();
    shipment.carrier = Some(carrier.clone());
    shipment.status = ShipmentStatus::Accepted;
    shipment.updated_at = now;
    storage::save(env, &shipment);

    let mut milestones = storage::milestones(env, shipment_id);
    milestones.accepted_at = now;
    storage::store_milestones(env, shipment_id, &milestones);

    storage::append_to_list(env, DataKey::CarrierList(carrier), shipment_id);
    // Accepted work is no longer available to other carriers.
    storage::remove_from_list(env, DataKey::OpenList, shipment_id);

    events::accepted(env, &shipment);
    Ok(())
}

/// Carrier releases an accepted-but-not-started job back to the shipper (#1864).
///
/// The shipment id is preserved so the shipper's off-chain references stay
/// valid; the carrier is unassigned and the job returns to `Created` for
/// another carrier to accept. Only the currently assigned carrier may do
/// this, and only before pickup (`Accepted`).
pub fn withdraw_acceptance(
    env: &Env,
    carrier: Address,
    shipment_id: u64,
) -> Result<(), ShipmentError> {
    carrier.require_auth();
    storage::require_not_paused(env)?;

    let mut shipment = storage::load(env, shipment_id)?;
    if shipment.status != ShipmentStatus::Accepted {
        return Err(ShipmentError::InvalidStatus);
    }
    require_carrier(&shipment, &carrier)?;

    storage::unassign_carrier(env, &mut shipment);
    shipment.status = ShipmentStatus::Created;
    shipment.updated_at = env.ledger().timestamp();
    storage::save(env, &shipment);

    // Same post-transition snapshot payload as every other shipment event.
    events::released(env, &shipment);
    Ok(())
}

/// Carrier marks the shipment as picked up and in transit.
pub fn mark_in_transit(env: &Env, carrier: Address, shipment_id: u64) -> Result<(), ShipmentError> {
    advance(
        env,
        carrier,
        shipment_id,
        ShipmentStatus::Accepted,
        ShipmentStatus::InTransit,
        events::in_transit,
    )
}

/// Carrier marks the cargo as delivered at destination.
pub fn mark_delivered(env: &Env, carrier: Address, shipment_id: u64) -> Result<(), ShipmentError> {
    advance(
        env,
        carrier,
        shipment_id,
        ShipmentStatus::InTransit,
        ShipmentStatus::Delivered,
        events::delivered,
    )
}

/// Move a shipment from `from` to `to`, checking the caller is its carrier,
/// then announce it with `emit`.
fn advance(
    env: &Env,
    carrier: Address,
    shipment_id: u64,
    from: ShipmentStatus,
    to: ShipmentStatus,
    emit: fn(&Env, &Shipment),
) -> Result<(), ShipmentError> {
    carrier.require_auth();
    storage::require_not_paused(env)?;

    let mut shipment = storage::load(env, shipment_id)?;

    if shipment.status != from {
        return Err(ShipmentError::InvalidStatus);
    }
    require_carrier(&shipment, &carrier)?;

    let now = env.ledger().timestamp();
    shipment.status = to.clone();
    shipment.updated_at = now;
    storage::save(env, &shipment);

    // Record the transition before it can be overwritten by a later
    // `updated_at` (#1865). Only the two carrier-driven milestones live here.
    if matches!(to, ShipmentStatus::InTransit | ShipmentStatus::Delivered) {
        let mut milestones = storage::milestones(env, shipment_id);
        if to == ShipmentStatus::InTransit {
            milestones.in_transit_at = now;
        } else {
            milestones.delivered_at = now;
        }
        storage::store_milestones(env, shipment_id, &milestones);
    }

    emit(env, &shipment);
    Ok(())
}

/// Confirm `caller` is the shipment's assigned carrier — the one
/// ownership check every carrier-gated transition needs.
fn require_carrier(shipment: &Shipment, caller: &Address) -> Result<(), ShipmentError> {
    if shipment.carrier.as_ref() != Some(caller) {
        return Err(ShipmentError::NotCarrier);
    }
    Ok(())
}
