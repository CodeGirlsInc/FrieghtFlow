use soroban_sdk::{testutils::Address as _, Address};

use super::setup;
use crate::errors::ReputationError;
use crate::types::UserType;

#[test]
fn test_update_stats_carrier() {
    let ctx = setup();
    let carrier = Address::generate(&ctx.env);
    ctx.client.register_user(&carrier, &UserType::Carrier);

    ctx.client
        .update_stats(&ctx.auth_contract, &carrier, &true, &false); // on-time
    ctx.client
        .update_stats(&ctx.auth_contract, &carrier, &true, &false); // on-time
    ctx.client
        .update_stats(&ctx.auth_contract, &carrier, &false, &false); // late

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
        .update_stats(&ctx.auth_contract, &shipper, &false, &true); // success
    ctx.client
        .update_stats(&ctx.auth_contract, &shipper, &false, &false); // cancelled

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

    ctx.client.update_stats(&ctx.admin, &carrier, &true, &false);

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
        .try_update_stats(&random, &carrier, &true, &false);
    assert_eq!(result, Err(Ok(ReputationError::Unauthorized)));
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
        .update_stats(&ctx.auth_contract, &carrier, &true, &false);

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
        .update_stats(&ctx.auth_contract, &shipper, &false, &true);
    ctx.client
        .update_stats(&ctx.auth_contract, &shipper, &false, &false);

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
