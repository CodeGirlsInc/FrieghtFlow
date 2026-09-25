//! Shipment completion statistics and the composite reputation score.

use soroban_sdk::{Address, Env};

use crate::errors::ReputationError;
use crate::outcome::Outcome;
use crate::types::UserType;
use crate::{events, storage};

/// Update shipment completion statistics using a typed [`Outcome`].
///
/// Only callable by the authorized shipment contract (or admin in tests).
///
/// The [`Outcome`] value names exactly one result and carries its own type
/// restriction via [`Outcome::applies_to`] — `Outcome::OnTime` and
/// `Outcome::Late` are carrier-only; `Outcome::Success` and
/// `Outcome::Cancelled` are shipper-only. Callers that pass a mismatched
/// outcome receive [`ReputationError::UserTypeMismatch`] rather than having
/// the mismatch silently ignored, as the two raw-boolean version allowed.
pub fn update(
    env: &Env,
    caller: Address,
    user: Address,
    outcome: Outcome,
) -> Result<(), ReputationError> {
    caller.require_auth();
    storage::require_not_paused(env)?;

    // Only the authorised contract or the admin may call this.
    if caller != storage::authorized_contract(env)? && caller != storage::admin(env)? {
        return Err(ReputationError::Unauthorized);
    }

    let mut rep = storage::load_reputation(env, &user)?;

    // Reject outcomes that don'\''t apply to this user'\''s type.
    if !outcome.applies_to(&rep.user_type) {
        return Err(ReputationError::UserTypeMismatch);
    }

    rep.total_completed += 1;

    match rep.user_type {
        UserType::Carrier => {
            if outcome.is_positive() {
                rep.on_time_count += 1;
            } else {
                rep.late_count += 1;
            }
        }
        UserType::Shipper => {
            if outcome.is_positive() {
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
