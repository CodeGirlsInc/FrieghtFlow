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

// --- Issue #1456: revoke then re-register lifecycle ---

/// After `revoke_identity` removes `DataKey::Identity(wallet)`, a subsequent
/// `register_identity` for the same wallet must succeed — the `AlreadyRegistered`
/// guard is based on the presence of that key, so the revocation must clear it
/// completely. This is the one identity lifecycle transition (revoke then
/// re-register) the test suite previously did not walk.
#[test]
fn test_revoke_then_reregister_succeeds() {
    let ctx = setup();
    let wallet = Address::generate(&ctx.env);
    let hash = BytesN::random(&ctx.env);
    let new_hash = BytesN::random(&ctx.env);

    // Initial registration.
    ctx.client.register_identity(&hash, &wallet);
    assert!(ctx.client.verify_identity(&wallet));

    // Admin revokes.
    ctx.client.revoke_identity(&wallet);
    assert!(!ctx.client.verify_identity(&wallet));

    // Fresh re-registration with a new hash must succeed, not return AlreadyRegistered.
    ctx.client.register_identity(&new_hash, &wallet);
    assert!(ctx.client.verify_identity(&wallet));
    assert_eq!(ctx.client.get_user_identity(&wallet), new_hash);
}

/// After revoke then re-register, the reverse index (HashToWallets) must reflect
/// only the new hash — the wallet should not appear under the old hash and must
/// appear under the new one.
#[test]
fn test_revoke_then_reregister_updates_hash_index() {
    let ctx = setup();
    let wallet = Address::generate(&ctx.env);
    let old_hash = BytesN::random(&ctx.env);
    let new_hash = BytesN::random(&ctx.env);

    ctx.client.register_identity(&old_hash, &wallet);
    ctx.client.revoke_identity(&wallet);
    ctx.client.register_identity(&new_hash, &wallet);

    // Wallet must not be in the old hash's index after revoke + re-register.
    assert!(ctx
        .client
        .get_wallets_by_identity(&old_hash, &0u32, &10u32)
        .is_empty());

    // Wallet must be in the new hash's index.
    let wallets = ctx.client.get_wallets_by_identity(&new_hash, &0u32, &10u32);
    assert_eq!(wallets.len(), 1);
    assert_eq!(wallets.get(0).unwrap(), wallet);
}

/// Re-registering with the *same* hash after a revoke must also succeed.
#[test]
fn test_revoke_then_reregister_same_hash_succeeds() {
    let ctx = setup();
    let wallet = Address::generate(&ctx.env);
    let hash = BytesN::random(&ctx.env);

    ctx.client.register_identity(&hash, &wallet);
    ctx.client.revoke_identity(&wallet);
    // Same hash — this is a valid "restore" scenario.
    ctx.client.register_identity(&hash, &wallet);
    assert!(ctx.client.verify_identity(&wallet));
}
