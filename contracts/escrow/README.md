# Escrow Contract

Holds payment tokens in trust until shipment delivery is confirmed. Supports fund, release, refund, dispute, and admin resolution. Uses a SEP-41 token (e.g. native XLM wrapper) for all transfers.

## Storage Layout

| Key | Type | Description | TTL |
|---|---|---|---|
| `Admin` (instance) | `Address` | Platform admin | — |
| `TokenContract` (instance) | `Address` | SEP-41 token used for escrow | — |
| `Escrow(u64)` (persistent) | `EscrowRecord` | Escrow record per shipment ID | ~1 year |

## Types

- **EscrowStatus:** `Pending | Funded | Released | Refunded | Disputed`
- **EscrowRecord:** `{ shipment_id, shipper, carrier, amount, status, funded_at, settled_at }`

## Functions

### `initialize(admin, token_contract)`

One-time setup.

- **Auth:** `admin.require_auth()`
- **Errors:** `AlreadyInitialized`

### `fund_escrow(shipper, carrier, shipment_id, amount)`

Shipper deposits tokens into escrow. The contract pulls tokens via `token.transfer_from`.

- **Auth:** `shipper.require_auth()`
- **Errors:** `AlreadyFunded`, `InvalidAmount` (≤0), `Unauthorized`
- **Example:**
  ```
  soroban contract invoke --id <CONTRACT> -- fund_escrow --shipper GABC... --carrier GDEF... --shipment_id 42 --amount 500000000
  ```

### `release_payment(shipment_id)`

Release escrowed funds to the carrier. Admin-only.

- **Auth:** Admin `require_auth()`
- **Errors:** `NotFound`, `InvalidStatus` (not Funded), `Unauthorized`

### `refund_payment(shipment_id)`

Return funds to the shipper. Admin-only.

- **Auth:** Admin `require_auth()`
- **Errors:** `NotFound`, `InvalidStatus` (not Funded), `Unauthorized`

### `raise_dispute(caller, shipment_id)`

Either party raises a dispute, freezing the escrow.

- **Auth:** `caller.require_auth()`
- **Errors:** `NotFound`, `InvalidStatus` (not Funded), `Unauthorized` (not shipper or carrier)

### `resolve_dispute(shipment_id, release_to_carrier)`

Admin resolves a dispute by directing funds to carrier or shipper.

- **Auth:** Admin `require_auth()`
- **Errors:** `NotFound`, `InvalidStatus` (not Disputed), `Unauthorized`

### Query functions

- `get_escrow(shipment_id) → EscrowRecord`
- `get_balance() → i128` — contract's current token balance

## Error Codes

| Name | Value | Description |
|---|---|---|
| `NotInitialized` | 1 | Admin/token not set |
| `AlreadyInitialized` | 2 | Init called twice |
| `NotFound` | 3 | No escrow for this shipment ID |
| `AlreadyFunded` | 4 | Escrow already funded for this shipment |
| `NotFunded` | 5 | Escrow not yet funded |
| `InvalidStatus` | 6 | Action not allowed in current status |
| `Unauthorized` | 7 | Caller is not a party or not admin |
| `InvalidAmount` | 8 | Amount ≤ 0 |
| `InsufficientBalance` | 9 | Contract doesn't hold enough tokens |

## Events

| Event | Topics | Data |
|---|---|---|
| `escrow_funded` | — | `shipment_id, amount` |
| `escrow_released` | — | `shipment_id` |
| `escrow_refunded` | — | `shipment_id` |
| `dispute_raised` | — | `shipment_id` |
| `dispute_resolved` | — | `shipment_id, released_to_carrier` |
