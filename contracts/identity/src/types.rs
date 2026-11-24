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
    /// Persistent tombstone written by `revoke_identity` (#1857). While this
    /// marker exists the wallet may not register or update an identity, so an
    /// admin revocation cannot be undone by the wallet simply re-registering.
    /// `reinstate_identity` clears it; self-deregistration never writes it.
    Revoked(Address),
}
