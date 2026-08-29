//! Event emission for the reputation contract.
//!
//! See `contracts/EVENTS.md` for the workspace-wide convention.
//!
//! Two payload shapes are used here, because two different things change:
//! `submitted` carries the new [`RatingRecord`], while `registered` and
//! `updated` carry the affected user's whole [`Reputation`] aggregate.
//! `submit_rating` emits both — the rating was recorded *and* the aggregate
//! moved — so an indexer can follow either stream on its own.

use soroban_sdk::{symbol_short, Env, Symbol};

use crate::types::{RatingRecord, Reputation};

/// Topic #1 — the contract that emitted the event.
/// "reputation" is 10 chars, past `symbol_short!`'s 9-char limit.
fn subject(env: &Env) -> Symbol {
    Symbol::new(env, "reputation")
}

/// `(reputation, registered, user)` → the freshly created profile.
pub fn registered(env: &Env, rep: &Reputation) {
    env.events().publish(
        (
            subject(env),
            Symbol::new(env, "registered"),
            rep.user.clone(),
        ),
        rep.clone(),
    );
}

/// `(reputation, submitted, rated)` → the new rating record.
pub fn submitted(env: &Env, rating: &RatingRecord) {
    env.events().publish(
        (
            subject(env),
            symbol_short!("submitted"),
            rating.rated.clone(),
        ),
        rating.clone(),
    );
}

/// `(reputation, updated, user)` → the recomputed profile.
pub fn updated(env: &Env, rep: &Reputation) {
    env.events().publish(
        (subject(env), symbol_short!("updated"), rep.user.clone()),
        rep.clone(),
    );
}
