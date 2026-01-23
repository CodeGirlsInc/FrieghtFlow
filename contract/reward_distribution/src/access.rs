use soroban_sdk::{Address, Env};
use crate::storage;

/// Require that the caller is the admin
pub fn require_admin(env: &Env) {
    let admin = storage::get_admin(env);
    admin.require_auth();
}

/// Require that the caller is an authorized caller or admin
pub fn require_authorized(env: &Env) {
    let caller = env.invoker();
    let admin = storage::get_admin(env);
    
    if caller != admin && !storage::is_authorized_caller(env, &caller) {
        panic!("Unauthorized caller");
    }
}

/// Check if address is admin
pub fn is_admin(env: &Env, address: &Address) -> bool {
    let admin = storage::get_admin(env);
    address == &admin
}

/// Check if address is authorized
pub fn is_authorized(env: &Env, address: &Address) -> bool {
    let admin = storage::get_admin(env);
    address == &admin || storage::is_authorized_caller(env, address)
}
