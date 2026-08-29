//! The slice of the shipment contract's interface this contract depends on.
//!
//! `register_document` has to prove a `shipment_id` names a real shipment
//! before it will anchor a document to it. That means calling the shipment
//! contract, which needs a client for it.
//!
//! The client is declared here with `#[contractclient]` rather than by
//! depending on the `shipment` crate: linking that crate into this cdylib
//! would re-export the shipment contract's own entrypoints from
//! `document.wasm`. The cost is that [`Shipment`] and [`ShipmentStatus`]
//! mirror the definitions in `contracts/shipment/src/types.rs` — they must
//! stay field-for-field identical, because a `#[contracttype]` struct is
//! decoded as a map keyed by field name and a mismatch fails the decode.
//! `test::shipment_link` guards that by round-tripping a shipment created by
//! the real contract.

use soroban_sdk::{contractclient, contracttype, Address, Env, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ShipmentStatus {
    Created,
    Accepted,
    InTransit,
    Delivered,
    Completed,
    Disputed,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Shipment {
    pub id: u64,
    pub shipper: Address,
    pub carrier: Option<Address>,
    pub origin: String,
    pub destination: String,
    pub cargo_description: String,
    pub weight_kg: u32,
    pub price: i128,
    pub status: ShipmentStatus,
    pub created_at: u64,
    pub updated_at: u64,
}

impl Shipment {
    /// True if `addr` is the shipper or the assigned carrier.
    pub fn is_party(&self, addr: &Address) -> bool {
        self.shipper == *addr || self.carrier.as_ref() == Some(addr)
    }
}

#[contractclient(name = "ShipmentClient")]
pub trait ShipmentInterface {
    /// Mirrors `ShipmentContract::get_shipment`, which errors when the id is
    /// unknown. Declared infallible here so the generated `try_get_shipment`
    /// surfaces that error as `Err(..)` instead of trapping this contract.
    fn get_shipment(env: Env, shipment_id: u64) -> Shipment;
}
