//! User registration.

use soroban_sdk::{Address, Env};

use crate::errors::ReputationError;
use crate::types::{DataKey, Reputation, UserType};
use crate::{events, storage};

/// Register a user.  Called once per address (e.g. at account creation).
pub fn register(env: &Env, user: Address, user_type: UserType) -> Result<(), ReputationError> {
    user.require_auth();

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
