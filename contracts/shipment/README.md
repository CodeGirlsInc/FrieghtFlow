# Shipment Contract

On-chain shipment lifecycle management. Tracks shipment state transitions from creation through delivery/completion, maintains per-user shipment lists with pagination, and enforces role-based authorization at each step.

## Storage Layout

| Key | Type | Description | TTL |
|---|---|---|---|
| `Admin` (instance) | `Address` | Platform admin | — |
| `Counter` (persistent) | `u64` | Auto-incrementing shipment ID | ~1 year |
| `Shipment(u64)` (persistent) | `Shipment` | Full shipment record | ~1 year |
| `ShipperListCount(Address)` (persistent) | `u32` | Number of shipments for a shipper | ~1 year |
| `ShipperListItem(Address, u32)` (persistent) | `u64` | Shipment ID at index | ~1 year |
| `CarrierListCount(Address)` (persistent) | `u32` | Number of shipments for a carrier | ~1 year |
| `CarrierListItem(Address, u32)` (persistent) | `u64` | Shipment ID at index | ~1 year |

## Types

- **ShipmentStatus:** `Created | Accepted | InTransit | Delivered | Completed | Disputed | Cancelled`
- **Shipment:** `{ id, shipper, carrier?, origin, destination, cargo_description, weight_kg, price, status, created_at, updated_at }`

## Functions

### `initialize(admin)`

One-time setup. Sets the platform admin.

- **Auth:** `admin.require_auth()`
- **Errors:** `AlreadyInitialized`

### `create_shipment(shipper, origin, destination, cargo_description, weight_kg, price) → u64`

Creates a new shipment in `Created` status. Returns the shipment ID.

- **Auth:** `shipper.require_auth()`
- **Errors:** `InvalidInput` (empty origin/destination, zero weight/price)
- **Example:**
  ```
  soroban contract invoke --id <CONTRACT> -- create_shipment --shipper GABC... --origin Lagos --destination Nairobi --cargo_description "Electronics" --weight_kg 500 --price 1000000000
  ```

### `accept_shipment(carrier, shipment_id)`

Carrier accepts an open shipment.

- **Auth:** `carrier.require_auth()`
- **Errors:** `NotFound`, `InvalidStatus` (not Created), `Unauthorized`
- **Example:**
  ```
  soroban contract invoke --id <CONTRACT> -- accept_shipment --carrier GABC... --shipment_id 1
  ```

### `mark_in_transit(carrier, shipment_id)`

Carrier marks cargo as picked up and in transit.

- **Auth:** `carrier.require_auth()`
- **Errors:** `NotFound`, `InvalidStatus` (not Accepted), `NotCarrier`

### `mark_delivered(carrier, shipment_id)`

Carrier marks cargo as delivered, awaiting shipper confirmation.

- **Auth:** `carrier.require_auth()`
- **Errors:** `NotFound`, `InvalidStatus` (not InTransit), `NotCarrier`

### `confirm_delivery(shipper, shipment_id)`

Shipper confirms receipt. Triggers completion.

- **Auth:** `shipper.require_auth()`
- **Errors:** `NotFound`, `InvalidStatus` (not Delivered), `NotShipper`

### `cancel_shipment(shipper_or_admin, shipment_id, caller_is_admin: bool)`

Cancel a shipment. Only allowed from `Created` or `Accepted` status.

- **Auth:** `shipper_or_admin.require_auth()`
- **Errors:** `NotFound`, `InvalidStatus`, `Unauthorized`

### `raise_dispute(caller, shipment_id)`

Either party raises a dispute on an in-transit or delivered shipment.

- **Auth:** `caller.require_auth()`
- **Errors:** `NotFound`, `InvalidStatus`, `Unauthorized`

### Query functions

- `get_shipment(shipment_id) → Shipment` — read-only
- `list_shipments_for_user(user, offset, limit) → Vec<Shipment>` — paginated
- `get_shipment_count_for_user(user) → u32`

## Error Codes

| Name | Value | Description |
|---|---|---|
| `NotInitialized` | 1 | Admin not set |
| `AlreadyInitialized` | 2 | Init called twice |
| `NotFound` | 3 | Shipment ID not found |
| `Unauthorized` | 4 | Caller is not a party to this shipment |
| `InvalidStatus` | 5 | Action not allowed in current status |
| `InvalidInput` | 6 | Missing or invalid fields |
| `NotCarrier` | 7 | Caller is not the assigned carrier |
| `NotShipper` | 8 | Caller is not the shipper |

## Events

| Event | Topics | Data |
|---|---|---|
| `shipment_created` | — | `shipment_id` |
| `shipment_accepted` | — | `shipment_id` |
| `shipment_in_transit` | — | `shipment_id` |
| `shipment_delivered` | — | `shipment_id` |
| `shipment_completed` | — | `shipment_id` |
| `shipment_cancelled` | — | `shipment_id` |
| `shipment_disputed` | — | `shipment_id` |
