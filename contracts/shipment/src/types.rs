use soroban_sdk::{contracttype, Address, BytesN, String};

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
}
