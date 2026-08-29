//! The contract's ABI surface.
//!
//! Every entrypoint is declared here in one `#[contractimpl]` block so the
//! externally callable interface can be read in one place; the logic behind
//! each one lives in the module named in its body ([`crate::shipper`],
//! [`crate::carrier`], [`crate::dispute`]).

use soroban_sdk::{contract, contractimpl, Address, Env, String, Vec};

use crate::errors::ShipmentError;
use crate::types::{DataKey, Shipment};
use crate::{carrier, dispute, shipper, storage};

#[contract]
pub struct ShipmentContract;

#[contractimpl]
impl ShipmentContract {
    /// One-time setup.
    pub fn initialize(env: Env, admin: Address) -> Result<(), ShipmentError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(ShipmentError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().persistent().set(&DataKey::Counter, &0u64);
        Ok(())
    }

    /// Shipper posts a new shipment. See [`shipper::create`].
    pub fn create_shipment(
        env: Env,
        shipper: Address,
        origin: String,
        destination: String,
        cargo_description: String,
        weight_kg: u32,
        price: i128,
    ) -> Result<u64, ShipmentError> {
        shipper::create(
            &env,
            shipper,
            origin,
            destination,
            cargo_description,
            weight_kg,
            price,
        )
    }

    /// Shipper confirms delivery. See [`shipper::confirm_delivery`].
    pub fn confirm_delivery(
        env: Env,
        shipper: Address,
        shipment_id: u64,
    ) -> Result<(), ShipmentError> {
        shipper::confirm_delivery(&env, shipper, shipment_id)
    }

    /// Shipper cancels the shipment. See [`shipper::cancel`].
    pub fn cancel_shipment(
        env: Env,
        shipper: Address,
        shipment_id: u64,
    ) -> Result<(), ShipmentError> {
        shipper::cancel(&env, shipper, shipment_id)
    }

    /// Carrier accepts an open shipment. See [`carrier::accept`].
    pub fn accept_shipment(
        env: Env,
        carrier: Address,
        shipment_id: u64,
    ) -> Result<(), ShipmentError> {
        carrier::accept(&env, carrier, shipment_id)
    }

    /// Carrier reports pickup. See [`carrier::mark_in_transit`].
    pub fn mark_in_transit(
        env: Env,
        carrier: Address,
        shipment_id: u64,
    ) -> Result<(), ShipmentError> {
        carrier::mark_in_transit(&env, carrier, shipment_id)
    }

    /// Carrier reports delivery. See [`carrier::mark_delivered`].
    pub fn mark_delivered(
        env: Env,
        carrier: Address,
        shipment_id: u64,
    ) -> Result<(), ShipmentError> {
        carrier::mark_delivered(&env, carrier, shipment_id)
    }

    /// Either party raises a dispute. See [`dispute::raise`].
    pub fn raise_dispute(env: Env, caller: Address, shipment_id: u64) -> Result<(), ShipmentError> {
        dispute::raise(&env, caller, shipment_id)
    }

    /// Admin resolves a dispute. See [`dispute::resolve`].
    pub fn resolve_dispute(
        env: Env,
        shipment_id: u64,
        resolve_as_completed: bool,
    ) -> Result<(), ShipmentError> {
        dispute::resolve(&env, shipment_id, resolve_as_completed)
    }

    pub fn get_shipment(env: Env, shipment_id: u64) -> Result<Shipment, ShipmentError> {
        storage::load(&env, shipment_id)
    }

    pub fn get_shipments_by_shipper(env: Env, shipper: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::ShipperList(shipper))
            .unwrap_or_else(|| Vec::new(&env))
    }

    pub fn get_shipments_by_carrier(env: Env, carrier: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::CarrierList(carrier))
            .unwrap_or_else(|| Vec::new(&env))
    }

    pub fn get_total_shipments(env: Env) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::Counter)
            .unwrap_or(0)
    }
}
