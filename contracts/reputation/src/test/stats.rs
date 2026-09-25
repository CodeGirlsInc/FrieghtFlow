use soroban_sdk::{testutils::Address as _, Address};

use super::setup;
use crate::errors::ReputationError;
use crate::outcome::Outcome;
use crate::types::UserType;

#[test]
fn test_update_stats_carrier() {
    let ctx = setup();
    let carrier = Address::generate(&ctx.env);
    ctx.client.register_user(&carrier, &UserType::Carrier);

    ctx.client
        .update_stats(&ctx.auth_contract, &carrier, &Outcome::OnTime);
    ctx.client
        .update_stats(&ctx.auth_contract, &carrier, &Outcome::OnTime);
    ctx.client
        .update_stats(&ctx.auth_contract, &carrier, &Outcome::Late);

    let rep = ctx.client.get_reputation(&carrier);
    assert_eq!(rep.total_completed, 3);
    assert_eq!(rep.on_time_count, 2);
    assert_eq!(rep.late_count, 1);
}

#[test]
fn test_update_stats_shipper() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);
    ctx.client.register_user(&shipper, &UserType::Shipper);

    ctx.client
        .update_stats(&ctx.auth_contract, &shipper, &Outcome::Success);
    ctx.client
        .update_stats(&ctx.auth_contract, &shipper, &Outcome::Cancelled);

    let rep = ctx.client.get_reputation(&shipper);
    assert_eq!(rep.total_completed, 2);
    assert_eq!(rep.success_count, 1);
    assert_eq!(rep.cancel_count, 1);
}

#[test]
fn test_admin_may_update_stats() {
    let ctx = setup();
    let carrier = Address::generate(&ctx.env);
    ctx.client.register_user(&carrier, &UserType::Carrier);

    ctx.client.update_stats(&ctx.admin, &carrier, &Outcome::OnTime);

    assert_eq!(ctx.client.get_reputation(&carrier).total_completed, 1);
}

#[test]
fn test_unauthorized_update_stats_fails() {
    let ctx = setup();
    let random = Address::generate(&ctx.env);
    let carrier = Address::generate(&ctx.env);
    ctx.client.register_user(&carrier, &UserType::Carrier);

    let result = ctx
        .client
        .try_update_stats(&random, &carrier, &Outcome::OnTime);
    assert_eq!(result, Err(Ok(ReputationError::Unauthorized)));
}

/// Passing a carrier-only Outcome for a Shipper must return UserTypeMismatch.
#[test]
fn test_update_stats_user_type_mismatch() {
    let ctx = setup();
    let shipper = Address::generate(&ctx.env);
    ctx.client.register_user(&shipper, &UserType::Shipper);

    // OnTime is carrier-only.
    let result = ctx
        .client
        .try_update_stats(&ctx.auth_contract, &shipper, &Outcome::OnTime);
    assert_eq!(result, Err(Ok(ReputationError::UserTypeMismatch)));

    // Late is also carrier-only.
    let result = ctx
        .client
        .try_update_stats(&ctx.auth_contract, &shipper, &Outcome::Late);
    assert_eq!(result, Err(Ok(ReputationError::UserTypeMismatch)));
}

/// Passing a shipper-only Outcome for a Carrier must return UserTypeMismatch.
#[test]
fn test_update_stats_user_type_mismatch_carrier_gets_shipper_outcome() {
    let ctx = setup();
    let carrier = Address::generate(&ctx.env);
    ctx.client.register_user(&carrier, &UserType::Carrier);

    // Success is shipper-only.
    let result = ctx
        .client
        .try_update_stats(&ctx.auth_contract, &carrier, &Outcome::Success);
    assert_eq!(result, Err(Ok(ReputationError::UserTypeMismatch)));
}

#[test]
fn test_calculate_score_perfect_carrier() {
    let ctx = setup();
    let rater = Address::generate(&ctx.env);
    let carrier = Address::generate(&ctx.env);
    ctx.client.register_user(&rater, &UserType::Shipper);
    ctx.client.register_user(&carrier, &UserType::Carrier);

    // 5-star rating
    ctx.client.submit_rating(&rater, &1u64, &carrier, &5u32);
    // Perfect on-time record
    ctx.client
        .update_stats(&ctx.auth_contract, &carrier, &Outcome::OnTime);

    // avg_rating = 500 (5 stars × 100), on_time_pct = 100%, rating/completed = 100%
    // rating_component = 500, rate_component = 300, completion_component = 200
    assert_eq!(ctx.client.calculate_score(&carrier), 1000);
}

#[test]
fn test_calculate_score_shipper() {
    let ctx = setup();
    let rater = Address::generate(&ctx.env);
    let shipper = Address::generate(&ctx.env);
    ctx.client.register_user(&rater, &UserType::Carrier);
    ctx.client.register_user(&shipper, &UserType::Shipper);

    ctx.client.submit_rating(&rater, &1u64, &shipper, &4u32); // 4 stars
    // 1 successful out of 2 completed.
    ctx.client
        .update_stats(&ctx.auth_contract, &shipper, &Outcome::Success);
    ctx.client
        .update_stats(&ctx.auth_contract, &shipper, &Outcome::Cancelled);

    // rating_component = 400 (4 stars × 100)
    // rate_component = 1/2 success × 3 = 150
    // completion_component = 1 rated / 2 completed × 2 = 100
    // Total = 400 + 150 + 100 = 650
    assert_eq!(ctx.client.calculate_score(&shipper), 650);
}

#[test]
fn test_calculate_score_new_user() {
    let ctx = setup();
    let user = Address::generate(&ctx.env);
    ctx.client.register_user(&user, &UserType::Carrier);

    assert_eq!(ctx.client.calculate_score(&user), 0); // no data yet
}
