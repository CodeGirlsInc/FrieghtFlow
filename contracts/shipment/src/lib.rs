#![no_std]

//! Shipment Contract
//!
//! Owns the freight shipment lifecycle: a shipper posts a load, a carrier
//! accepts it, moves it, and delivers it, and the shipper confirms — which is
//! the signal the escrow contract settles on.
//!
//! ## Module layout
//!
//! Every contract crate in this workspace uses the same layout:
//!
//! - [`errors`]   — the `#[contracterror]` enum
//! - [`types`]    — `#[contracttype]` records and the storage [`DataKey`]
//! - [`events`]   — event topics and payloads (see `contracts/EVENTS.md`)
//! - `storage`    — shared storage accessors
//! - `contract`   — the `#[contract]` type and the whole `#[contractimpl]` ABI
//! - `test`       — `#[cfg(test)]` unit tests, one module per area
//!
//! Each entrypoint in `contract` is a thin delegation to the module that owns
//! the logic, grouped by who may call it: `shipper`, `carrier` and `dispute`.

mod carrier;
mod contract;
mod dispute;
pub mod errors;
pub mod events;
mod shipper;
mod storage;
pub mod types;

#[cfg(test)]
mod test;

pub use contract::{ShipmentContract, ShipmentContractClient};
pub use errors::ShipmentError;
pub use types::{DataKey, Shipment, ShipmentStatus};
