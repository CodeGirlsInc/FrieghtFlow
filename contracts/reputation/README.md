# Reputation Contract

## Purpose

Tracks on-chain reputation for FreightFlow carriers and shippers: registration,
per-shipment outcome statistics, and 1-5 star ratings from the counterparty of
a completed shipment. The contract also computes a composite score used by the
dashboard:

```text
score = avg_rating            ← 0-500  rating component (stored ×100)
      + on_time/success_pct×3 ← 0-300  punctuality / reliability
      + rated_pct×2           ← 0-200  how many completions were rated
```

`average_rating` is fixed point: 500 = 5.00 stars.

## Entrypoints

| Entrypoint | Who may call | What it does |
|---|---|---|
| `initialize(admin, authorized_contract)` | Anyone, once | Sets admin, authorised contract and pause flag. |
| `rotate_admin(current_admin, new_admin)` | Current admin | Transfers the admin role. |
| `set_authorized_contract(addr)` | Admin | Sets the contract allowed to push completion stats. |
| `get_authorized_contract()` | Read-only | Returns the authorised contract address. |
| `pause(admin)` / `unpause(admin)` | Admin | Blocks / unblocks state mutation. |
| `register_user(user, user_type)` | The user | Creates a `Reputation` profile for `Carrier` or `Shipper`. |
| `update_user_type(user, user_type)` | The user | Corrects a mis-registered user type in one user-signed call. |
| `submit_rating(rater, shipment_id, rated, score)` | Rater | Records a 1-5 star rating and updates the rated user's aggregate. |
| `void_rating(rating_id)` | Admin | Removes a rating and reverses its effect on the aggregate. |
| `update_stats(caller, user, outcome)` | Authorised contract | Increments the completion counters for `user`. |
| `calculate_score(user)` | Read-only | Computes the composite score. |
| `get_reputation(user)` / `get_rating(rating_id)` | Read-only | Profile / rating lookup. |
| `has_rated_shipment(shipment_id, rater)` | Read-only | Whether `rater` already rated that shipment. |
| `get_total_ratings()` | Read-only | Number of ratings ever submitted. |

## Errors

| Code | Variant | Meaning |
|---|---|---|
| 1 | `NotInitialized` | The contract has never been initialised. |
| 2 | `AlreadyInitialized` | `initialize` was called a second time. |
| 3 | `UserNotFound` | No reputation profile for that address. |
| 4 | `UserAlreadyRegistered` | The user already has a profile. |
| 5 | `InvalidScore` | Rating score is outside 1-5. |
| 6 | `AlreadyRatedShipment` | This rater already rated this shipment. |
| 7 | `CannotRateSelf` | Rater and rated are the same address. |
| 8 | `Unauthorized` | Caller is not the admin / authorised contract. |
| 9 | `UserTypeMismatch` | The outcome does not fit the user's type. |
| 10 | `RatingNotFound` | No rating with that id. |
| 11 | `Paused` | The contract is paused and the call mutates state. |

## Storage keys

| Key | Scope | Value |
|---|---|---|
| `Reputation(Address)` | Persistent | `Reputation` profile for the user |
| `Rating(u64)` | Persistent | `RatingRecord` |
| `RatingCounter` | Persistent | Last assigned rating id |
| `ShipmentRaters(u64)` | Persistent | `Vec<Address>` of raters for a shipment |
| `Admin` | Instance | Current admin address |
| `AuthorizedContract` | Instance | Contract allowed to call `register_user` / `update_stats` |
| `Paused` | Instance | Pause flag |

## Events

Emitted per [`../EVENTS.md`](../EVENTS.md):
`(reputation, <action>, user address)`. `registered` and `updated` carry the
`Reputation` aggregate; `submitted` carries the new `RatingRecord`.
`submit_rating` emits both `submitted` and `updated` because both changed.

Actions: `registered`, `submitted`, `updated`.

## Trust assumptions

- The **admin** registers users, voids ratings, sets the authorised contract
  and pauses the contract. Voiding a rating is an admin act — ratings cannot
  be silently deleted by their authors.
- The **authorised contract** (or the admin) is the only writer of completion
  statistics, so arbitrary addresses cannot mint completed shipments;
  registration itself is self-service and only creates an empty profile.
- **Users** register themselves, sign their own ratings and change only their
  own type; the contract assumes `require_auth` is the identity.
- Ratings are only meaningful for completed shipments; the contract records
  the `shipment_id` but does **not** itself verify that the shipment exists
  or completed — that is the authorised caller's responsibility.
- Score manipulation via switching `UserType` (which selects the counters
  `stats::score` reads) is a known consideration for
  `update_user_type`; see [`SECURITY-MODEL.md`](../SECURITY-MODEL.md).
