#![no_std]

//! Identity Registry Contract
//!
//! Binds a Stellar wallet address to the hash of an off-chain user identity
//! record, so other FreightFlow contracts and indexers can check that a
//! counterparty has been KYC'd without putting personal data on-chain.
//!
//! ## Module layout
//!
//! Every contract crate in this workspace uses the same layout:
//!
//! - [`errors`]   — the `#[contracterror]` enum
//! - [`types`]    — `#[contracttype]` records and the storage [`DataKey`]
//! - [`events`]   — event topics and payloads (see `contracts/EVENTS.md`)
//! - `contract`   — the `#[contract]` type and its `#[contractimpl]` block
//! - `test`       — `#[cfg(test)]` unit tests, one module per area

mod contract;
pub mod errors;
pub mod events;
pub mod types;

#[cfg(test)]
mod test;

pub use contract::{IdentityContract, IdentityContractClient};
pub use errors::IdentityError;
pub use types::DataKey;
