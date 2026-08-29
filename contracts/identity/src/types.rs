use soroban_sdk::{contracttype, Address, BytesN};

/// ~1 year in ledgers at ~5 second ledger close time.
pub const TTL_LEDGERS: u32 = 6_307_200;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Identity(Address),
    Admin,
    Paused,
    /// Reverse index: `user_id_hash` → the wallets currently registered
    /// against it (as a `Vec<Address>`). Kept consistent with `Identity` by
    /// every mutation path — `register_identity`, `update_identity`, and
    /// `revoke_identity` — so a hash can be looked up back to its wallet(s).
    HashToWallets(BytesN<32>),
}
