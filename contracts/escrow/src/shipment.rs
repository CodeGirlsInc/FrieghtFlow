//! The slice of the shipment contract's interface needed to validate funding.
//!
//! Mirrors `contracts/document/src/shipment.rs`: a `#[contractclient]` avoids
//! linking the shipment crate into escrow's WASM (which would re-export its
//! entrypoints). `Shipment` must stay field-for-field identical to
//! `contracts/shipment/src/types.rs`, because a `#[contracttype]` struct is
//! decoded as a map keyed by field name.

use soroban_sdk::{contractclient, contracttype, Address, Env, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ShipmentStatus {
    Created,
    Accepted,
    InTransit,
    Delivered,
    Completed,
    Disputed,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Shipment {
    pub id: u64,
    pub shipper: Address,
    pub carrier: Option<Address>,
    pub origin: String,
    pub destination: String,
    pub cargo_description: String,
    pub weight_kg: u32,
    pub price: i128,
    pub status: ShipmentStatus,
    pub created_at: u64,
    pub updated_at: u64,
}

#[contractclient(name = "ShipmentClient")]
pub trait ShipmentInterface {
    /// Mirrors `ShipmentContract::get_shipment`; `try_get_shipment` surfaces
    /// an unknown id as `Err(..)` rather than trapping this contract.
    fn get_shipment(env: Env, shipment_id: u64) -> Shipment;
}
