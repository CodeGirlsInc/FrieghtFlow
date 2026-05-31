//! Comprehensive unit tests for the Reputation contract (CT-10).
//!
//! Score formula (0-1000):
//!   rating_component    = avg_rating (stored as score×100, max 500)
//!   rate_component      = on_time_pct × 3  (carriers) or success_pct × 3 (shippers) → 0-300
//!   completion_component = (rating_count / total_completed) × 100 × 2 → 0-200

#[cfg(test)]
mod reputation_tests {
    use reputation::{ReputationContract, ReputationContractClient, ReputationError, UserType};
    use soroban_sdk::{testutils::Address as _, Address, Env};

    fn setup() -> (Env, Address, Address, ReputationContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let auth_contract = Address::generate(&env);
        let contract_id = env.register(ReputationContract {}, ());
        let client = ReputationContractClient::new(&env, &contract_id);
        client.initialize(&admin, &auth_contract);
        (env, admin, auth_contract, client)
    }

    // ── add_rating (submit_rating) ────────────────────────────────────────

    #[test]
    fn test_add_rating_valid_score_1() {
        let (env, _, _, client) = setup();
        let rater = Address::generate(&env);
        let rated = Address::generate(&env);
        client.register_user(&rater, &UserType::Shipper);
        client.register_user(&rated, &UserType::Carrier);

        // Score 1 is valid
        let rating_id = client.submit_rating(&rater, &1u64, &rated, &1u32);
        let record = client.get_rating(&rating_id);
        assert_eq!(record.score, 1);
    }

    #[test]
    fn test_add_rating_valid_score_5() {
        let (env, _, _, client) = setup();
        let rater = Address::generate(&env);
        let rated = Address::generate(&env);
        client.register_user(&rater, &UserType::Shipper);
        client.register_user(&rated, &UserType::Carrier);

        // Score 5 is valid
        let rating_id = client.submit_rating(&rater, &1u64, &rated, &5u32);
        let record = client.get_rating(&rating_id);
        assert_eq!(record.score, 5);
    }

    #[test]
    fn test_add_rating_score_0_returns_invalid_score() {
        let (env, _, _, client) = setup();
        let rater = Address::generate(&env);
        let rated = Address::generate(&env);
        client.register_user(&rater, &UserType::Shipper);
        client.register_user(&rated, &UserType::Carrier);

        let result = client.try_submit_rating(&rater, &1u64, &rated, &0u32);
        assert_eq!(result, Err(Ok(ReputationError::InvalidScore)));
    }

    #[test]
    fn test_add_rating_score_6_returns_invalid_score() {
        let (env, _, _, client) = setup();
        let rater = Address::generate(&env);
        let rated = Address::generate(&env);
        client.register_user(&rater, &UserType::Shipper);
        client.register_user(&rated, &UserType::Carrier);

        let result = client.try_submit_rating(&rater, &1u64, &rated, &6u32);
        assert_eq!(result, Err(Ok(ReputationError::InvalidScore)));
    }

    // ── Composite score calculation ───────────────────────────────────────

    /// Known inputs: avgRating=4 (stored as 400), onTimePct=90%, completionRate=100%
    ///
    /// rating_component    = 400
    /// rate_component      = (9/10 * 100) * 3 = 90 * 3 = 270
    /// completion_component = (1/1 * 100) * 2 = 200
    /// total = 400 + 270 + 200 = 870
    #[test]
    fn test_composite_score_known_inputs_carrier() {
        let (env, _, auth_contract, client) = setup();
        let rater = Address::generate(&env);
        let carrier = Address::generate(&env);
        client.register_user(&rater, &UserType::Shipper);
        client.register_user(&carrier, &UserType::Carrier);

        // avgRating = 4 → stored as 400
        client.submit_rating(&rater, &1u64, &carrier, &4u32);

        // 9 on-time, 1 late → on_time_pct = 90%
        for i in 2u64..=10 {
            client.update_stats(&auth_contract, &carrier, &true, &false);
            let _ = i;
        }
        client.update_stats(&auth_contract, &carrier, &false, &false); // 1 late

        let score = client.calculate_score(&carrier);
        // rating=400, rate=270, completion=(1/10)*100*2=20
        // total = 400 + 270 + 20 = 690
        assert_eq!(score, 690);
    }

    /// Perfect carrier: avgRating=5, 100% on-time, 100% completion
    ///
    /// rating_component    = 500
    /// rate_component      = 100 * 3 = 300
    /// completion_component = 100 * 2 = 200
    /// total = 1000
    #[test]
    fn test_composite_score_perfect_carrier() {
        let (env, _, auth_contract, client) = setup();
        let rater = Address::generate(&env);
        let carrier = Address::generate(&env);
        client.register_user(&rater, &UserType::Shipper);
        client.register_user(&carrier, &UserType::Carrier);

        client.submit_rating(&rater, &1u64, &carrier, &5u32);
        client.update_stats(&auth_contract, &carrier, &true, &false);

        let score = client.calculate_score(&carrier);
        assert_eq!(score, 1000);
    }

    /// New user with no data → score = 0
    #[test]
    fn test_composite_score_new_user_is_zero() {
        let (env, _, _, client) = setup();
        let user = Address::generate(&env);
        client.register_user(&user, &UserType::Carrier);

        let score = client.calculate_score(&user);
        assert_eq!(score, 0);
    }

    // ── Duplicate rating ──────────────────────────────────────────────────

    #[test]
    fn test_duplicate_rating_same_shipment_returns_error() {
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
    fn test_different_raters_same_shipment_allowed() {
        let (env, _, _, client) = setup();
        let rater1 = Address::generate(&env);
        let rater2 = Address::generate(&env);
        let rated = Address::generate(&env);
        client.register_user(&rater1, &UserType::Shipper);
        client.register_user(&rater2, &UserType::Shipper);
        client.register_user(&rated, &UserType::Carrier);

        client.submit_rating(&rater1, &1u64, &rated, &5u32);
        client.submit_rating(&rater2, &1u64, &rated, &3u32);

        let rep = client.get_reputation(&rated);
        assert_eq!(rep.rating_count, 2);
        // (500 + 300) / 2 = 400
        assert_eq!(rep.average_rating, 400);
    }

    // ── get_reputation ────────────────────────────────────────────────────

    #[test]
    fn test_get_reputation_returns_correct_breakdown() {
        let (env, _, auth_contract, client) = setup();
        let rater = Address::generate(&env);
        let carrier = Address::generate(&env);
        client.register_user(&rater, &UserType::Shipper);
        client.register_user(&carrier, &UserType::Carrier);

        client.submit_rating(&rater, &1u64, &carrier, &4u32);
        client.update_stats(&auth_contract, &carrier, &true, &false);
        client.update_stats(&auth_contract, &carrier, &false, &false);

        let rep = client.get_reputation(&carrier);
        assert_eq!(rep.rating_count, 1);
        assert_eq!(rep.average_rating, 400); // 4 stars × 100
        assert_eq!(rep.total_completed, 2);
        assert_eq!(rep.on_time_count, 1);
        assert_eq!(rep.late_count, 1);
    }

    #[test]
    fn test_get_reputation_shipper_breakdown() {
        let (env, _, auth_contract, client) = setup();
        let rater = Address::generate(&env);
        let shipper = Address::generate(&env);
        client.register_user(&rater, &UserType::Carrier);
        client.register_user(&shipper, &UserType::Shipper);

        client.submit_rating(&rater, &1u64, &shipper, &3u32);
        client.update_stats(&auth_contract, &shipper, &false, &true);  // success
        client.update_stats(&auth_contract, &shipper, &false, &false); // cancel

        let rep = client.get_reputation(&shipper);
        assert_eq!(rep.rating_count, 1);
        assert_eq!(rep.average_rating, 300); // 3 stars × 100
        assert_eq!(rep.total_completed, 2);
        assert_eq!(rep.success_count, 1);
        assert_eq!(rep.cancel_count, 1);
    }

    // ── update_stats ──────────────────────────────────────────────────────

    #[test]
    fn test_update_stats_on_time_percentage_updates_correctly() {
        let (env, _, auth_contract, client) = setup();
        let carrier = Address::generate(&env);
        client.register_user(&carrier, &UserType::Carrier);

        // 3 on-time, 1 late → 75% on-time
        client.update_stats(&auth_contract, &carrier, &true, &false);
        client.update_stats(&auth_contract, &carrier, &true, &false);
        client.update_stats(&auth_contract, &carrier, &true, &false);
        client.update_stats(&auth_contract, &carrier, &false, &false);

        let rep = client.get_reputation(&carrier);
        assert_eq!(rep.total_completed, 4);
        assert_eq!(rep.on_time_count, 3);
        assert_eq!(rep.late_count, 1);

        // Verify score: no ratings yet → rating=0, rate=(3/4*100)*3=225, completion=0
        let score = client.calculate_score(&carrier);
        assert_eq!(score, 225);
    }

    #[test]
    fn test_update_stats_unauthorized_caller_fails() {
        let (env, _, _, client) = setup();
        let random = Address::generate(&env);
        let carrier = Address::generate(&env);
        client.register_user(&carrier, &UserType::Carrier);

        let result = client.try_update_stats(&random, &carrier, &true, &false);
        assert_eq!(result, Err(Ok(ReputationError::Unauthorized)));
    }

    #[test]
    fn test_update_stats_admin_is_authorized() {
        let (env, admin, _, client) = setup();
        let carrier = Address::generate(&env);
        client.register_user(&carrier, &UserType::Carrier);

        // Admin should also be able to call update_stats
        client.update_stats(&admin, &carrier, &true, &false);
        let rep = client.get_reputation(&carrier);
        assert_eq!(rep.total_completed, 1);
        assert_eq!(rep.on_time_count, 1);
    }
}
