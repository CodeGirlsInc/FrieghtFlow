# Escrow Contract

## Purpose

Holds the shipper's payment in the contract for the duration of a shipment
and releases it to the carrier on completion, refunds it on cancellation, or
hands it to the admin to split on a dispute. Tokens are held in a SEP-41
token contract (e.g. the Stellar native-XLM wrapper) configured at
initialisation.

## Entrypoints

| Entrypoint | Who may call | What it does |
|---|---|---|
| `initialize(admin, token_contract)` | Anyone, once | Sets admin, pause flag and token contract. |
| `rotate_admin(current_admin, new_admin)` | Current admin | Transfers the admin role. |
| `pause(admin)` / `unpause(admin)` | Admin | Blocks / unblocks state mutation. |
| `set_shipment_contract(shipment_contract)` | Admin | Repoints the shipment contract this escrow tracks. |
| `set_token_contract(new_token)` | Admin | Repoints the held token (only while no escrow is funded). |
| `fund_escrow(shipper, shipment_id, carrier, amount)` | Shipper | Locks `amount` tokens for the shipment; creates the record as `Funded`. |
| `release_payment(shipment_id)` | Settlement authority (admin) | Releases a `Funded` escrow to the carrier. |
| `refund_payment(shipment_id)` | Settlement authority (admin) | Refunds a `Funded` escrow to the shipper. |
| `refund_payment_with_fee(shipment_id, fee_amount)` | Settlement authority (admin) | Refunds and retains `fee_amount` for the platform admin. |
| `raise_dispute(caller, shipment_id)` | Shipper or carrier | Marks the escrow `Disputed` so no payout happens. |
| `resolve_dispute(shipment_id, release_to_carrier, fee_amount)` | Admin | Splits a `Disputed` escrow and settles it. |
| `get_escrow(shipment_id)` | Read-only | Returns the `EscrowRecord`. |
| `get_settlement_fee(shipment_id)` | Read-only | Fee retained the last time this escrow settled as a partial refund. |
| `get_admin()` / `get_balance()` | Read-only | Admin address / contract token balance. |

Statuses: `Pending` (declared, currently unused — see `types.rs`),
`Funded`, `Released`, `Refunded`, `Disputed`.

## Errors

| Code | Variant | Meaning |
|---|---|---|
| 1 | `NotInitialized` | The contract has never been initialised. |
| 2 | `AlreadyInitialized` | `initialize` was called a second time. |
| 3 | `NotFound` | No escrow with that shipment id. |
| 4 | `AlreadyFunded` | The escrow is already funded. |
| 5 | `NotFunded` | The escrow is not in `Funded` state. |
| 6 | `InvalidStatus` | The transition is not allowed from the current status. |
| 7 | `Unauthorized` | The caller is not authorised (non-party, non-admin). |
| 8 | `InvalidAmount` | Amount is non-positive, or a fee is negative or ≥ the escrow. |
| 9 | `InsufficientBalance` | The contract's token balance cannot cover the payout. |
| 10 | `Paused` | The contract is paused and the call mutates state. |
| 11 | `InvalidParties` | Shipper and carrier are the same address. |

## Storage keys

| Key | Scope | Value |
|---|---|---|
| `Escrow(u64)` | Persistent | `EscrowRecord` keyed by shipment id |
| `EscrowFee(u64)` | Persistent | Fee retained at last partial-refund settlement |
| `Admin` | Instance | Settlement authority / platform fee recipient |
| `TokenContract` | Instance | SEP-41 token holding the funds |
| `ShipmentContract` | Instance | Shipment contract this escrow is wired to |
| `Paused` | Instance | Pause flag |

## Events

Emitted per [`../EVENTS.md`](../EVENTS.md): `(escrow, <action>, shipment id)`
with the full post-transition `EscrowRecord` as payload.

Actions: `funded`, `released`, `refunded`, `disputed`, `resolved`.

## Trust assumptions

- **Funds are held by the contract**, not by any operator; payouts only
  happen through the settlement entrypoints.
- The **admin doubles as the settlement authority**: today
  `release_payment`, `refund_payment`, `refund_payment_with_fee` and
  `resolve_dispute` are admin-gated (`require_settlement_authority`), and
  the platform fee is paid to that same address — one canonical fee
  recipient, no second configuration.
- The **shipper** controls funding and can only cause a dispute as a party;
  the **carrier** cannot pull funds, only dispute.
- The escrow trusts the **shipment contract's** status as the business
  trigger for settlement; `set_shipment_contract` lets an admin re-wire it
  after a redeploy.
- Pausing stops funding and settlement alike, so a paused contract holds
  funds in place until the admin unpauses (see
  [`SECURITY-MODEL.md`](../SECURITY-MODEL.md)).
- Historical notes on specific audits live in [`audit.md`](audit.md).
