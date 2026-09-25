use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum IdentityError {
    AlreadyRegistered = 1,
    NotRegistered = 2,
    Unauthorized = 3,
    NotInitialized = 4,
    Paused = 5,
    /// The contract's one-time `initialize` was already called.
    ///
    /// Distinct from `AlreadyRegistered`, which means a specific *wallet*
    /// already has an identity record — this means the *contract itself*
    /// already has an admin set. Added last (rather than renumbered in next
    /// to `NotInitialized`, as the other four contracts in this workspace do)
    /// so existing numeric error codes for this contract are unaffected.
    AlreadyInitialized = 6,
    /// The `user_id_hash` already has `MAX_WALLETS_PER_HASH` wallets
    /// registered against it. Revoke one before registering another.
    ///
    /// This bounds `unindex_wallet`'\''s O(n) rebuild cost and the read cost of
    /// `get_wallets_by_identity` (issue #1455).
    WalletLimitReached = 7,
}
