#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, BytesN, Env};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum IdentityError {
    AlreadyRegistered = 1,
    NotRegistered = 2,
    Unauthorized = 3,
    NotInitialized = 4,
}

#[contracttype]
pub enum DataKey {
    Identity(Address),
    Admin,
}

// ~1 year in ledgers at ~5 second ledger time
const LEDGER_PER_YEAR: u32 = 6_307_200;

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
        Ok(())
    }

    /// Register a wallet → user_id_hash mapping.
    pub fn register_identity(
        env: Env,
        user_id_hash: BytesN<32>,
        wallet: Address,
    ) -> Result<(), IdentityError> {
        wallet.require_auth();

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
            &DataKey::Identity(wallet),
            LEDGER_PER_YEAR,
            LEDGER_PER_YEAR,
        );

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

        if !env
            .storage()
            .persistent()
            .has(&DataKey::Identity(wallet.clone()))
        {
            return Err(IdentityError::NotRegistered);
        }

        env.storage()
            .persistent()
            .remove(&DataKey::Identity(wallet));

        Ok(())
    }
}

#[cfg(test)]
mod test;
