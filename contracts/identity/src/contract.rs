use soroban_sdk::{contract, contractimpl, Address, BytesN, Env};

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
            return Err(IdentityError::AlreadyRegistered);
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

        events::registered(&env, &wallet, &user_id_hash);
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

        events::revoked(&env, &wallet, &user_id_hash);
        Ok(())
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
