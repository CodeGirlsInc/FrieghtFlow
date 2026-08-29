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
