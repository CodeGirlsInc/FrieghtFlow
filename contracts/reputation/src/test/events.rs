//! Every state-changing entrypoint must emit a corresponding event.
//!
//! The test `Env` only keeps the events of the most recent top-level
//! invocation, so each assertion sits directly after the call it covers.

use soroban_sdk::{testutils::Address as _, Address, TryFromVal};

use super::{emitted, emitted_key, no_events, setup, Ctx};
use crate::types::{RatingRecord, Reputation, UserType};

fn only_reputation(ctx: &Ctx, action: &str) -> Reputation {
    let payloads = emitted(&ctx.env, &ctx.client.address, action);
    assert_eq!(payloads.len(), 1, "expected exactly one `{}` event", action);
    Reputation::try_from_val(&ctx.env, &payloads.get_unchecked(0)).unwrap()
}

#[test]
fn test_register_emits_registered() {
    let ctx = setup();
    let user = Address::generate(&ctx.env);

    ctx.client.register_user(&user, &UserType::Carrier);

    let payload = only_reputation(&ctx, "registered");
    assert_eq!(payload.user, user);
    assert_eq!(payload.user_type, UserType::Carrier);

    let key: Address = emitted_key(&ctx.env, &ctx.client.address, "registered");
    assert_eq!(key, user);

    // Querying the contract clears the event buffer, so do it last.
    assert_eq!(payload, ctx.client.get_reputation(&user));
}

#[test]
fn test_submit_rating_emits_submitted_and_updated() {
    let ctx = setup();
    let rater = Address::generate(&ctx.env);
    let carrier = Address::generate(&ctx.env);
    ctx.client.register_user(&rater, &UserType::Shipper);
    ctx.client.register_user(&carrier, &UserType::Carrier);

    let rating_id = ctx.client.submit_rating(&rater, &7u64, &carrier, &5u32);

    let submitted = emitted(&ctx.env, &ctx.client.address, "submitted");
    assert_eq!(submitted.len(), 1);
    let record = RatingRecord::try_from_val(&ctx.env, &submitted.get_unchecked(0)).unwrap();
    assert_eq!(record.id, rating_id);
    assert_eq!(record.shipment_id, 7);
    assert_eq!(record.rater, rater);
    assert_eq!(record.rated, carrier);
    assert_eq!(record.score, 5);

    // The rating also moves the rated user's aggregate.
    let updated = only_reputation(&ctx, "updated");
    assert_eq!(updated.rating_count, 1);
    assert_eq!(updated.average_rating, 500);

    let key: Address = emitted_key(&ctx.env, &ctx.client.address, "submitted");
    assert_eq!(key, carrier);

    // Querying the contract clears the event buffer, so do it last.
    assert_eq!(updated, ctx.client.get_reputation(&carrier));
}

#[test]
fn test_update_stats_emits_updated() {
    let ctx = setup();
    let carrier = Address::generate(&ctx.env);
    ctx.client.register_user(&carrier, &UserType::Carrier);

    ctx.client
        .update_stats(&ctx.auth_contract, &carrier, &true, &false);

    let payload = only_reputation(&ctx, "updated");
    assert_eq!(payload.total_completed, 1);
    assert_eq!(payload.on_time_count, 1);

    let key: Address = emitted_key(&ctx.env, &ctx.client.address, "updated");
    assert_eq!(key, carrier);

    // Querying the contract clears the event buffer, so do it last.
    assert_eq!(payload, ctx.client.get_reputation(&carrier));
}

#[test]
fn test_rejected_call_emits_nothing() {
    let ctx = setup();
    let random = Address::generate(&ctx.env);
    let carrier = Address::generate(&ctx.env);
    ctx.client.register_user(&carrier, &UserType::Carrier);

    let _ = ctx
        .client
        .try_update_stats(&random, &carrier, &true, &false);
    assert!(no_events(&ctx.env));
}
