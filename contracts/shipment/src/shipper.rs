//! Transitions only the shipper may drive.

use common::TTL_LEDGERS;
use soroban_sdk::{Address, Env, String};

use crate::errors::ShipmentError;
use crate::types::{DataKey, Shipment, ShipmentStatus};
use crate::{events, storage};

/// Upper bound on `weight_kg`, in kilograms.
pub const MAX_WEIGHT_KG: u32 = 1_000_000;
/// Maximum length, in bytes, of `origin` and `destination`.
pub const MAX_LOCATION_LEN: u32 = 255;
/// Maximum length, in bytes, of `cargo_description`.
pub const MAX_CARGO_LEN: u32 = 1024;

/// Validate the shipment terms accepted by both [`create`] and [`update`].
///
/// Keeping the bounds in one place means the backend and the contract cannot
/// drift apart: the constants above are the single source of truth.
fn validate_terms(
    origin: &String,
    destination: &String,
    cargo_description: &String,
    weight_kg: u32,
    price: i128,
) -> Result<(), ShipmentError> {
    if weight_kg == 0 || weight_kg > MAX_WEIGHT_KG || price <= 0 {
        return Err(ShipmentError::InvalidInput);
    }

    if origin.len() == 0
        || destination.len() == 0
        || cargo_description.len() == 0
        || origin.len() > MAX_LOCATION_LEN
        || destination.len() > MAX_LOCATION_LEN
        || cargo_description.len() > MAX_CARGO_LEN
    {
        return Err(ShipmentError::InvalidInput);
    }

    Ok(())
}

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

    validate_terms(
        &origin,
        &destination,
        &cargo_description,
        weight_kg,
        price,
    )?;

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
    // Make the new posting discoverable to carriers; it leaves this list on
    // accept or cancel.
    storage::append_to_list(env, DataKey::OpenList, id);

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
    require_shipper(&shipment, &shipper)?;

    if shipment.status != ShipmentStatus::Created {
        return Err(ShipmentError::InvalidStatus);
    }

    validate_terms(
        &shipment.origin,
        &destination,
        &cargo_description,
        weight_kg,
        price,
    )?;

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
    require_shipper(&shipment, &shipper)?;

    if shipment.status != ShipmentStatus::Delivered {
        return Err(ShipmentError::InvalidStatus);
    }

    let now = env.ledger().timestamp();
    shipment.status = ShipmentStatus::Completed;
    shipment.updated_at = now;
    storage::save(env, &shipment);

    let mut milestones = storage::milestones(env, shipment_id);
    milestones.completed_at = now;
    storage::store_milestones(env, shipment_id, &milestones);

    events::completed(env, &shipment);
    Ok(())
}

/// Shipper cancels — only allowed from Created or Accepted.
pub fn cancel(env: &Env, shipper: Address, shipment_id: u64) -> Result<(), ShipmentError> {
    shipper.require_auth();
    storage::require_not_paused(env)?;

    let mut shipment = storage::load(env, shipment_id)?;
    require_shipper(&shipment, &shipper)?;

    if !matches!(
        shipment.status,
        ShipmentStatus::Created | ShipmentStatus::Accepted
    ) {
        return Err(ShipmentError::InvalidStatus);
    }

    // Cancelling an `Accepted` shipment has to unwind the carrier assignment,
    // not just flip the status (#1677). Leaving it in place leaves two live
    // defects: the id stays in `CarrierList(carrier)` so
    // `get_shipments_by_carrier` keeps handing back a cancelled job, and
    // `Shipment::is_party` still treats the ex-carrier as a party to it — which
    // `dispute::open_dispute` authorises on, so the carrier of a cancelled
    // shipment could still register dispute evidence against it.
    // #1855: one shared unwind, also used by `dispute::resolve(false)`.
    storage::unassign_carrier(env, &mut shipment);

    shipment.status = ShipmentStatus::Cancelled;
    shipment.updated_at = env.ledger().timestamp();
    storage::save(env, &shipment);

    // A cancelled shipment is no longer open work, whether it was cancelled
    // from `Created` or (already-removed) `Accepted`.
    storage::remove_from_list(env, DataKey::OpenList, shipment_id);

    events::cancelled(env, &shipment);
    Ok(())
}

/// Confirm `caller` is the shipment's shipper — the one ownership check
/// every shipper-gated transition needs.
fn require_shipper(shipment: &Shipment, caller: &Address) -> Result<(), ShipmentError> {
    if shipment.shipper != *caller {
        return Err(ShipmentError::NotShipper);
    }
    Ok(())
}
