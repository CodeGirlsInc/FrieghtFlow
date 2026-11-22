//! The shipment record shared by the shipment contract and its consumers.
//!
//! `document` decodes this value from a cross-contract `get_shipment` call.
//! Defining it once here is what keeps that decode in step with the shipment
//! contract: a field added in one place can no longer drift from the other.

use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ShipmentStatus {
    Created,   // Shipper posted, awaiting carrier
    Accepted,  // Carrier accepted, awaiting pickup
    InTransit, // Carrier has picked up cargo
    Delivered, // Carrier marked as delivered, awaiting shipper confirm
    Completed, // Shipper confirmed delivery — triggers payment release
    Disputed,  // Either party raised a dispute
    Cancelled, // Cancelled by shipper (only from Created or Accepted)
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
    /// Price in stroops (1 XLM = 10,000,000 stroops)
    pub price: i128,
    pub status: ShipmentStatus,
    pub created_at: u64,
    pub updated_at: u64,
}

impl Shipment {
    /// True if `addr` is the shipper or the assigned carrier.
    pub fn is_party(&self, addr: &Address) -> bool {
        self.shipper == *addr || self.carrier.as_ref() == Some(addr)
    }
}
