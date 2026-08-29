use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ShipmentError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    NotFound = 3,
    Unauthorized = 4,
    InvalidStatus = 5,
    InvalidInput = 6,
    NotCarrier = 7,
    NotShipper = 8,
    Paused = 9,
}
