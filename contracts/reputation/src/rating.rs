//! Submitting 1-5 star ratings for completed shipments.

use soroban_sdk::{Address, Env, Vec};

use crate::errors::ReputationError;
use crate::types::{DataKey, RatingRecord, TTL_LEDGERS};
use crate::{events, storage};

/// Submit a 1-5 star rating for a completed shipment.
///
/// Rules:
/// - Score must be 1-5.
/// - Cannot rate yourself.
/// - Each address can only rate a given shipment once.
/// - `rated` must be a registered user.
pub fn submit(
    env: &Env,
    rater: Address,
    shipment_id: u64,
    rated: Address,
    score: u32,
) -> Result<u64, ReputationError> {
    rater.require_auth();

    if !(1..=5).contains(&score) {
        return Err(ReputationError::InvalidScore);
    }
    if rater == rated {
        return Err(ReputationError::CannotRateSelf);
    }

    // Prevent duplicate ratings per shipment per rater.
    let mut raters: Vec<Address> = env
        .storage()
        .persistent()
        .get(&DataKey::ShipmentRaters(shipment_id))
        .unwrap_or_else(|| Vec::new(env));

    if raters.contains(&rater) {
        return Err(ReputationError::AlreadyRatedShipment);
    }

    // The rated user must be registered.
    let mut rep = storage::load_reputation(env, &rated)?;

    // Record the rating.
    let rating_id = storage::next_rating_id(env);
    let now = env.ledger().timestamp();

    let record = RatingRecord {
        id: rating_id,
        shipment_id,
        rater: rater.clone(),
        rated,
        score,
        timestamp: now,
    };

    env.storage()
        .persistent()
        .set(&DataKey::Rating(rating_id), &record);
    env.storage()
        .persistent()
        .extend_ttl(&DataKey::Rating(rating_id), TTL_LEDGERS, TTL_LEDGERS);

    // Mark rater for this shipment.
    raters.push_back(rater);
    env.storage()
        .persistent()
        .set(&DataKey::ShipmentRaters(shipment_id), &raters);

    // Update the rated user's reputation.
    rep.total_rating_points += score * 100;
    rep.rating_count += 1;
    rep.average_rating = rep.total_rating_points / rep.rating_count;
    rep.last_updated = now;
    storage::save_reputation(env, &rep);

    events::submitted(env, &record);
    events::updated(env, &rep);
    Ok(rating_id)
}

/// Admin voids a rating, reversing its effect on the rated user's aggregate
/// and freeing the rater to submit a new rating for the same shipment.
pub fn void(env: &Env, rating_id: u64) -> Result<(), ReputationError> {
    storage::admin(env)?.require_auth();

    let record: RatingRecord = env
        .storage()
        .persistent()
        .get(&DataKey::Rating(rating_id))
        .ok_or(ReputationError::RatingNotFound)?;

    env.storage()
        .persistent()
        .remove(&DataKey::Rating(rating_id));

    // Free the rater to submit a new rating for this shipment.
    let raters: Vec<Address> = env
        .storage()
        .persistent()
        .get(&DataKey::ShipmentRaters(record.shipment_id))
        .unwrap_or_else(|| Vec::new(env));
    let mut remaining = Vec::new(env);
    for rater in raters.into_iter() {
        if rater != record.rater {
            remaining.push_back(rater);
        }
    }
    env.storage()
        .persistent()
        .set(&DataKey::ShipmentRaters(record.shipment_id), &remaining);

    // Reverse the rating's effect on the rated user's aggregate.
    let mut rep = storage::load_reputation(env, &record.rated)?;
    rep.total_rating_points = rep.total_rating_points.saturating_sub(record.score * 100);
    rep.rating_count = rep.rating_count.saturating_sub(1);
    rep.average_rating = if rep.rating_count == 0 {
        0
    } else {
        rep.total_rating_points / rep.rating_count
    };
    rep.last_updated = env.ledger().timestamp();
    storage::save_reputation(env, &rep);

    events::updated(env, &rep);
    Ok(())
}
