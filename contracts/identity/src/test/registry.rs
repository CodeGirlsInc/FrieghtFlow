use soroban_sdk::{
    testutils::{Address as _, BytesN as _},
    Address, BytesN,
};

use super::setup;
use crate::errors::IdentityError;

#[test]
fn test_register_and_verify() {
    let ctx = setup();
    let wallet = Address::generate(&ctx.env);
    let hash = BytesN::random(&ctx.env);

    ctx.client.register_identity(&hash, &wallet);

    assert!(ctx.client.verify_identity(&wallet));
    assert_eq!(ctx.client.get_user_identity(&wallet), hash);
}

#[test]
fn test_double_register_fails() {
    let ctx = setup();
    let wallet = Address::generate(&ctx.env);
    let hash = BytesN::random(&ctx.env);

    ctx.client.register_identity(&hash, &wallet);

    let result = ctx.client.try_register_identity(&hash, &wallet);
    assert_eq!(result, Err(Ok(IdentityError::AlreadyRegistered)));
}

#[test]
fn test_update_identity() {
    let ctx = setup();
    let wallet = Address::generate(&ctx.env);
    let hash = BytesN::random(&ctx.env);
    let new_hash = BytesN::random(&ctx.env);

    ctx.client.register_identity(&hash, &wallet);
    ctx.client.update_identity(&wallet, &new_hash);

    assert!(ctx.client.verify_identity(&wallet));
    assert_eq!(ctx.client.get_user_identity(&wallet), new_hash);
}

#[test]
fn test_update_identity_requires_prior_registration() {
    let ctx = setup();
    let wallet = Address::generate(&ctx.env);
    let hash = BytesN::random(&ctx.env);

    // `wallet` was never registered — `register_identity` is the entrypoint
    // for a fresh registration, not `update_identity`.
    let result = ctx.client.try_update_identity(&wallet, &hash);
    assert_eq!(result, Err(Ok(IdentityError::NotRegistered)));
}

#[test]
fn test_revoke_identity() {
    let ctx = setup();
    let wallet = Address::generate(&ctx.env);
    let hash = BytesN::random(&ctx.env);

    ctx.client.register_identity(&hash, &wallet);
    assert!(ctx.client.verify_identity(&wallet));

    ctx.client.revoke_identity(&wallet);
    assert!(!ctx.client.verify_identity(&wallet));
}

#[test]
fn test_revoke_unregistered_fails() {
    let ctx = setup();
    let wallet = Address::generate(&ctx.env);

    let result = ctx.client.try_revoke_identity(&wallet);
    assert_eq!(result, Err(Ok(IdentityError::NotRegistered)));
}

#[test]
fn test_get_unregistered_fails() {
    let ctx = setup();
    let wallet = Address::generate(&ctx.env);

    let result = ctx.client.try_get_user_identity(&wallet);
    assert_eq!(result, Err(Ok(IdentityError::NotRegistered)));
}

#[test]
fn test_double_initialize_fails() {
    let ctx = setup();

    // `setup` already initialized the contract with `ctx.admin`.
    let result = ctx.client.try_initialize(&ctx.admin);
    assert_eq!(result, Err(Ok(IdentityError::AlreadyInitialized)));
}
