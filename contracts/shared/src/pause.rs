#![no_std]
//! Shared pause/circuit-breaker module for FreightFlow contracts.
//!
//! Usage in any contract:
//!   - Call `assert_not_paused(&env)` at the top of every state-mutating fn.
//!   - Expose `pause` / `unpause` admin fns that delegate here.
//!
//! Note: full WASM upgrade requires Soroban's `update_current_contract_wasm`;
//! that is out of scope. This pause flag is the immediate safety mechanism.

use soroban_sdk::{contracterror, Address, Env, Symbol};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum PauseError {
    ContractPaused = 100,
}

const PAUSED_KEY: &str = "IsPaused";

fn paused_key(env: &Env) -> Symbol {
    Symbol::new(env, PAUSED_KEY)
}

/// Returns true if the contract is currently paused.
pub fn is_paused(env: &Env) -> bool {
    env.storage().instance().get(&paused_key(env)).unwrap_or(false)
}



/// Generic page result.
#[contracttype]
pub struct Page<T> {
    pub items: soroban_sdk::Vec<T>,
    pub total: u32,
}

/// Aborts with PauseError::ContractPaused if paused.
/// Call this at the top of every state-mutating function.
pub fn assert_not_paused(env: &Env) -> Result<(), PauseError> {
    if is_paused(env) {
        Err(PauseError::ContractPaused)
    } else {
        Ok(())
    }
}

/// Admin-gated: pause all state-mutating operations.
pub fn pause(env: &Env, admin: &Address) {
    admin.require_auth();
    env.storage().instance().set(&paused_key(env), &true);
}

/// Admin-gated: resume normal operations.
pub fn unpause(env: &Env, admin: &Address) {
    admin.require_auth();
    env.storage().instance().set(&paused_key(env), &false);
}
