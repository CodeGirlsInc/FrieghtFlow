# Reputation Contract

On-chain reputation and rating system for FreightFlow carriers and shippers. Tracks ratings (1–5 stars), on-time delivery statistics, and computes a composite reputation score (0–1000) using a weighted formula.

## Score Formula

```
rating_component     = average_rating × 100          ← 0–500
rate_component       = on_time_pct × 3 (carriers)    ← 0–300
                       success_pct × 3 (shippers)
completion_component = (rating_count / completed) × 2 ← 0–200
score = min(rating_component + rate_component + completion_component, 1000)
```

## Storage Layout

| Key | Type | Description | TTL |
|---|---|---|---|
| `Admin` (instance) | `Address` | Platform admin | — |
| `AuthorizedContract` (instance) | `Address` | Shipment contract allowed to call `update_stats` | — |
| `RatingCounter` (persistent) | `u64` | Auto-incrementing rating ID | ~1 year |
| `Reputation(Address)` (persistent) | `Reputation` | Reputation profile per user | ~1 year |
| `Rating(u64)` (persistent) | `RatingRecord` | Individual rating record | ~1 year |
| `ShipmentRaters(u64)` (persistent) | `Vec<Address>` | Who rated this shipment | ~1 year |
| `StatsRecorded(u64)` (persistent) | `Vec<Address>` | Who had stats recorded for this shipment | ~1 year |

## Types

- **UserType:** `Carrier | Shipper`
- **Reputation:** `{ user, user_type, total_completed, total_rating_points, rating_count, on_time_count, late_count, success_count, cancel_count, average_rating, last_updated }`
- **RatingRecord:** `{ id, shipment_id, rater, rated, score, timestamp }`

## Functions

### `initialize(admin, authorized_contract)`

One-time setup.

- **Auth:** Admin `require_auth()`
- **Errors:** `AlreadyInitialized`

### `register_user(user, user_type)`

Register a user as a Carrier or Shipper. Called once per address.

- **Auth:** `user.require_auth_for_args(&[&user_type])`
- **Errors:** `UserAlreadyRegistered`

### `submit_rating(rater, shipment_id, rated, score) → u64`

Submit a 1–5 star rating for a completed shipment. Each address can rate a given shipment once. Rater and rated must be of different user types.

- **Auth:** `rater.require_auth_for_args(&[&shipment_id, &rated, &score])`
- **Errors:** `InvalidScore`, `CannotRateSelf`, `AlreadyRatedShipment`, `UserNotFound`, `UserTypeMismatch`

### `update_stats(caller, user, shipment_id, was_on_time, was_successful)`

Update completion stats. Only callable by the authorized shipment contract or admin.

- **Auth:** `caller.require_auth_for_args(&[&user, &was_on_time, &was_successful])`
- **Errors:** `UserNotFound`, `Unauthorized`, `AlreadyRecordedStats`

### `calculate_score(user) → u32`

Compute the 0–1000 composite reputation score. Read-only.

### Query functions

- `get_reputation(user) → Reputation`
- `get_rating(rating_id) → RatingRecord`
- `has_rated_shipment(shipment_id, rater) → bool`
- `has_recorded_stats(shipment_id, user) → bool`
- `get_total_ratings() → u64`

## Error Codes

| Name | Value | Description |
|---|---|---|
| `NotInitialized` | 1 | Admin/authorized contract not set |
| `AlreadyInitialized` | 2 | Init called twice |
| `UserNotFound` | 3 | User not registered |
| `UserAlreadyRegistered` | 4 | Duplicate registration |
| `InvalidScore` | 5 | Score must be 1–5 |
| `AlreadyRatedShipment` | 6 | Rater already rated this shipment |
| `CannotRateSelf` | 7 | Rater and rated are the same address |
| `Unauthorized` | 8 | Caller is not the authorized contract or admin |
| `UserTypeMismatch` | 9 | Both parties are the same user type |
| `RatingNotFound` | 10 | Rating ID not found |
| `AlreadyRecordedStats` | 11 | Stats already recorded for this shipment/user |
| `ArithmeticOverflow` | 12 | Counter overflow |

## Events

| Event | Topics | Data |
|---|---|---|
| `user_registered` | `user` | `user_type` |
| `rating_submitted` | `rated` | `rating_id` |
| `stats_updated` | `user` | `shipment_id` |
