//! Event emission for the document contract.
//!
//! See `contracts/EVENTS.md` for the workspace-wide convention. Every event
//! here is `(document, <action>, <document id>)` with the full post-transition
//! [`DocumentRecord`] as its payload.

use soroban_sdk::{symbol_short, Env, Symbol};

use crate::types::DocumentRecord;

/// Topic #1 — the contract that emitted the event.
const SUBJECT: Symbol = symbol_short!("document");

/// `(document, registered, doc id)` → the stored record.
pub fn registered(env: &Env, doc: &DocumentRecord) {
    // "registered" is 10 chars, past `symbol_short!`'s 9-char limit.
    env.events().publish(
        (SUBJECT, Symbol::new(env, "registered"), doc.id),
        doc.clone(),
    );
}

/// `(document, verified, doc id)` → the record with its verification stamped.
pub fn verified(env: &Env, doc: &DocumentRecord) {
    env.events()
        .publish((SUBJECT, symbol_short!("verified"), doc.id), doc.clone());
}

/// `(document, flagged, doc id)` → the record with its verification reversed.
pub fn flagged(env: &Env, doc: &DocumentRecord) {
    env.events()
        .publish((SUBJECT, symbol_short!("flagged"), doc.id), doc.clone());
}
