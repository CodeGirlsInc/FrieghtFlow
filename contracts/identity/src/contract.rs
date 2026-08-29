use soroban_sdk::{contract, contractimpl, Address, BytesN, Env, Vec};

use crate::errors::IdentityError;
use crate::events;
use crate::types::{DataKey, TTL_LEDGERS};

#[contract]
pub struct IdentityContract;

#[contractimpl]
impl IdentityContract {
    /// One-time initialization — sets the admin.
    pub fn initialize(env: Env, admin: Address) -> Result<(), IdentityError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(IdentityError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Paused, &false);
        Ok(())
    }

    /// Transfer admin rights to a new address. Callable only by the current admin.
    pub fn rotate_admin(
        env: Env,
        current_admin: Address,
        new_admin: Address,
    ) -> Result<(), IdentityError> {
        current_admin.require_auth();
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(IdentityError::NotInitialized)?;
        if current_admin != admin {
            return Err(IdentityError::Unauthorized);
        }
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        Ok(())
    }

    /// Admin-only: pause all state-mutating entrypoints.
    pub fn pause(env: Env, admin: Address) -> Result<(), IdentityError> {
        admin.require_auth();
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(IdentityError::NotInitialized)?;
        if admin != stored_admin {
            return Err(IdentityError::Unauthorized);
        }
        env.storage().instance().set(&DataKey::Paused, &true);
        Ok(())
    }

    /// Admin-only: resume state-mutating entrypoints.
    pub fn unpause(env: Env, admin: Address) -> Result<(), IdentityError> {
        admin.require_auth();
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(IdentityError::NotInitialized)?;
        if admin != stored_admin {
            return Err(IdentityError::Unauthorized);
        }
        env.storage().instance().set(&DataKey::Paused, &false);
        Ok(())
    }

    /// Register a wallet → user_id_hash mapping.
    pub fn register_identity(
        env: Env,
        user_id_hash: BytesN<32>,
        wallet: Address,
    ) -> Result<(), IdentityError> {
        wallet.require_auth();
        Self::require_not_paused(&env)?;

        if env
            .storage()
            .persistent()
            .has(&DataKey::Identity(wallet.clone()))
        {
            return Err(IdentityError::AlreadyRegistered);
        }

        env.storage()
            .persistent()
            .set(&DataKey::Identity(wallet.clone()), &user_id_hash);

        env.storage().persistent().extend_ttl(
            &DataKey::Identity(wallet.clone()),
            TTL_LEDGERS,
            TTL_LEDGERS,
        );

        Self::index_wallet(&env, &user_id_hash, &wallet);

        events::registered(&env, &wallet, &user_id_hash);
        Ok(())
    }

    /// Replace the `user_id_hash` of an already-registered wallet, in one
    /// wallet-signed transaction — no admin `revoke_identity` required first,
    /// and no window in which the wallet has no registered identity.
    ///
    /// Fails with `NotRegistered` if `wallet` has no existing identity; use
    /// `register_identity` for a fresh registration instead.
    pub fn update_identity(
        env: Env,
        wallet: Address,
        new_user_id_hash: BytesN<32>,
    ) -> Result<(), IdentityError> {
        wallet.require_auth();
        Self::require_not_paused(&env)?;

        let old_user_id_hash: BytesN<32> = env
            .storage()
            .persistent()
            .get(&DataKey::Identity(wallet.clone()))
            .ok_or(IdentityError::NotRegistered)?;

        env.storage()
            .persistent()
            .set(&DataKey::Identity(wallet.clone()), &new_user_id_hash);

        env.storage().persistent().extend_ttl(
            &DataKey::Identity(wallet.clone()),
            TTL_LEDGERS,
            TTL_LEDGERS,
        );

        Self::unindex_wallet(&env, &old_user_id_hash, &wallet);
        Self::index_wallet(&env, &new_user_id_hash, &wallet);

        events::updated(&env, &wallet, &new_user_id_hash);
        Ok(())
    }

    /// Returns true if `wallet` has a registered identity.
    pub fn verify_identity(env: Env, wallet: Address) -> bool {
        env.storage().persistent().has(&DataKey::Identity(wallet))
    }

    /// Returns the user_id_hash for `wallet`.
    pub fn get_user_identity(env: Env, wallet: Address) -> Result<BytesN<32>, IdentityError> {
        env.storage()
            .persistent()
            .get(&DataKey::Identity(wallet))
            .ok_or(IdentityError::NotRegistered)
    }

    /// Reverse lookup: every wallet currently registered against
    /// `user_id_hash`. Empty if none are.
    pub fn get_wallets_by_identity(env: Env, user_id_hash: BytesN<32>) -> Vec<Address> {
        env.storage()
            .persistent()
            .get(&DataKey::HashToWallets(user_id_hash))
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Admin-only: remove a wallet's identity record.
    pub fn revoke_identity(env: Env, wallet: Address) -> Result<(), IdentityError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(IdentityError::NotInitialized)?;

        admin.require_auth();
        Self::require_not_paused(&env)?;

        let user_id_hash: BytesN<32> = env
            .storage()
            .persistent()
            .get(&DataKey::Identity(wallet.clone()))
            .ok_or(IdentityError::NotRegistered)?;

        env.storage()
            .persistent()
            .remove(&DataKey::Identity(wallet.clone()));

        Self::unindex_wallet(&env, &user_id_hash, &wallet);

        events::revoked(&env, &wallet, &user_id_hash);
        Ok(())
    }

    /// Add `wallet` to the reverse index for `user_id_hash`.
    fn index_wallet(env: &Env, user_id_hash: &BytesN<32>, wallet: &Address) {
        let key = DataKey::HashToWallets(user_id_hash.clone());
        let mut wallets: Vec<Address> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| Vec::new(env));

        wallets.push_back(wallet.clone());
        env.storage().persistent().set(&key, &wallets);
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);
    }

    /// Remove `wallet` from the reverse index for `user_id_hash`, dropping
    /// the index entry entirely once it is empty.
    fn unindex_wallet(env: &Env, user_id_hash: &BytesN<32>, wallet: &Address) {
        let key = DataKey::HashToWallets(user_id_hash.clone());
        let wallets: Vec<Address> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| Vec::new(env));

        let mut remaining = Vec::new(env);
        for w in wallets.iter() {
            if w != *wallet {
                remaining.push_back(w);
            }
        }

        if remaining.is_empty() {
            env.storage().persistent().remove(&key);
        } else {
            env.storage().persistent().set(&key, &remaining);
            env.storage()
                .persistent()
                .extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);
        }
    }

    fn require_not_paused(env: &Env) -> Result<(), IdentityError> {
        if env
            .storage()
            .instance()
            .get(&DataKey::Paused)
            .unwrap_or(false)
        {
            return Err(IdentityError::Paused);
        }
        Ok(())
    }
}
