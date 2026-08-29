use soroban_sdk::{testutils::Address as _, Address};

use super::setup;
use crate::errors::ReputationError;
use crate::types::UserType;

#[test]
fn test_submit_rating_and_average() {
    let ctx = setup();
    let rater1 = Address::generate(&ctx.env);
    let rater2 = Address::generate(&ctx.env);
    let rater3 = Address::generate(&ctx.env);
    let carrier = Address::generate(&ctx.env);

    ctx.client.register_user(&rater1, &UserType::Shipper);
    ctx.client.register_user(&rater2, &UserType::Shipper);
    ctx.client.register_user(&rater3, &UserType::Shipper);
    ctx.client.register_user(&carrier, &UserType::Carrier);

    ctx.client.submit_rating(&rater1, &1u64, &carrier, &5u32);
    ctx.client.submit_rating(&rater2, &2u64, &carrier, &4u32);
    ctx.client.submit_rating(&rater3, &3u64, &carrier, &3u32);

    let rep = ctx.client.get_reputation(&carrier);
    assert_eq!(rep.rating_count, 3);
    // (5+4+3)*100 / 3 = 400
    assert_eq!(rep.average_rating, 400);
}

#[test]
fn test_cannot_rate_self() {
    let ctx = setup();
    let user = Address::generate(&ctx.env);
    ctx.client.register_user(&user, &UserType::Carrier);

    let result = ctx.client.try_submit_rating(&user, &1u64, &user, &5u32);
    assert_eq!(result, Err(Ok(ReputationError::CannotRateSelf)));
}

#[test]
fn test_invalid_score() {
    let ctx = setup();
    let rater = Address::generate(&ctx.env);
    let rated = Address::generate(&ctx.env);
    ctx.client.register_user(&rater, &UserType::Shipper);
    ctx.client.register_user(&rated, &UserType::Carrier);

    assert_eq!(
        ctx.client.try_submit_rating(&rater, &1u64, &rated, &0u32),
        Err(Ok(ReputationError::InvalidScore))
    );
    assert_eq!(
        ctx.client.try_submit_rating(&rater, &1u64, &rated, &6u32),
        Err(Ok(ReputationError::InvalidScore))
    );
}

#[test]
fn test_rating_unregistered_user_fails() {
    let ctx = setup();
    let rater = Address::generate(&ctx.env);
    let stranger = Address::generate(&ctx.env);
    ctx.client.register_user(&rater, &UserType::Shipper);

    let result = ctx
        .client
        .try_submit_rating(&rater, &1u64, &stranger, &5u32);
    assert_eq!(result, Err(Ok(ReputationError::UserNotFound)));
}

#[test]
fn test_duplicate_rating_fails() {
    let ctx = setup();
    let rater = Address::generate(&ctx.env);
    let rated = Address::generate(&ctx.env);
    ctx.client.register_user(&rater, &UserType::Shipper);
    ctx.client.register_user(&rated, &UserType::Carrier);

    ctx.client.submit_rating(&rater, &1u64, &rated, &5u32);
    let result = ctx.client.try_submit_rating(&rater, &1u64, &rated, &4u32);
    assert_eq!(result, Err(Ok(ReputationError::AlreadyRatedShipment)));
}

#[test]
fn test_has_rated_shipment() {
    let ctx = setup();
    let rater = Address::generate(&ctx.env);
    let rated = Address::generate(&ctx.env);
    ctx.client.register_user(&rater, &UserType::Shipper);
    ctx.client.register_user(&rated, &UserType::Carrier);

    assert!(!ctx.client.has_rated_shipment(&1u64, &rater));
    ctx.client.submit_rating(&rater, &1u64, &rated, &4u32);
    assert!(ctx.client.has_rated_shipment(&1u64, &rater));
}

#[test]
fn test_get_rating() {
    let ctx = setup();
    let rater = Address::generate(&ctx.env);
    let rated = Address::generate(&ctx.env);
    ctx.client.register_user(&rater, &UserType::Shipper);
    ctx.client.register_user(&rated, &UserType::Carrier);

    let rating_id = ctx.client.submit_rating(&rater, &5u64, &rated, &4u32);
    let record = ctx.client.get_rating(&rating_id);

    assert_eq!(record.shipment_id, 5);
    assert_eq!(record.rater, rater);
    assert_eq!(record.rated, rated);
    assert_eq!(record.score, 4);
}

#[test]
fn test_void_rating() {
    let ctx = setup();
    let rater1 = Address::generate(&ctx.env);
    let rater2 = Address::generate(&ctx.env);
    let rated = Address::generate(&ctx.env);
    ctx.client.register_user(&rater1, &UserType::Shipper);
    ctx.client.register_user(&rater2, &UserType::Shipper);
    ctx.client.register_user(&rated, &UserType::Carrier);

    ctx.client.submit_rating(&rater1, &1u64, &rated, &5u32);
    let rating2 = ctx.client.submit_rating(&rater2, &2u64, &rated, &1u32);

    let rep_before = ctx.client.get_reputation(&rated);
    assert_eq!(rep_before.average_rating, 300); // (5+1)*100 / 2 = 300

    // Admin voids the bad rating.
    ctx.client.void_rating(&rating2);

    let rep_after = ctx.client.get_reputation(&rated);
    assert_eq!(rep_after.average_rating, 500); // 5.00
    assert_eq!(rep_after.rating_count, 1);

    // Rater2 can rate again for the same shipment.
    ctx.client.submit_rating(&rater2, &2u64, &rated, &4u32);

    let rep_final = ctx.client.get_reputation(&rated);
    assert_eq!(rep_final.average_rating, 450); // (5+4)*100 / 2 = 450
}

#[test]
fn test_void_unknown_rating_fails() {
    let ctx = setup();
    let result = ctx.client.try_void_rating(&999u64);
    assert_eq!(result, Err(Ok(ReputationError::RatingNotFound)));
}

#[test]
fn test_total_ratings_counter() {
    let ctx = setup();
    let rater1 = Address::generate(&ctx.env);
    let rater2 = Address::generate(&ctx.env);
    let rated = Address::generate(&ctx.env);
    ctx.client.register_user(&rater1, &UserType::Shipper);
    ctx.client.register_user(&rater2, &UserType::Shipper);
    ctx.client.register_user(&rated, &UserType::Carrier);

    assert_eq!(ctx.client.get_total_ratings(), 0);
    ctx.client.submit_rating(&rater1, &1u64, &rated, &5u32);
    ctx.client.submit_rating(&rater2, &2u64, &rated, &3u32);
    assert_eq!(ctx.client.get_total_ratings(), 2);
}
