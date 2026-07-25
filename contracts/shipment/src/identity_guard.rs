#![no_std]
//! Identity verification guard for the shipment contract.
//! Calls identity.verify_identity before sensitive actions when enforcement is on.

use soroban_sdk::{contractclient, Address, Env, Symbol};

/// Minimal client interface for the Identity contract.
#[contractclient(name = "IdentityClient")]
pub trait IdentityInterface {
    fn verify_identity(env: Env, address: Address) -> bool;
}

/// Storage keys used by this module.
pub const IDENTITY_CONTRACT_KEY: &str = "IdContract";
pub const ENFORCE_KEY: &str = "EnforceId";

/// Admin: configure the identity contract address.
pub fn set_identity_contract(env: &Env, admin: &Address, identity_contract: Address) {
    admin.require_auth();
    env.storage().instance().set(&Symbol::new(env, IDENTITY_CONTRACT_KEY), &identity_contract);
}

/// Admin: toggle identity enforcement on/off.
pub fn set_enforce_identity(env: &Env, admin: &Address, enforce: bool) {
    admin.require_auth();
    env.storage().instance().set(&Symbol::new(env, ENFORCE_KEY), &enforce);
}

/// Returns true when enforcement is off or the address passes identity check.
/// Returns false when enforcement is on but the identity contract is not yet configured.
pub fn is_identity_verified(env: &Env, address: &Address) -> bool {
    let enforce: bool = env.storage().instance()
        .get(&Symbol::new(env, ENFORCE_KEY))
        .unwrap_or(false);
    if !enforce {
        return true;
    }
    if let Some(id_addr) = env.storage().instance()
        .get::<Symbol, Address>(&Symbol::new(env, IDENTITY_CONTRACT_KEY))
    {
        let client = IdentityClient::new(env, &id_addr);
        return client.verify_identity(address);
    }
    false
}
