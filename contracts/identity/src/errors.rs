use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum IdentityError {
    AlreadyRegistered = 1,
    NotRegistered = 2,
    Unauthorized = 3,
    NotInitialized = 4,
}
