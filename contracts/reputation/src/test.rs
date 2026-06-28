#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

fn setup() -> (Env, Address, Address, ReputationContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let auth_contract = Address::generate(&env); // simulates shipment contract
    let contract_id = env.register(ReputationContract {}, ());
    let client = ReputationContractClient::new(&env, &contract_id);
    client.initialize(&admin, &auth_contract);

    (env, admin, auth_contract, client)
}

/// Record one rating; get_reputation should return the correct totals.
#[test]
fn test_record_single_rating() {
    let (env, _, _, client) = setup();
    let rater = Address::generate(&env);
    let carrier = Address::generate(&env);
    client.register_user(&rater, &UserType::Shipper);
    client.register_user(&carrier, &UserType::Carrier);

    client.submit_rating(&rater, &1u64, &carrier, &5u32);

    let rep = client.get_reputation(&carrier);
    assert_eq!(rep.rating_count, 1);
    assert_eq!(rep.average_rating, 500);
}

#[test]
fn test_register_user() {
    let (env, _, _, client) = setup();
    let user = Address::generate(&env);

    client.register_user(&user, &UserType::Carrier);

    let rep = client.get_reputation(&user);
    assert_eq!(rep.user, user);
    assert_eq!(rep.user_type, UserType::Carrier);
    assert_eq!(rep.rating_count, 0);
    assert_eq!(rep.average_rating, 0);
}

#[test]
fn test_register_twice_fails() {
    let (env, _, _, client) = setup();
    let user = Address::generate(&env);

    client.register_user(&user, &UserType::Carrier);
    let result = client.try_register_user(&user, &UserType::Carrier);
    assert_eq!(result, Err(Ok(ReputationError::UserAlreadyRegistered)));
}

/// Record 5 ratings (mix of star values); verify the running average.
#[test]
fn test_record_multiple_ratings_aggregates_correctly() {
    let (env, _, _, client) = setup();
    let rater1 = Address::generate(&env);
    let rater2 = Address::generate(&env);
    let rater3 = Address::generate(&env);
    let carrier = Address::generate(&env);

    client.register_user(&rater1, &UserType::Shipper);
    client.register_user(&rater2, &UserType::Shipper);
    client.register_user(&rater3, &UserType::Shipper);
    client.register_user(&carrier, &UserType::Carrier);

    client.submit_rating(&rater1, &1u64, &carrier, &5u32);
    client.submit_rating(&rater2, &2u64, &carrier, &4u32);
    client.submit_rating(&rater3, &3u64, &carrier, &3u32);

    let rep = client.get_reputation(&carrier);
    assert_eq!(rep.rating_count, 3);
    // (5+4+3)*100 / 3 = 400
    assert_eq!(rep.average_rating, 400);
}

#[test]
fn test_cannot_rate_self() {
    let (env, _, _, client) = setup();
    let user = Address::generate(&env);
    client.register_user(&user, &UserType::Carrier);

    let result = client.try_submit_rating(&user, &1u64, &user, &5u32);
    assert_eq!(result, Err(Ok(ReputationError::CannotRateSelf)));
}

/// Recording a rating of 0 or 6 should fail with InvalidScore.
#[test]
fn test_star_rating_out_of_range_fails() {
    let (env, _, _, client) = setup();
    let rater = Address::generate(&env);
    let rated = Address::generate(&env);
    client.register_user(&rater, &UserType::Shipper);
    client.register_user(&rated, &UserType::Carrier);

    assert_eq!(
        client.try_submit_rating(&rater, &1u64, &rated, &0u32),
        Err(Ok(ReputationError::InvalidScore))
    );
    assert_eq!(
        client.try_submit_rating(&rater, &1u64, &rated, &6u32),
        Err(Ok(ReputationError::InvalidScore))
    );
}

/// Submitting the same shipment_id twice for the same ratee should fail.
#[test]
fn test_cannot_rate_same_shipment_twice() {
    let (env, _, _, client) = setup();
    let rater = Address::generate(&env);
    let rated = Address::generate(&env);
    client.register_user(&rater, &UserType::Shipper);
    client.register_user(&rated, &UserType::Carrier);

    client.submit_rating(&rater, &1u64, &rated, &5u32);
    let result = client.try_submit_rating(&rater, &1u64, &rated, &4u32);
    assert_eq!(result, Err(Ok(ReputationError::AlreadyRatedShipment)));
}

#[test]
fn test_update_stats_carrier() {
    let (env, _, auth_contract, client) = setup();
    let carrier = Address::generate(&env);
    client.register_user(&carrier, &UserType::Carrier);

    client.update_stats(&auth_contract, &carrier, &true, &false); // on-time
    client.update_stats(&auth_contract, &carrier, &true, &false); // on-time
    client.update_stats(&auth_contract, &carrier, &false, &false); // late

    let rep = client.get_reputation(&carrier);
    assert_eq!(rep.total_completed, 3);
    assert_eq!(rep.on_time_count, 2);
    assert_eq!(rep.late_count, 1);
}

#[test]
fn test_update_stats_shipper() {
    let (env, _, auth_contract, client) = setup();
    let shipper = Address::generate(&env);
    client.register_user(&shipper, &UserType::Shipper);

    client.update_stats(&auth_contract, &shipper, &false, &true); // success
    client.update_stats(&auth_contract, &shipper, &false, &false); // cancelled

    let rep = client.get_reputation(&shipper);
    assert_eq!(rep.total_completed, 2);
    assert_eq!(rep.success_count, 1);
    assert_eq!(rep.cancel_count, 1);
}

#[test]
fn test_unauthorized_update_stats_fails() {
    let (env, _, _, client) = setup();
    let random = Address::generate(&env);
    let carrier = Address::generate(&env);
    client.register_user(&carrier, &UserType::Carrier);

    let result = client.try_update_stats(&random, &carrier, &true, &false);
    assert_eq!(result, Err(Ok(ReputationError::Unauthorized)));
}

/// Record known ratings and verify the composite score matches the formula.
#[test]
fn test_composite_score_formula() {
    let (env, _, auth_contract, client) = setup();
    let rater = Address::generate(&env);
    let carrier = Address::generate(&env);
    client.register_user(&rater, &UserType::Shipper);
    client.register_user(&carrier, &UserType::Carrier);

    // 5-star rating
    client.submit_rating(&rater, &1u64, &carrier, &5u32);
    // Perfect on-time record
    client.update_stats(&auth_contract, &carrier, &true, &false);

    let score = client.calculate_score(&carrier);
    // avg_rating = 500 (5 stars × 100), on_time_pct = 100%, rating/completed = 100%
    // rating_component = 500, rate_component = 300, completion_component = 200
    // total = 1000
    assert_eq!(score, 1000);
}

/// get_score (calculate_score) for a wallet that has never been rated
/// returns 0, the documented default.
#[test]
fn test_get_score_for_unrated_carrier() {
    let (env, _, _, client) = setup();
    let user = Address::generate(&env);
    client.register_user(&user, &UserType::Carrier);

    let score = client.calculate_score(&user);
    assert_eq!(score, 0); // no data yet
}

#[test]
fn test_has_rated_shipment() {
    let (env, _, _, client) = setup();
    let rater = Address::generate(&env);
    let rated = Address::generate(&env);
    client.register_user(&rater, &UserType::Shipper);
    client.register_user(&rated, &UserType::Carrier);

    assert!(!client.has_rated_shipment(&1u64, &rater));
    client.submit_rating(&rater, &1u64, &rated, &4u32);
    assert!(client.has_rated_shipment(&1u64, &rater));
}

#[test]
fn test_get_rating() {
    let (env, _, _, client) = setup();
    let rater = Address::generate(&env);
    let rated = Address::generate(&env);
    client.register_user(&rater, &UserType::Shipper);
    client.register_user(&rated, &UserType::Carrier);

    let rating_id = client.submit_rating(&rater, &5u64, &rated, &4u32);
    let record = client.get_rating(&rating_id);

    assert_eq!(record.shipment_id, 5);
    assert_eq!(record.rater, rater);
    assert_eq!(record.rated, rated);
    assert_eq!(record.score, 4);
}

#[test]
fn test_total_ratings_counter() {
    let (env, _, _, client) = setup();
    let rater1 = Address::generate(&env);
    let rater2 = Address::generate(&env);
    let rated = Address::generate(&env);
    client.register_user(&rater1, &UserType::Shipper);
    client.register_user(&rater2, &UserType::Shipper);
    client.register_user(&rated, &UserType::Carrier);

    assert_eq!(client.get_total_ratings(), 0);
    client.submit_rating(&rater1, &1u64, &rated, &5u32);
    client.submit_rating(&rater2, &2u64, &rated, &3u32);
    assert_eq!(client.get_total_ratings(), 2);
}
