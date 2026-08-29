//! Transitions only the shipper may drive.

use soroban_sdk::{Address, Env, String};

use crate::errors::ShipmentError;
use crate::types::{DataKey, Shipment, ShipmentStatus, TTL_LEDGERS};
use crate::{events, storage};

/// Shipper creates a new shipment posting.
pub fn create(
    env: &Env,
    shipper: Address,
    origin: String,
    destination: String,
    cargo_description: String,
    weight_kg: u32,
    price: i128,
) -> Result<u64, ShipmentError> {
    shipper.require_auth();
    storage::require_not_paused(env)?;

    if weight_kg == 0 || weight_kg > 1_000_000 || price <= 0 {
        return Err(ShipmentError::InvalidInput);
    }

    if origin.len() > 255 || destination.len() > 255 || cargo_description.len() > 1024 {
        return Err(ShipmentError::InvalidInput);
    }

    let id = storage::next_id(env);
    let now = env.ledger().timestamp();

    let shipment = Shipment {
        id,
        shipper: shipper.clone(),
        carrier: None,
        origin,
        destination,
        cargo_description,
        weight_kg,
        price,
        status: ShipmentStatus::Created,
        created_at: now,
        updated_at: now,
    };

    env.storage()
        .persistent()
        .set(&DataKey::Shipment(id), &shipment);
    env.storage()
        .persistent()
        .extend_ttl(&DataKey::Shipment(id), TTL_LEDGERS, TTL_LEDGERS);

    storage::append_to_list(env, DataKey::ShipperList(shipper), id);

    events::created(env, &shipment);
    Ok(id)
}

/// Shipper edits a shipment's terms — only while it's still `Created`, i.e.
/// before any carrier has committed to it. Subject to the same validation as
/// [`create`]; `origin` and `carrier` are not editable.
pub fn update(
    env: &Env,
    shipper: Address,
    shipment_id: u64,
    destination: String,
    cargo_description: String,
    weight_kg: u32,
    price: i128,
) -> Result<(), ShipmentError> {
    shipper.require_auth();
    storage::require_not_paused(env)?;

    let mut shipment = storage::load(env, shipment_id)?;

    if shipment.shipper != shipper {
        return Err(ShipmentError::NotShipper);
    }
    if shipment.status != ShipmentStatus::Created {
        return Err(ShipmentError::InvalidStatus);
    }

    if weight_kg == 0 || weight_kg > 1_000_000 || price <= 0 {
        return Err(ShipmentError::InvalidInput);
    }
    if destination.len() > 255 || cargo_description.len() > 1024 {
        return Err(ShipmentError::InvalidInput);
    }

    shipment.destination = destination;
    shipment.cargo_description = cargo_description;
    shipment.weight_kg = weight_kg;
    shipment.price = price;
    shipment.updated_at = env.ledger().timestamp();
    storage::save(env, &shipment);

    events::updated(env, &shipment);
    Ok(())
}

/// Shipper confirms delivery and marks the shipment Completed.
/// This is the trigger for escrow payment release.
pub fn confirm_delivery(
    env: &Env,
    shipper: Address,
    shipment_id: u64,
) -> Result<(), ShipmentError> {
    shipper.require_auth();
    storage::require_not_paused(env)?;

    let mut shipment = storage::load(env, shipment_id)?;

    if shipment.shipper != shipper {
        return Err(ShipmentError::NotShipper);
    }
    if shipment.status != ShipmentStatus::Delivered {
        return Err(ShipmentError::InvalidStatus);
    }

    shipment.status = ShipmentStatus::Completed;
    shipment.updated_at = env.ledger().timestamp();
    storage::save(env, &shipment);

    events::completed(env, &shipment);
    Ok(())
}

/// Shipper cancels — only allowed from Created or Accepted.
pub fn cancel(env: &Env, shipper: Address, shipment_id: u64) -> Result<(), ShipmentError> {
    shipper.require_auth();
    storage::require_not_paused(env)?;

    let mut shipment = storage::load(env, shipment_id)?;

    if shipment.shipper != shipper {
        return Err(ShipmentError::NotShipper);
    }
    if !matches!(
        shipment.status,
        ShipmentStatus::Created | ShipmentStatus::Accepted
    ) {
        return Err(ShipmentError::InvalidStatus);
    }

    shipment.status = ShipmentStatus::Cancelled;
    shipment.updated_at = env.ledger().timestamp();
    storage::save(env, &shipment);

    events::cancelled(env, &shipment);
    Ok(())
}
