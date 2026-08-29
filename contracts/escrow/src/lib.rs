#![no_std]

//! Escrow Contract
//!
//! Holds a shipper's payment in the contract for the duration of a shipment
//! and releases it to the carrier on completion, refunds it on cancellation,
//! or hands it to the admin to split on a dispute.
//!
//! ## Module layout
//!
//! Every contract crate in this workspace uses the same layout:
//!
//! - [`errors`]     — the `#[contracterror]` enum
//! - [`types`]      — `#[contracttype]` records and the storage [`DataKey`]
//! - [`events`]     — event topics and payloads (see `contracts/EVENTS.md`)
//! - `storage`      — shared storage accessors
//! - `contract`     — the `#[contract]` type and the whole `#[contractimpl]` ABI
//! - `funding`      — locking funds
//! - `settlement`   — release, refund and dispute resolution
//! - `test`         — `#[cfg(test)]` unit tests, one module per area

mod contract;
pub mod errors;
pub mod events;
mod funding;
mod settlement;
mod storage;
pub mod types;

#[cfg(test)]
mod test;

pub use contract::{EscrowContract, EscrowContractClient};
pub use errors::EscrowError;
pub use types::{DataKey, EscrowRecord, EscrowStatus};
