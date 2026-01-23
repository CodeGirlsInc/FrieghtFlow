use soroban_sdk::{contracttype, Address, BytesN};

/// Fixed-point scale: lat/lng stored as degrees * 1_000_000
pub const COORD_SCALE: i128 = 1_000_000;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MilestoneType {
    PickupScheduled,
    PickupCompleted,
    DepartureFromOrigin,
    InTransitCheckpoint,
    CustomsClearance,
    ArrivalAtHub,
    DepartureFromHub,
    OutForDelivery,
    DeliveryAttempted,
    DeliveryCompleted,
    ExceptionReported,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Location {
    pub latitude: i128,  // fixed point
    pub longitude: i128, // fixed point
    pub accuracy_m: Option<u32>,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Milestone {
    pub milestone_id: u64,
    pub shipment_id: BytesN<32>,
    pub milestone_type: MilestoneType,
    pub location: Location,
    pub timestamp: u64,
    pub recorded_by: Address,
    pub description: BytesN<32>,       // short text hash (gas-friendly)
    pub photo_hash: Option<BytesN<32>>, // optional proof hash
    pub is_verified: bool,
}
