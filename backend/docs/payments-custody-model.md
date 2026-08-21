# ADR: Payment Custody Model

## Status

Accepted — 2026-08-20

## Context

The FrieghtFlow escrow contract (`contracts/escrow/src/lib.rs`) controls fund flow on the Stellar/Soroban blockchain. The key authorization model is:

- **`shipper.require_auth()`** is required to **fund** the escrow (deposit).
- **`admin.require_auth()`** is required to **release**, **refund**, or **resolve** disputes.

This creates a **hybrid custody model**: non-custodial deposit (the shipper controls funding) with admin-arbitrated release (a central authority controls settlement).

## Decision

We adopt a **hybrid (non-custodial deposit + admin-arbitrated release)** custody model.

### What the Admin Keypair Can Do

| Action | Authorized By | Effect |
|---|---|---|
| `release_payment` | `admin.require_auth()` | Sends held funds to the carrier wallet. |
| `refund_payment` | `admin.require_auth()` | Returns held funds to the shipper wallet. |
| `resolve_dispute` | `admin.require_auth()` | Releases funds to carrier OR refunds shipper based on `release_to_carrier` flag. |

### What the Admin Keypair Cannot Do

- **Cannot fund** the escrow — only the shipper can deposit via `fund_escrow`.
- **Cannot modify** the escrow record (amount, participants) after creation.
- **Cannot create** escrow records — they are created implicitly on funding.
- **Cannot bypass** the token contract's transfer logic.

### Centralization Risk

A single admin keypair has **unilateral control over all fund releases and refunds**. This means:

- A compromised admin key can drain all escrowed funds.
- A compromised admin key can freeze funds by refusing to release.
- There is no timelock or multi-party approval on admin actions.

**This is acceptable for testnet / MVP but must be addressed before mainnet.**

### Required Before Mainnet

1. **Multisig on admin actions** — require N-of-M admin signatures for release/refund/resolve.
2. **Timelock** — a mandatory delay between release initiation and execution, allowing dispute.
3. **On-chain audit trail** — all admin actions should emit events for off-chain monitoring.
4. **Circuit breaker** — a mechanism to pause the contract if anomalous activity is detected.

## ID Mapping Strategy

The backend uses UUID primary keys for `Shipment` entities. The escrow contract uses `u64` shipment IDs. We map between them via a dedicated Postgres sequence:

- `onChainShipmentId` is generated lazily on first funding attempt per shipment.
- The sequence is dense (no gaps) and per-environment to avoid cross-deployment collisions.
- Unique constraints on both `shipmentId` and `onChainShipmentId` prevent duplicates.

## Scope

- **In scope:** Payment entity, ID mapping, custody-model documentation.
- **Out of scope:** Soroban RPC calls, wallet UI, fee splitting, multisig/timelock implementation.
