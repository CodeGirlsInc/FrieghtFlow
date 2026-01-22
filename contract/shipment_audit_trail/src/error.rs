use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum AuditError {
    ShipmentNotFound = 1,
    UnauthorizedCarrier = 2,
    UnauthorizedVerifier = 3,
    InvalidLocation = 4,
    InvalidMilestoneSequence = 5,
    ShipmentCompleted = 6,
    MilestoneNotFound = 7,
    InvalidTimeRange = 8,
}
