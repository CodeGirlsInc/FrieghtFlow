#![no_std]

//! Reputation & Rating Contract
//!
//! Tracks on-chain reputation for FreightFlow Carriers and Shippers.
//!
//! ## Score formula (0 – 1000)
//! ```text
//! score = avg_rating            ← 0-500  rating component (stored ×100)
//!       + on_time/success_pct×3 ← 0-300  punctuality / reliability
//!       + rated_pct×2           ← 0-200  how many completions were rated
//! ```
//! Fixed-point arithmetic: `average_rating` is stored as `score * 100`
//! (i.e. 500 = 5.00 stars, 350 = 3.50 stars).
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
//! - `users`      — registration
//! - `rating`     — rating submission
//! - `stats`      — completion statistics and scoring
//! - `test`       — `#[cfg(test)]` unit tests, one module per area

mod contract;
pub mod errors;
pub mod events;
mod rating;
mod stats;
mod storage;
pub mod types;
mod users;

#[cfg(test)]
mod test;

pub use contract::{ReputationContract, ReputationContractClient};
pub use errors::ReputationError;
pub use types::{DataKey, RatingRecord, Reputation, UserType};
