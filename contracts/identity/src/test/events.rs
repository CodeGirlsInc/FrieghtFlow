use soroban_sdk::{
    testutils::{Address as _, BytesN as _},
    Address, BytesN, TryFromVal,
};

use super::{emitted, emitted_key, no_events, setup};

#[test]
fn test_register_emits_registered() {
    let ctx = setup();
    let wallet = Address::generate(&ctx.env);
    let hash = BytesN::random(&ctx.env);

    ctx.client.register_identity(&hash, &wallet);

    let payloads = emitted(&ctx.env, &ctx.client.address, "registered");
    assert_eq!(payloads.len(), 1);

    let payload = BytesN::<32>::try_from_val(&ctx.env, &payloads.get_unchecked(0)).unwrap();
    assert_eq!(payload, hash);

    let key: Address = emitted_key(&ctx.env, &ctx.client.address, "registered");
    assert_eq!(key, wallet);
}

#[test]
fn test_revoke_emits_revoked() {
    let ctx = setup();
    let wallet = Address::generate(&ctx.env);
    let hash = BytesN::random(&ctx.env);

    ctx.client.register_identity(&hash, &wallet);
    ctx.client.revoke_identity(&wallet);

    let payloads = emitted(&ctx.env, &ctx.client.address, "revoked");
    assert_eq!(payloads.len(), 1);

    let payload = BytesN::<32>::try_from_val(&ctx.env, &payloads.get_unchecked(0)).unwrap();
    assert_eq!(payload, hash);

    let key: Address = emitted_key(&ctx.env, &ctx.client.address, "revoked");
    assert_eq!(key, wallet);
}

#[test]
fn test_failed_register_emits_nothing() {
    let ctx = setup();
    let wallet = Address::generate(&ctx.env);
    let hash = BytesN::random(&ctx.env);

    ctx.client.register_identity(&hash, &wallet);
    assert_eq!(
        emitted(&ctx.env, &ctx.client.address, "registered").len(),
        1
    );

    // The rejected second registration must not produce an event of its own.
    let _ = ctx.client.try_register_identity(&hash, &wallet);
    assert!(no_events(&ctx.env));
}
