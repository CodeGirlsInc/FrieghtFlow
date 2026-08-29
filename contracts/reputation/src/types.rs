use soroban_sdk::{contracttype, Address};

/// ~1 year in ledgers at ~5 s/ledger.
pub const TTL_LEDGERS: u32 = 6_307_200;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum UserType {
    Carrier,
    Shipper,
}

/// Reputation profile stored per user address.
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Reputation {
    pub user: Address,
    pub user_type: UserType,
    pub total_completed: u32,
    /// Sum of all rating scores × 100 (for fixed-point average).
    pub total_rating_points: u32,
    pub rating_count: u32,
    /// On-time deliveries (carriers only).
    pub on_time_count: u32,
    /// Late deliveries (carriers only).
    pub late_count: u32,
    /// Successful shipments (shippers only).
    pub success_count: u32,
    /// Cancelled shipments (shippers only).
    pub cancel_count: u32,
    /// `total_rating_points / rating_count` — 500 = 5.00 stars.
    pub average_rating: u32,
    pub last_updated: u64,
}

/// A single rating record.
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct RatingRecord {
    pub id: u64,
    pub shipment_id: u64,
    pub rater: Address,
    pub rated: Address,
    /// Raw score 1-5.
    pub score: u32,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    AuthorizedContract, // Shipment contract allowed to call update_stats
    RatingCounter,
    Reputation(Address),
    Rating(u64),
    ShipmentRaters(u64), // Vec<Address> — who has already rated this shipment
    Paused,
}
