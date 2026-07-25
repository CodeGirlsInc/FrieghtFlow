#![no_std]
//! Helper: cross-contract call to update reputation stats after shipment completion.

use soroban_sdk::{contractclient, Address, Env};

/// Minimal client interface for the Reputation contract.
/// Matches the `update_stats` signature in contracts/reputation/src/lib.rs.
#[contractclient(name = "ReputationClient")]
pub trait ReputationInterface {
    fn update_stats(env: Env, address: Address, on_time: bool);
}

/// Stored key for the configured reputation contract address.
pub const REP_CONTRACT_KEY: &str = "RepContract";

/// Call reputation.update_stats if a reputation contract address has been configured.
pub fn try_update_reputation(env: &Env, carrier: &Address, on_time: bool) {
    let key = soroban_sdk::Symbol::new(env, REP_CONTRACT_KEY);
    if let Some(rep_addr) = env
        .storage()
        .instance()
        .get::<soroban_sdk::Symbol, Address>(&key)
    {
        let client = ReputationClient::new(env, &rep_addr);
        client.update_stats(carrier, &on_time);
    }
}

/// Admin: set (or update) the reputation contract address.
pub fn set_reputation_contract(env: &Env, admin: &Address, rep_contract: Address) {
    admin.require_auth();
    let key = soroban_sdk::Symbol::new(env, REP_CONTRACT_KEY);
    env.storage().instance().set(&key, &rep_contract);
}
