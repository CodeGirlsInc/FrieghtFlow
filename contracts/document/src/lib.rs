#![no_std]

//! Document Registry Contract
//!
//! Stores tamper-proof hashes of freight documents (Bill of Lading, Proof of
//! Delivery, Invoices, etc.) on-chain.  The IPFS CID provides the location
//! of the full document; the on-chain hash proves the document has not been
//! altered since it was registered.
//!
//! A document is only accepted once the shipment it names has been confirmed
//! to exist — via a cross-contract call to the shipment contract — and the
//! uploader has been confirmed to be a party to it. See [`shipment`].
//!
//! ## Module layout
//!
//! Every contract crate in this workspace uses the same layout:
//!
//! - [`errors`]       — the `#[contracterror]` enum
//! - [`types`]        — `#[contracttype]` records and the storage [`DataKey`]
//! - [`events`]       — event topics and payloads (see `contracts/EVENTS.md`)
//! - [`shipment`]     — the shipment contract interface this crate calls
//! - `storage`        — shared storage accessors
//! - `contract`       — the `#[contract]` type and the whole `#[contractimpl]` ABI
//! - `registry`       — document registration
//! - `verification`   — admin verification and integrity checks
//! - `test`           — `#[cfg(test)]` unit tests, one module per area

mod contract;
pub mod errors;
pub mod events;
mod registry;
pub mod shipment;
mod storage;
pub mod types;
mod verification;

#[cfg(test)]
mod test;

pub use contract::{DocumentContract, DocumentContractClient};
pub use errors::DocumentError;
pub use types::{DataKey, DocumentRecord, DocumentType, HashAlgorithm};
