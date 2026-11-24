//! Shipment records and the storage keys this contract owns.

use soroban_sdk::{contracttype, Address, BytesN};

// The record and its status are shared with every crate that decodes them
// (notably `document`); `common` holds the single definition.
pub use common::shipment::{Shipment, ShipmentStatus};

/// Who raised a dispute, when, and an optional hash of the off-chain reason.
///
/// Stored under its own key (`DataKey::Dispute`) so adding these fields does
/// not change the `Shipment` encoding used by every event payload (#1863).
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Dispute {
    pub raised_by: Address,
    pub raised_at: u64,
    pub reason_hash: Option<BytesN<32>>,
}

/// Lifecycle timestamps that would otherwise be overwritten by `updated_at`.
/// `0` means the transition has not happened yet (#1865).
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Milestones {
    pub accepted_at: u64,
    pub in_transit_at: u64,
    pub delivered_at: u64,
    pub completed_at: u64,
}

impl Default for Milestones {
    fn default() -> Self {
        Self {
            accepted_at: 0,
            in_transit_at: 0,
            delivered_at: 0,
            completed_at: 0,
        }
    }
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Counter,
    Shipment(u64),
    ShipperList(Address),
    CarrierList(Address),
    /// `shipment_id` → [`Dispute`], written only when a dispute is raised.
    Dispute(u64),
    /// `shipment_id` → [`Milestones`], written on accept/pickup/delivery/confirm.
    Milestones(u64),
    Paused,
    /// Vec<u64> of shipments still in `Created`, for carrier discovery.
    /// Appended on create and removed on accept/cancel.
    OpenList,
}
