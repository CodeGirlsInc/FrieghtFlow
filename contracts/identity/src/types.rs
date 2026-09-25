use soroban_sdk::{contracttype, Address, BytesN};

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
