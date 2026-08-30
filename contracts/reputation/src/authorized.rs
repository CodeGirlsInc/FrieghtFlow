//! Admin-only management of the authorized caller address.
//!
//! `initialize` sets [`DataKey::AuthorizedContract`] — the shipment contract
//! allowed to call `update_stats` without being the admin — exactly once. If
//! that contract is ever redeployed, the link breaks permanently and the
//! reputation contract has to be redeployed too, losing accumulated state.
//!
//! [`set`] makes the link updatable in place.

use soroban_sdk::{Address, Env};

use crate::errors::ReputationError;
use crate::storage;
use crate::types::DataKey;

/// Repoint `update_stats` at a new authorized caller.
///
/// Only the current admin may call this. The change takes effect immediately:
/// the previously authorized address is rejected by the very next
/// `update_stats` call, because that check reads this key each time.
pub fn set(env: &Env, admin: Address, new_contract: Address) -> Result<(), ReputationError> {
    admin.require_auth();
    if admin != storage::admin(env)? {
        return Err(ReputationError::Unauthorized);
    }
    env.storage()
        .instance()
        .set(&DataKey::AuthorizedContract, &new_contract);
    Ok(())
}
