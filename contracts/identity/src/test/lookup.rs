//! CONTRACT-60: reverse lookup from `user_id_hash` to the wallet(s)
//! registered against it. The `DataKey::HashToWallets` index is maintained
//! alongside all three mutation paths — `register_identity`,
//! `update_identity`, and `revoke_identity` — so it must stay consistent
//! across each of them.
//!
//! CONTRACT-82 (issue #1454): `get_wallets_by_identity` now takes
//! `offset`/`limit` for bounded reads, matching the pagination convention
//! used by every other Vec-returning getter in this workspace.

use soroban_sdk::{
    testutils::{Address as _, BytesN as _},
    Address, BytesN,
};

use super::setup;

#[test]
fn test_lookup_single_wallet() {
    let ctx = setup();
    let wallet = Address::generate(&ctx.env);
    let hash = BytesN::random(&ctx.env);

    ctx.client.register_identity(&hash, &wallet);

    let wallets = ctx.client.get_wallets_by_identity(&hash, &0u32, &10u32);
    assert_eq!(wallets.len(), 1);
    assert_eq!(wallets.get(0).unwrap(), wallet);
}

#[test]
fn test_lookup_unknown_hash_is_empty() {
    let ctx = setup();
    let hash = BytesN::random(&ctx.env);

    assert!(ctx
        .client
        .get_wallets_by_identity(&hash, &0u32, &10u32)
        .is_empty());
}

#[test]
fn test_lookup_multiple_wallets_same_hash() {
    let ctx = setup();
    let wallet_a = Address::generate(&ctx.env);
    let wallet_b = Address::generate(&ctx.env);
    // Two wallets legitimately sharing one off-chain identity (e.g. the same
    // KYC'd user registering a second wallet).
    let hash = BytesN::random(&ctx.env);

    ctx.client.register_identity(&hash, &wallet_a);
    ctx.client.register_identity(&hash, &wallet_b);

    let wallets = ctx.client.get_wallets_by_identity(&hash, &0u32, &10u32);
    assert_eq!(wallets.len(), 2);
    assert_eq!(wallets.get(0).unwrap(), wallet_a);
    assert_eq!(wallets.get(1).unwrap(), wallet_b);
}

#[test]
fn test_lookup_index_updated_on_revoke() {
    let ctx = setup();
    let wallet_a = Address::generate(&ctx.env);
    let wallet_b = Address::generate(&ctx.env);
    let hash = BytesN::random(&ctx.env);

    ctx.client.register_identity(&hash, &wallet_a);
    ctx.client.register_identity(&hash, &wallet_b);

    ctx.client.revoke_identity(&wallet_a);

    let wallets = ctx.client.get_wallets_by_identity(&hash, &0u32, &10u32);
    assert_eq!(wallets.len(), 1);
    assert_eq!(wallets.get(0).unwrap(), wallet_b);
}

#[test]
fn test_lookup_index_empty_after_last_revoke() {
    let ctx = setup();
    let wallet = Address::generate(&ctx.env);
    let hash = BytesN::random(&ctx.env);

    ctx.client.register_identity(&hash, &wallet);
    ctx.client.revoke_identity(&wallet);

    assert!(ctx
        .client
        .get_wallets_by_identity(&hash, &0u32, &10u32)
        .is_empty());
}

#[test]
fn test_lookup_index_updated_on_update_identity() {
    let ctx = setup();
    let wallet = Address::generate(&ctx.env);
    let old_hash = BytesN::random(&ctx.env);
    let new_hash = BytesN::random(&ctx.env);

    ctx.client.register_identity(&old_hash, &wallet);
    ctx.client.update_identity(&wallet, &new_hash);

    // Moved off the old hash's index...
    assert!(ctx
        .client
        .get_wallets_by_identity(&old_hash, &0u32, &10u32)
        .is_empty());

    // ...and onto the new hash's index.
    let wallets = ctx.client.get_wallets_by_identity(&new_hash, &0u32, &10u32);
    assert_eq!(wallets.len(), 1);
    assert_eq!(wallets.get(0).unwrap(), wallet);
}

#[test]
fn test_lookup_update_does_not_disturb_other_wallets_on_old_hash() {
    let ctx = setup();
    let wallet_a = Address::generate(&ctx.env);
    let wallet_b = Address::generate(&ctx.env);
    let shared_hash = BytesN::random(&ctx.env);
    let new_hash = BytesN::random(&ctx.env);

    ctx.client.register_identity(&shared_hash, &wallet_a);
    ctx.client.register_identity(&shared_hash, &wallet_b);

    // `wallet_a` moves to a new hash; `wallet_b` stays registered under the
    // shared one and must remain in its index.
    ctx.client.update_identity(&wallet_a, &new_hash);

    let remaining = ctx.client.get_wallets_by_identity(&shared_hash, &0u32, &10u32);
    assert_eq!(remaining.len(), 1);
    assert_eq!(remaining.get(0).unwrap(), wallet_b);

    let moved = ctx.client.get_wallets_by_identity(&new_hash, &0u32, &10u32);
    assert_eq!(moved.len(), 1);
    assert_eq!(moved.get(0).unwrap(), wallet_a);
}

// --- Issue #1454: pagination ---

/// offset/limit correctly pages through the wallet list.
#[test]
fn test_paginate_wallets_by_identity() {
    let ctx = setup();
    let hash = BytesN::random(&ctx.env);

    let wallet_a = Address::generate(&ctx.env);
    let wallet_b = Address::generate(&ctx.env);
    let wallet_c = Address::generate(&ctx.env);

    ctx.client.register_identity(&hash, &wallet_a);
    ctx.client.register_identity(&hash, &wallet_b);
    ctx.client.register_identity(&hash, &wallet_c);

    // First page: 2 items starting at 0.
    let page1 = ctx.client.get_wallets_by_identity(&hash, &0u32, &2u32);
    assert_eq!(page1.len(), 2);
    assert_eq!(page1.get(0).unwrap(), wallet_a);
    assert_eq!(page1.get(1).unwrap(), wallet_b);

    // Second page: 1 item starting at 2.
    let page2 = ctx.client.get_wallets_by_identity(&hash, &2u32, &2u32);
    assert_eq!(page2.len(), 1);
    assert_eq!(page2.get(0).unwrap(), wallet_c);

    // offset past end returns empty.
    let empty = ctx.client.get_wallets_by_identity(&hash, &10u32, &5u32);
    assert!(empty.is_empty());
}

/// limit=0 returns an empty page without panicking.
#[test]
fn test_paginate_wallets_limit_zero() {
    let ctx = setup();
    let hash = BytesN::random(&ctx.env);
    let wallet = Address::generate(&ctx.env);
    ctx.client.register_identity(&hash, &wallet);

    let result = ctx.client.get_wallets_by_identity(&hash, &0u32, &0u32);
    assert!(result.is_empty());
}
