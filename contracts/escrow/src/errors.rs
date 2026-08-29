use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    NotFound = 3,
    AlreadyFunded = 4,
    NotFunded = 5,
    InvalidStatus = 6,
    Unauthorized = 7,
    InvalidAmount = 8,
    InsufficientBalance = 9,
    Paused = 10,
}
