use soroban_sdk::{testutils::Address as _, Address};

use super::setup;
use crate::errors::ReputationError;
use crate::types::UserType;

#[test]
fn test_pause_blocks_registration_and_admin_rotation_works() {
    let ctx = setup();
    let new_admin = Address::generate(&ctx.env);
    let user = Address::generate(&ctx.env);

    ctx.client.rotate_admin(&ctx.admin, &new_admin);
    ctx.client.pause(&new_admin);

    let result = ctx.client.try_register_user(&user, &UserType::Carrier);
    assert_eq!(result, Err(Ok(ReputationError::Paused)));

    ctx.client.unpause(&new_admin);
    ctx.client.register_user(&user, &UserType::Carrier);
}

#[test]
fn test_rotate_admin_requires_current_admin() {
    let ctx = setup();
    let impostor = Address::generate(&ctx.env);
    let new_admin = Address::generate(&ctx.env);

    let result = ctx.client.try_rotate_admin(&impostor, &new_admin);
    assert_eq!(result, Err(Ok(ReputationError::Unauthorized)));
}
