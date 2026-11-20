//! User registration.

use soroban_sdk::{Address, Env};

use crate::errors::ReputationError;
use crate::types::{DataKey, Reputation, UserType};
use crate::{events, storage};

/// Register a user.  Called once per address (e.g. at account creation).
pub fn register(env: &Env, user: Address, user_type: UserType) -> Result<(), ReputationError> {
    user.require_auth();
    storage::require_not_paused(env)?;

    if env
        .storage()
        .persistent()
        .has(&DataKey::Reputation(user.clone()))
    {
        return Err(ReputationError::UserAlreadyRegistered);
    }

    let rep = Reputation {
        user,
        user_type,
        total_completed: 0,
        total_rating_points: 0,
        rating_count: 0,
        on_time_count: 0,
        late_count: 0,
        success_count: 0,
        cancel_count: 0,
        average_rating: 0,
        last_updated: env.ledger().timestamp(),
    };

    storage::save_reputation(env, &rep);

    events::registered(env, &rep);
    Ok(())
}

/// Replace a mis-registered `UserType`, in one user-signed transaction.
///
/// `register` locks a user's type in at registration time and a second call
/// fails with `UserAlreadyRegistered`; this entrypoint is the single
/// correction path for a Carrier registered as Shipper (or vice versa),
/// mirroring identity's `update_identity` which lets a wallet fix its own
/// record without an admin round-trip.
///
/// Existing per-type counters are preserved — changing the label never deletes
/// earned history. Once the type is corrected, `stats::update` and
/// `stats::score` simply select the counters for the new type.
pub fn update(env: &Env, user: Address, user_type: UserType) -> Result<(), ReputationError> {
    user.require_auth();
    storage::require_not_paused(env)?;

    let mut rep = storage::load_reputation(env, &user)?;

    rep.user_type = user_type;
    rep.last_updated = env.ledger().timestamp();
    storage::save_reputation(env, &rep);

    events::updated(env, &rep);
    Ok(())
}
