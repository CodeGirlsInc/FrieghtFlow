//! Transitions only the carrier may drive.

use soroban_sdk::{Address, Env};

use crate::errors::ShipmentError;
use crate::types::{DataKey, Shipment, ShipmentStatus};
use crate::{events, storage};

/// Carrier accepts an open shipment.
pub fn accept(env: &Env, carrier: Address, shipment_id: u64) -> Result<(), ShipmentError> {
    carrier.require_auth();

    let mut shipment = storage::load(env, shipment_id)?;

    if shipment.status != ShipmentStatus::Created {
        return Err(ShipmentError::InvalidStatus);
    }

    shipment.carrier = Some(carrier.clone());
    shipment.status = ShipmentStatus::Accepted;
    shipment.updated_at = env.ledger().timestamp();
    storage::save(env, &shipment);

    storage::append_to_list(env, DataKey::CarrierList(carrier), shipment_id);

    events::accepted(env, &shipment);
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

    let mut shipment = storage::load(env, shipment_id)?;

    if shipment.status != from {
        return Err(ShipmentError::InvalidStatus);
    }
    if shipment.carrier.as_ref() != Some(&carrier) {
        return Err(ShipmentError::NotCarrier);
    }

    shipment.status = to;
    shipment.updated_at = env.ledger().timestamp();
    storage::save(env, &shipment);

    emit(env, &shipment);
    Ok(())
}
