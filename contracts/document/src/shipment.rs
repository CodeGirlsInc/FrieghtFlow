//! The slice of the shipment contract's interface this contract depends on.
//!
//! `register_document` has to prove a `shipment_id` names a real shipment
//! before it will anchor a document to it. That means calling the shipment
//! contract, which needs a client for it.
//!
//! The client is declared here with `#[contractclient]` rather than by
//! depending on the `shipment` crate: linking that crate into this cdylib
//! would re-export the shipment contract's own entrypoints from
//! `document.wasm`. The record itself comes from the `common` crate, where
//! both contracts read the single definition — so the value decoded here
//! cannot drift from the one the shipment contract writes.

use soroban_sdk::{contractclient, Env};

pub use common::shipment::{Shipment, ShipmentStatus};

#[contractclient(name = "ShipmentClient")]
pub trait ShipmentInterface {
    /// Mirrors `ShipmentContract::get_shipment`, which errors when the id is
    /// unknown. Declared infallible here so the generated `try_get_shipment`
    /// surfaces that error as `Err(..)` instead of trapping this contract.
    fn get_shipment(env: Env, shipment_id: u64) -> Shipment;
}
