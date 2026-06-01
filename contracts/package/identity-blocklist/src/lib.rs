//! # Identity Blocklist Contract  [CT-06]
//!
//! Extends the FreightFlow identity system with an admin-controlled blocklist.
//! Blocked wallets cannot register an identity and are publicly queryable.
//!
//! ## Storage layout
//! - `Admin`                  – instance storage, set once at `initialize`
//! - `Identity(Address)`      – persistent, wallet → user_id_hash (BytesN<32>)
//! - `Blocklist(Address)`     – persistent, wallet → reason Symbol
//!
//! ## Accepted block reasons
//! `FRAUD`, `SAFETY_VIOLATION`, `FAKE_CERTIFICATION`, `SANCTIONS`, `OTHER`

#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, BytesN, Env,
    Symbol,
};

// ── Errors ────────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum IdentityBlocklistError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    AlreadyRegistered = 3,
    NotRegistered = 4,
    Unauthorized = 5,
    WalletBlocked = 6,
    NotBlocked = 7,
    InvalidReason = 8,
}

// ── Storage keys ──────────────────────────────────────────────────────────────

#[contracttype]
pub enum DataKey {
    Admin,
    Identity(Address),
    Blocklist(Address),
}

// ~1 year in ledgers at ~5 s per ledger
const LEDGER_PER_YEAR: u32 = 6_307_200;

// ── Valid reason symbols ──────────────────────────────────────────────────────

/// Returns `true` if `reason` is one of the accepted block reason values.
fn is_valid_reason(env: &Env, reason: &Symbol) -> bool {
    let valid = [
        symbol_short!("FRAUD"),
        symbol_short!("SAFETY_V"),   // SAFETY_VIOLATION (truncated to 8 chars)
        symbol_short!("FAKE_CRT"),   // FAKE_CERTIFICATION
        symbol_short!("SANCTIONS"),
        symbol_short!("OTHER"),
    ];
    valid.iter().any(|v| v == reason)
}

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct IdentityBlocklistContract;

#[contractimpl]
impl IdentityBlocklistContract {
    // ── Setup ─────────────────────────────────────────────────────────────

    /// One-time initialisation — sets the admin address.
    pub fn initialize(env: Env, admin: Address) -> Result<(), IdentityBlocklistError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(IdentityBlocklistError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        Ok(())
    }

    // ── Identity operations ───────────────────────────────────────────────

    /// Register a wallet → user_id_hash mapping.
    /// Fails with `WalletBlocked` if the wallet is on the blocklist.
    pub fn register_identity(
        env: Env,
        user_id_hash: BytesN<32>,
        wallet: Address,
    ) -> Result<(), IdentityBlocklistError> {
        wallet.require_auth();

        // Reject blocked wallets immediately.
        if env
            .storage()
            .persistent()
            .has(&DataKey::Blocklist(wallet.clone()))
        {
            return Err(IdentityBlocklistError::WalletBlocked);
        }

        if env
            .storage()
            .persistent()
            .has(&DataKey::Identity(wallet.clone()))
        {
            return Err(IdentityBlocklistError::AlreadyRegistered);
        }

        env.storage()
            .persistent()
            .set(&DataKey::Identity(wallet.clone()), &user_id_hash);
        env.storage().persistent().extend_ttl(
            &DataKey::Identity(wallet),
            LEDGER_PER_YEAR,
            LEDGER_PER_YEAR,
        );

        Ok(())
    }

    /// Returns `true` if `wallet` has a registered identity.
    pub fn verify_identity(env: Env, wallet: Address) -> bool {
        env.storage().persistent().has(&DataKey::Identity(wallet))
    }

    /// Returns the user_id_hash for `wallet`.
    pub fn get_user_identity(
        env: Env,
        wallet: Address,
    ) -> Result<BytesN<32>, IdentityBlocklistError> {
        env.storage()
            .persistent()
            .get(&DataKey::Identity(wallet))
            .ok_or(IdentityBlocklistError::NotRegistered)
    }

    /// Admin-only: remove a wallet's identity record.
    pub fn revoke_identity(env: Env, wallet: Address) -> Result<(), IdentityBlocklistError> {
        Self::require_admin(&env)?;

        if !env
            .storage()
            .persistent()
            .has(&DataKey::Identity(wallet.clone()))
        {
            return Err(IdentityBlocklistError::NotRegistered);
        }

        env.storage()
            .persistent()
            .remove(&DataKey::Identity(wallet));
        Ok(())
    }

    // ── Blocklist operations ──────────────────────────────────────────────

    /// Admin-only: add `wallet` to the blocklist with a reason.
    ///
    /// Accepted reasons: `FRAUD`, `SAFETY_V`, `FAKE_CRT`, `SANCTIONS`, `OTHER`
    pub fn add_to_blocklist(
        env: Env,
        wallet: Address,
        reason: Symbol,
    ) -> Result<(), IdentityBlocklistError> {
        Self::require_admin(&env)?;

        if !is_valid_reason(&env, &reason) {
            return Err(IdentityBlocklistError::InvalidReason);
        }

        env.storage()
            .persistent()
            .set(&DataKey::Blocklist(wallet.clone()), &reason);
        env.storage().persistent().extend_ttl(
            &DataKey::Blocklist(wallet.clone()),
            LEDGER_PER_YEAR,
            LEDGER_PER_YEAR,
        );

        // Emit event: (topic, data)
        env.events().publish(
            (symbol_short!("BLOCKED"), wallet.clone()),
            (wallet, reason),
        );

        Ok(())
    }

    /// Publicly callable — returns `true` if `wallet` is blocked.
    pub fn is_blocked(env: Env, wallet: Address) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::Blocklist(wallet))
    }

    /// Admin-only: remove `wallet` from the blocklist.
    pub fn remove_from_blocklist(
        env: Env,
        wallet: Address,
    ) -> Result<(), IdentityBlocklistError> {
        Self::require_admin(&env)?;

        if !env
            .storage()
            .persistent()
            .has(&DataKey::Blocklist(wallet.clone()))
        {
            return Err(IdentityBlocklistError::NotBlocked);
        }

        env.storage()
            .persistent()
            .remove(&DataKey::Blocklist(wallet.clone()));

        env.events().publish(
            (symbol_short!("UNBLOCKED"), wallet.clone()),
            wallet,
        );

        Ok(())
    }

    /// Returns the block reason for `wallet`, or `NotBlocked` if not on the list.
    pub fn get_block_reason(
        env: Env,
        wallet: Address,
    ) -> Result<Symbol, IdentityBlocklistError> {
        env.storage()
            .persistent()
            .get(&DataKey::Blocklist(wallet))
            .ok_or(IdentityBlocklistError::NotBlocked)
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    fn require_admin(env: &Env) -> Result<Address, IdentityBlocklistError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(IdentityBlocklistError::NotInitialized)?;
        admin.require_auth();
        Ok(admin)
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, BytesN as _},
        Env,
    };

    fn setup() -> (Env, Address, IdentityBlocklistContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let contract_id = env.register(IdentityBlocklistContract {}, ());
        let client = IdentityBlocklistContractClient::new(&env, &contract_id);
        client.initialize(&admin);
        (env, admin, client)
    }

    // ── Blocklist tests ───────────────────────────────────────────────────

    #[test]
    fn test_block_and_check() {
        let (env, _admin, client) = setup();
        let wallet = Address::generate(&env);

        assert!(!client.is_blocked(&wallet));

        client.add_to_blocklist(&wallet, &symbol_short!("FRAUD"));
        assert!(client.is_blocked(&wallet));
    }

    #[test]
    fn test_get_block_reason() {
        let (env, _admin, client) = setup();
        let wallet = Address::generate(&env);

        client.add_to_blocklist(&wallet, &symbol_short!("SANCTIONS"));
        let reason = client.get_block_reason(&wallet);
        assert_eq!(reason, symbol_short!("SANCTIONS"));
    }

    #[test]
    fn test_remove_from_blocklist() {
        let (env, _admin, client) = setup();
        let wallet = Address::generate(&env);

        client.add_to_blocklist(&wallet, &symbol_short!("OTHER"));
        assert!(client.is_blocked(&wallet));

        client.remove_from_blocklist(&wallet);
        assert!(!client.is_blocked(&wallet));
    }

    #[test]
    fn test_get_reason_not_blocked_fails() {
        let (env, _admin, client) = setup();
        let wallet = Address::generate(&env);

        let result = client.try_get_block_reason(&wallet);
        assert_eq!(result, Err(Ok(IdentityBlocklistError::NotBlocked)));
    }

    #[test]
    fn test_remove_not_blocked_fails() {
        let (env, _admin, client) = setup();
        let wallet = Address::generate(&env);

        let result = client.try_remove_from_blocklist(&wallet);
        assert_eq!(result, Err(Ok(IdentityBlocklistError::NotBlocked)));
    }

    // ── Registration tests ────────────────────────────────────────────────

    #[test]
    fn test_blocked_wallet_cannot_register() {
        let (env, _admin, client) = setup();
        let wallet = Address::generate(&env);
        let hash = BytesN::random(&env);

        client.add_to_blocklist(&wallet, &symbol_short!("FRAUD"));

        let result = client.try_register_identity(&hash, &wallet);
        assert_eq!(result, Err(Ok(IdentityBlocklistError::WalletBlocked)));
    }

    #[test]
    fn test_unblocked_wallet_can_register() {
        let (env, _admin, client) = setup();
        let wallet = Address::generate(&env);
        let hash = BytesN::random(&env);

        client.add_to_blocklist(&wallet, &symbol_short!("FRAUD"));
        client.remove_from_blocklist(&wallet);

        client.register_identity(&hash, &wallet);
        assert!(client.verify_identity(&wallet));
    }

    #[test]
    fn test_normal_registration_and_verify() {
        let (env, _admin, client) = setup();
        let wallet = Address::generate(&env);
        let hash = BytesN::random(&env);

        client.register_identity(&hash, &wallet);
        assert!(client.verify_identity(&wallet));
        assert_eq!(client.get_user_identity(&wallet), hash);
    }

    #[test]
    fn test_double_register_fails() {
        let (env, _admin, client) = setup();
        let wallet = Address::generate(&env);
        let hash = BytesN::random(&env);

        client.register_identity(&hash, &wallet);
        let result = client.try_register_identity(&hash, &wallet);
        assert_eq!(result, Err(Ok(IdentityBlocklistError::AlreadyRegistered)));
    }
}
