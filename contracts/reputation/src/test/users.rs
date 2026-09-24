use soroban_sdk::{testutils::Address as _, Address};

use super::setup;
use crate::errors::ReputationError;
use crate::types::UserType;

#[test]
fn test_register_user() {
    let ctx = setup();
    let user = Address::generate(&ctx.env);

    ctx.client.register_user(&user, &UserType::Carrier);

    let rep = ctx.client.get_reputation(&user);
    assert_eq!(rep.user, user);
    assert_eq!(rep.user_type, UserType::Carrier);
    assert_eq!(rep.rating_count, 0);
    assert_eq!(rep.average_rating, 0);
}

#[test]
fn test_register_twice_fails() {
    let ctx = setup();
    let user = Address::generate(&ctx.env);

    ctx.client.register_user(&user, &UserType::Carrier);
    let result = ctx.client.try_register_user(&user, &UserType::Carrier);
    assert_eq!(result, Err(Ok(ReputationError::UserAlreadyRegistered)));
}

#[test]
fn test_unregistered_user_not_found() {
    let ctx = setup();
    let user = Address::generate(&ctx.env);

    let result = ctx.client.try_get_reputation(&user);
    assert_eq!(result, Err(Ok(ReputationError::UserNotFound)));
}

#[test]
fn test_update_user_type() {
    let ctx = setup();
    let user = Address::generate(&ctx.env);
    ctx.client.register_user(&user, &UserType::Shipper);

    ctx.client.update_user_type(&user, &UserType::Carrier);

    let rep = ctx.client.get_reputation(&user);
    assert_eq!(rep.user, user);
    assert_eq!(rep.user_type, UserType::Carrier);
}

#[test]
fn test_update_user_type_requires_prior_registration() {
    let ctx = setup();
    let stranger = Address::generate(&ctx.env);

    // `update_user_type` corrects an existing record; a fresh one must go
    // through `register_user`.
    let result = ctx.client.try_update_user_type(&stranger, &UserType::Carrier);
    assert_eq!(result, Err(Ok(ReputationError::UserNotFound)));
}

#[test]
fn test_update_user_type_preserves_counters() {
    let ctx = setup();
    // A user whose type was mis-registered as Shipper may already have
    // accumulated shipper-side counters; correcting the label must not wipe
    // that history.
    let user = Address::generate(&ctx.env);
    ctx.client.register_user(&user, &UserType::Shipper);
    ctx.client.update_stats(&ctx.auth_contract, &user, &false, &true); // success

    ctx.client.update_user_type(&user, &UserType::Carrier);

    let rep = ctx.client.get_reputation(&user);
    assert_eq!(rep.user_type, UserType::Carrier);
    assert_eq!(rep.total_completed, 1);
    assert_eq!(rep.success_count, 1);
    assert_eq!(rep.on_time_count, 0);
}
