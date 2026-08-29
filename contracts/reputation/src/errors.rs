use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ReputationError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    UserNotFound = 3,
    UserAlreadyRegistered = 4,
    InvalidScore = 5,
    AlreadyRatedShipment = 6,
    CannotRateSelf = 7,
    Unauthorized = 8,
    UserTypeMismatch = 9,
    RatingNotFound = 10,
}
