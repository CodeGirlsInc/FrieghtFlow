//! Event emission for the identity contract.
//!
//! See the workspace convention in `contracts/EVENTS.md`: every event carries
//! three topics — `(subject, action, key)` — and a payload that is the
//! post-transition snapshot of the entity the event is about.

use soroban_sdk::{symbol_short, Address, BytesN, Env, Symbol};

/// Topic #1 — the contract that emitted the event.
const SUBJECT: Symbol = symbol_short!("identity");

/// `(identity, registered, wallet)` → the bound user id hash.
pub fn registered(env: &Env, wallet: &Address, user_id_hash: &BytesN<32>) {
    // "registered" is 10 chars, past `symbol_short!`'s 9-char limit.
    env.events().publish(
        (SUBJECT, Symbol::new(env, "registered"), wallet.clone()),
        user_id_hash.clone(),
    );
}

/// `(identity, revoked, wallet)` → the user id hash that was unbound.
pub fn revoked(env: &Env, wallet: &Address, user_id_hash: &BytesN<32>) {
    env.events().publish(
        (SUBJECT, symbol_short!("revoked"), wallet.clone()),
        user_id_hash.clone(),
    );
}
