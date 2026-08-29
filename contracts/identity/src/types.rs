use soroban_sdk::{contracttype, Address};

/// ~1 year in ledgers at ~5 second ledger close time.
pub const TTL_LEDGERS: u32 = 6_307_200;

#[contracttype]
pub enum DataKey {
    Identity(Address),
    Admin,
}
