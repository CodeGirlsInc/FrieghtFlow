//! Event emission for the shipment contract.
//!
//! See `contracts/EVENTS.md` for the workspace-wide convention. Every event
//! here is `(shipment, <action>, <shipment id>)` with the full post-transition
//! [`Shipment`] record as its payload, so an indexer never has to read
//! contract storage to learn the new state.

use soroban_sdk::{symbol_short, Env, Symbol};

use crate::types::Shipment;

/// Topic #1 — the contract that emitted the event.
const SUBJECT: Symbol = symbol_short!("shipment");

fn publish(env: &Env, action: Symbol, shipment: &Shipment) {
    env.events()
        .publish((SUBJECT, action, shipment.id), shipment.clone());
}

pub fn created(env: &Env, shipment: &Shipment) {
    publish(env, symbol_short!("created"), shipment);
}

pub fn accepted(env: &Env, shipment: &Shipment) {
    publish(env, symbol_short!("accepted"), shipment);
}

pub fn in_transit(env: &Env, shipment: &Shipment) {
    publish(env, symbol_short!("intransit"), shipment);
}

pub fn delivered(env: &Env, shipment: &Shipment) {
    publish(env, symbol_short!("delivered"), shipment);
}

pub fn completed(env: &Env, shipment: &Shipment) {
    publish(env, symbol_short!("completed"), shipment);
}

pub fn disputed(env: &Env, shipment: &Shipment) {
    publish(env, symbol_short!("disputed"), shipment);
}

pub fn resolved(env: &Env, shipment: &Shipment) {
    publish(env, symbol_short!("resolved"), shipment);
}

pub fn cancelled(env: &Env, shipment: &Shipment) {
    publish(env, symbol_short!("cancelled"), shipment);
}
