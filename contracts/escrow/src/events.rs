//! Event emission for the escrow contract.
//!
//! See `contracts/EVENTS.md` for the workspace-wide convention. Every event
//! here is `(escrow, <action>, <shipment id>)` with the full post-transition
//! [`EscrowRecord`] as its payload.

use soroban_sdk::{symbol_short, Env, Symbol};

use crate::types::EscrowRecord;

/// Topic #1 — the contract that emitted the event.
const SUBJECT: Symbol = symbol_short!("escrow");

fn publish(env: &Env, action: Symbol, record: &EscrowRecord) {
    env.events()
        .publish((SUBJECT, action, record.shipment_id), record.clone());
}

pub fn funded(env: &Env, record: &EscrowRecord) {
    publish(env, symbol_short!("funded"), record);
}

pub fn released(env: &Env, record: &EscrowRecord) {
    publish(env, symbol_short!("released"), record);
}

pub fn refunded(env: &Env, record: &EscrowRecord) {
    publish(env, symbol_short!("refunded"), record);
}

pub fn disputed(env: &Env, record: &EscrowRecord) {
    publish(env, symbol_short!("disputed"), record);
}

pub fn resolved(env: &Env, record: &EscrowRecord) {
    publish(env, symbol_short!("resolved"), record);
}
