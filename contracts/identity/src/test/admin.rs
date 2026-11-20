use soroban_sdk::{
    testutils::{Address as _, BytesN as _},
    Address, BytesN,
};

use super::setup;
use crate::errors::IdentityError;

#[test]
fn test_admin_rotation_and_pause_gate() {
    let ctx = setup();
    let new_admin = Address::generate(&ctx.env);
    let wallet = Address::generate(&ctx.env);
    let hash = BytesN::random(&ctx.env);

    ctx.client.rotate_admin(&ctx.admin, &new_admin);
    ctx.client.pause(&new_admin);

    let result = ctx.client.try_register_identity(&hash, &wallet);
    assert_eq!(result, Err(Ok(IdentityError::Paused)));

    ctx.client.unpause(&new_admin);
    ctx.client.register_identity(&hash, &wallet);
    assert!(ctx.client.verify_identity(&wallet));
}

#[test]
fn test_rotate_admin_requires_current_admin() {
    let ctx = setup();
    let impostor = Address::generate(&ctx.env);
    let new_admin = Address::generate(&ctx.env);

    let result = ctx.client.try_rotate_admin(&impostor, &new_admin);
    assert_eq!(result, Err(Ok(IdentityError::Unauthorized)));
}
