//! Shipment completion statistics and the composite reputation score.

use soroban_sdk::{Address, Env};

use crate::errors::ReputationError;
use crate::types::UserType;
use crate::{events, storage};

/// Update shipment completion statistics.
///
/// Only callable by the authorized shipment contract (or admin in tests).
///
/// For carriers: `was_on_time` governs punctuality counters.
/// For shippers: `was_successful` governs completion counters.
pub fn update(
    env: &Env,
    caller: Address,
    user: Address,
    was_on_time: bool,
    was_successful: bool,
) -> Result<(), ReputationError> {
    caller.require_auth();

    // Only the authorised contract or the admin may call this.
    if caller != storage::authorized_contract(env)? && caller != storage::admin(env)? {
        return Err(ReputationError::Unauthorized);
    }

    let mut rep = storage::load_reputation(env, &user)?;

    rep.total_completed += 1;

    match rep.user_type {
        UserType::Carrier => {
            if was_on_time {
                rep.on_time_count += 1;
            } else {
                rep.late_count += 1;
            }
        }
        UserType::Shipper => {
            if was_successful {
                rep.success_count += 1;
            } else {
                rep.cancel_count += 1;
            }
        }
    }

    rep.last_updated = env.ledger().timestamp();
    storage::save_reputation(env, &rep);

    events::updated(env, &rep);
    Ok(())
}

/// Calculate a 0-1000 composite reputation score.
///
/// ```text
/// Carriers:  avg_rating (0-500) + on_time_pct × 3 + rated_pct × 2
/// Shippers:  avg_rating (0-500) + success_pct × 3 + rated_pct × 2
/// ```
/// Capped at 1000.
pub fn score(env: &Env, user: Address) -> Result<u32, ReputationError> {
    let rep = storage::load_reputation(env, &user)?;

    // Rating component: average_rating is already ×100 (500 = 5.00 stars),
    // so it is already in the 0-500 range this component wants.
    let rating_component = rep.average_rating.min(500);

    if rep.total_completed == 0 {
        return Ok(rating_component);
    }

    let hits = match rep.user_type {
        UserType::Carrier => rep.on_time_count,
        UserType::Shipper => rep.success_count,
    };
    // On-time / success percentage × 3 → 0-300
    let rate_component = ((hits as u64 * 100) / rep.total_completed as u64 * 3) as u32;

    // How many completed shipments were actually rated × 2 → 0-200
    let rated_pct = (rep.rating_count as u64 * 100) / rep.total_completed as u64;
    let completion_component = (rated_pct * 2).min(200) as u32;

    Ok((rating_component + rate_component + completion_component).min(1000))
}
