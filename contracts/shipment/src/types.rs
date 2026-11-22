//! Shipment records and the storage keys this contract owns.

use soroban_sdk::{contracttype, Address};

// The record and its status are shared with every crate that decodes them
// (notably `document`); `common` holds the single definition.
pub use common::shipment::{Shipment, ShipmentStatus};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Counter,
    Shipment(u64),
    ShipperList(Address),
    CarrierList(Address),
    Paused,
    /// Vec<u64> of shipments still in `Created`, for carrier discovery.
    /// Appended on create and removed on accept/cancel.
    OpenList,
}
