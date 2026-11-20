# Shipment Contract

## Purpose

Owns the freight shipment lifecycle: a shipper posts a load, a carrier
accepts it, moves it, marks it delivered, and the shipper confirms — which
is the signal the escrow contract settles on. Disputes are raised by a
party and resolved by the admin. Status transitions are validated against a
fixed table, so the state machine is the source of truth for every other
contract and for the backend.

## Entrypoints

| Entrypoint | Who may call | What it does |
|---|---|---|
| `initialize(admin)` | Anyone, once | Sets the admin and clears the paused flag. |
| `rotate_admin(current_admin, new_admin)` | Current admin | Transfers the admin role. |
| `pause(admin)` / `unpause(admin)` | Admin | Blocks / unblocks state mutation. |
| `create_shipment(shipper, origin, destination, cargo_description, weight_kg, price)` | Shipper | Creates a `Created` shipment and returns its id. |
| `update_shipment(...)` | Shipper | Edits terms while the shipment is still `Created`. |
| `accept_shipment(carrier, shipment_id)` | Carrier | Moves `Created → Accepted` and records the carrier. |
| `mark_in_transit(carrier, shipment_id)` | Carrier | Moves `Accepted → InTransit`. |
| `mark_delivered(carrier, shipment_id)` | Carrier | Moves `InTransit → Delivered`. |
| `confirm_delivery(shipper, shipment_id)` | Shipper | Moves `Delivered → Completed`, the signal for payment release. |
| `cancel_shipment(shipper, shipment_id)` | Shipper | Cancels from `Created` or `Accepted` only. |
| `raise_dispute(caller, shipment_id)` | Shipper or carrier | Moves the shipment into `Disputed`. |
| `resolve_dispute(shipment_id, resolve_as_completed)` | Admin | Resolves a dispute as completed or cancelled. |
| `get_shipment(shipment_id)` | Read-only | Returns the full `Shipment` record. |
| `get_shipments_by_shipper(shipper, offset, limit)` | Read-only | Paginated list of the shipper's shipment ids. |
| `get_shipments_by_carrier(carrier, offset, limit)` | Read-only | Paginated list of the carrier's shipment ids. |
| `get_total_shipments()` | Read-only | Number of shipments ever created. |

Statuses: `Created`, `Accepted`, `InTransit`, `Delivered`, `Completed`,
`Disputed`, `Cancelled`.

## Errors

| Code | Variant | Meaning |
|---|---|---|
| 1 | `NotInitialized` | The contract has never been initialised. |
| 2 | `AlreadyInitialized` | `initialize` was called a second time. |
| 3 | `NotFound` | No shipment with that id. |
| 4 | `Unauthorized` | The caller is not the admin for an admin-only call. |
| 5 | `InvalidStatus` | The transition is not allowed from the current status. |
| 6 | `InvalidInput` | A field failed validation (empty string, bad range). |
| 7 | `NotCarrier` | The caller is not the assigned carrier. |
| 8 | `NotShipper` | The caller is not the posting shipper. |
| 9 | `Paused` | The contract is paused and the call mutates state. |
| 10 | `SelfDealing` | Shipper and carrier would be the same address. |

## Storage keys

| Key | Scope | Value |
|---|---|---|
| `Counter` | Persistent | Last assigned shipment id |
| `Shipment(u64)` | Persistent | `Shipment` record |
| `ShipperList(Address)` | Persistent | `Vec<u64>` of the shipper's ids |
| `CarrierList(Address)` | Persistent | `Vec<u64>` of the carrier's ids |
| `Admin` | Instance | Current admin address |
| `Paused` | Instance | Pause flag |

## Events

Emitted per [`../EVENTS.md`](../EVENTS.md): `(shipment, <action>, shipment id)`
with the full post-transition `Shipment` as payload.

Actions: `created`, `updated`, `accepted`, `intransit`, `delivered`,
`completed`, `disputed`, `resolved`, `cancelled`.

## Trust assumptions

- **Shipper and carrier** each act only through their own signature and only
  on their own side of the shipment; `SelfDealing` blocks one address from
  playing both roles, which would manufacture completed jobs and pollute
  reputation signals.
- The **admin** resolves disputes and pauses the contract; it does not
  rewrite shipment fields directly.
- The escrow contract trusts this contract's status transitions as the
  trigger for release/refund, so any change to the transition table changes
  how money moves.
- Prices are in stroops (1 XLM = 10,000,000 stroops); the contract never
  touches tokens itself.
