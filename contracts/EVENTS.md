# Contract event convention

Every state-changing entrypoint in every crate under `contracts/` publishes an
event. Off-chain consumers — the backend, indexers, monitoring — can follow
state by subscribing rather than polling contract storage.

Each crate implements this in its own `src/events.rs`, and its tests assert the
events in `src/test/events.rs`.

## Topics

Three topics, always in this order:

| # | Topic     | Type              | Meaning                                    |
|---|-----------|-------------------|--------------------------------------------|
| 1 | `subject` | `Symbol`          | Which contract emitted it                  |
| 2 | `action`  | `Symbol`          | What happened, as a past-tense verb        |
| 3 | `key`     | `u64` / `Address` | The entity the event is about              |

Subjects are `shipment`, `escrow`, `document`, `identity`, `reputation`.

The `key` is whatever identifies the entity for that contract: the shipment id
for `shipment` and `escrow`, the document id for `document`, and the user's
address for `identity` and `reputation`.

Symbols are built with `symbol_short!` where they fit its 9-character limit,
and `Symbol::new` where they do not (`registered`, `reputation`).

## Payload

**The payload is the entity's post-transition snapshot** — the same
`#[contracttype]` record the contract's own getter returns, after the change.
A consumer never has to read storage to learn the new state, and the payload
shape is one already-versioned type rather than a bespoke struct per event.

Where a transition can go two ways it is still one event, and the payload's
`status` field says which way it went: `resolve_dispute` emits a single
`resolved`, not `completed`/`cancelled`.

## Actions

| Contract     | Actions |
|--------------|---------|
| `shipment`   | `created`, `updated`, `accepted`, `intransit`, `delivered`, `completed`, `disputed`, `resolved`, `cancelled` |
| `escrow`     | `funded`, `released`, `refunded`, `disputed`, `resolved` |
| `document`   | `registered`, `verified`, `flagged` |
| `identity`   | `registered`, `revoked` |
| `reputation` | `registered`, `submitted`, `updated` |

`reputation` is the one contract with two payload shapes: `submitted` carries
the new `RatingRecord`, while `registered` and `updated` carry the affected
user's `Reputation` aggregate. `submit_rating` emits both, because both
changed.

## Testing events

`env.events().all()` in the test `Env` holds only the events of the **most
recent top-level invocation**. A call that returned an error leaves it empty,
and any further call clears it — read-only queries included. So read every
event a call produced before invoking the contract again. Each crate's
`src/test/mod.rs` has `emitted`, `emitted_key` and `no_events` helpers for
this.
