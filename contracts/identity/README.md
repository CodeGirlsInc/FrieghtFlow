# Identity Contract

## Purpose

Binds a Stellar wallet address to the hash of an off-chain identity record
(KYC), so other FreightFlow contracts and indexers can check that a
counterparty has been verified without putting personal data on-chain. The
contract stores only `wallet → user_id_hash` (and the reverse index), never
any identity payload.

## Entrypoints

| Entrypoint | Who may call | What it does |
|---|---|---|
| `initialize(admin)` | Anyone, once | Sets the admin and clears the paused flag. Fails with `AlreadyInitialized` on a second call. |
| `rotate_admin(current_admin, new_admin)` | Current admin | Transfers the admin role. |
| `pause(admin)` / `unpause(admin)` | Admin | Blocks / unblocks every state-mutating entrypoint. |
| `register_identity(user_id_hash, wallet)` | The wallet itself | Creates the `wallet → hash` record and the reverse index entry. At most `MAX_WALLETS_PER_HASH` (64) wallets per hash. |
| `update_identity(wallet, new_user_id_hash)` | The wallet itself | Re-points an existing record at a new hash without an unregistered window. |
| `deregister_identity(wallet)` | The wallet itself | Self-service removal of the caller's own record and index entry. |
| `revoke_identity(wallet)` | Admin | Admin-side removal of a wallet's record and index entry. |
| `verify_identity(wallet)` | Read-only | `true` when the wallet has a registered identity. |
| `get_user_identity(wallet)` | Read-only | Returns the wallet's `user_id_hash`. |
| `get_wallets_by_identity(user_id_hash, offset, limit)` | Read-only | Paginated reverse lookup of the wallets bound to a hash. |

## Errors

| Code | Variant | Meaning |
|---|---|---|
| 1 | `NotInitialized` | The contract has never been initialised. |
| 2 | `NotRegistered` | The wallet has no identity record. |
| 3 | `Unauthorized` | The caller is not the admin for an admin-only call. |
| 4 | `AlreadyRegistered` | The wallet already has an identity record. |
| 5 | `Paused` | The contract is paused and the call mutates state. |
| 6 | `AlreadyInitialized` | `initialize` was called a second time. |
| 7 | `WalletLimitReached` | `MAX_WALLETS_PER_HASH` (64) wallets are already bound to this hash. |

## Storage keys

| Key | Scope | Value |
|---|---|---|
| `Identity(Address)` | Persistent | `user_id_hash` of the wallet |
| `HashToWallets(BytesN<32>)` | Persistent | `Vec<Address>` reverse index for a hash |
| `Admin` | Instance | Current admin address |
| `Paused` | Instance | Pause flag |

## Events

Emitted per the workspace convention in [`../EVENTS.md`](../EVENTS.md):
`(identity, <action>, wallet)` with the `user_id_hash` as payload.

| Action | When |
|---|---|
| `registered` | A wallet is registered against a hash |
| `updated` | A wallet is re-pointed at a new hash |
| `revoked` | A record is removed (admin `revoke_identity` or self-service `deregister_identity`) |

## Trust assumptions

- The **admin** is the platform operator: it can pause the contract, revoke
  any wallet's identity and rotate itself. A compromised admin can unbind
  users from their identities but cannot forge a `user_id_hash`, because
  wallets sign their own registrations.
- **Users** control only their own wallet's record
  (`register_identity`, `update_identity`, `deregister_identity`); each call
  requires the wallet's own signature.
- The contract stores a **hash**, not personal data; whoever holds the
  off-chain record controls what a hash resolves to. The contract makes no
  claim about the quality of the off-chain verification that produced it.
- Nothing in this crate is called by the other four contracts at runtime;
  it is a standalone registry other systems read.
