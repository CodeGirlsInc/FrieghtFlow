//! Workspace-shared policy constants for the FreightFlow contracts.
//!
//! Each contract crate compiles to a standalone Wasm blob, so contracts cannot
//! share code with one another; any value that encodes workspace-wide policy
//! and must stay in sync across all five crates lives here once and is
//! imported by each contract instead of being re-declared.

#![no_std]

/// Ledger-extended-ttl budget (~1 year at ~5s/ledger) applied to every
/// persistent-storage key the contracts write.
///
/// A workspace-wide TTL policy change (e.g. matching a different ledger close
/// time) is a single edit in this crate rather than five parallel edits in
/// each contract's `types.rs`.
pub const TTL_LEDGERS: u32 = 6_307_200;