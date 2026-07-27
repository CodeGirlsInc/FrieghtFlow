# Identity Contract

On-chain identity registry for FreightFlow. Maps Stellar wallet addresses to hashed user identifiers, enabling the platform to link on-chain actions to off-chain accounts without storing PII on-chain.

## Storage Layout

| Key | Type | Description | TTL |
|---|---|---|---|
| `Admin` (instance) | `Address` | Platform admin who can revoke identities | — |
| `Identity(Address)` (persistent) | `BytesN<32>` | SHA-256 hash of the user's internal ID, keyed by wallet | ~1 year |

## Functions

### `initialize(admin)`

One-time setup. Sets the platform admin.

- **Auth:** `admin.require_auth()`
- **Errors:** `AlreadyInitialized` if called more than once
- **Example:**
  ```
  soroban contract invoke --id <CONTRACT> -- initialize --admin GABC...
  ```

### `register_identity(user_id_hash, wallet)`

Register a wallet-to-identity mapping. Called once at account creation.

- **Auth:** `wallet.require_auth_for_args(&[&user_id_hash])`
- **Errors:** `AlreadyRegistered` if the wallet is already registered
- **Example:**
  ```
  soroban contract invoke --id <CONTRACT> -- register_identity --user_id_hash <BYTES_32> --wallet GABC...
  ```

### `verify_identity(wallet) → bool`

Returns `true` if the wallet has a registered identity. No auth required.

- **Example:**
  ```
  soroban contract invoke --id <CONTRACT> -- verify_identity --wallet GABC...
  ```

### `get_user_identity(wallet) → BytesN<32>`

Returns the `user_id_hash` for a registered wallet.

- **Errors:** `NotRegistered` if the wallet has no identity
- **Example:**
  ```
  soroban contract invoke --id <CONTRACT> -- get_user_identity --wallet GABC...
  ```

### `revoke_identity(wallet)`

Admin-only. Removes a wallet's identity record.

- **Auth:** Admin `require_auth()`
- **Errors:** `NotInitialized`, `NotRegistered`, `Unauthorized`
- **Example:**
  ```
  soroban contract invoke --id <CONTRACT> -- revoke_identity --wallet GABC...
  ```

## Error Codes

| Name | Value | Description |
|---|---|---|
| `AlreadyRegistered` | 1 | Wallet already has an identity, or init called twice |
| `NotRegistered` | 2 | Wallet not found in registry |
| `Unauthorized` | 3 | Caller is not the admin (for revoke) |
| `NotInitialized` | 4 | Admin key not set |

## Events

| Event | Topics | Data |
|---|---|---|
| *(none currently emitted)* | — | — |
