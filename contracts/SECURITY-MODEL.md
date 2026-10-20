# Contracts Security Model

Threat model and pre-deployment checklist for the five Soroban contracts in
[`contracts/`](.). Complements the per-crate READMEs
([`identity`](identity/README.md), [`shipment`](shipment/README.md),
[`escrow`](escrow/README.md), [`document`](document/README.md),
[`reputation`](reputation/README.md)), the event convention in
[`EVENTS.md`](EVENTS.md) and the repository-wide policy in
[`../SECURITY.md`](../SECURITY.md).

## Assets

| Asset | Where it lives | Why it matters |
|---|---|---|
| Escrowed tokens (XLM via a SEP-41 token contract) | `escrow` persistent storage + token balances | Directly transferable value; the primary theft target. |
| Shipment state machine | `shipment` persistent storage | Drives release/refund decisions; forged transitions move money. |
| Document hashes and CIDs | `document` persistent storage | The provenance claim the platform sells; corruption breaks trust. |
| Identity bindings (`wallet → user_id_hash`) | `identity` persistent storage | The KYC signal other systems rely on. |
| Reputation aggregates and ratings | `reputation` persistent storage | Ranking, pricing and business decisions are derived from it. |
| Admin keys | Instance storage of each contract | Full control of pause, resolution and configuration. |
| Authorised-caller links | `escrow/ShipmentContract`, `reputation/AuthorizedContract`, `document/ShipmentContract` | A wrong link silently disables cross-contract checks. |

## Actors

| Actor | Powers | Constraints |
|---|---|---|
| **Platform admin** | Pause/unpause, rotate itself, resolve disputes, verify/flag documents, void ratings, repoint linked contracts, receive platform fees | Single address per contract; every admin action requires its signature and (except `rotate_admin`) is blocked while paused. |
| **Shipper** | Create/edit/accept-cancel their own shipments, fund escrow, confirm delivery, raise disputes, register documents to their shipments, rate the carrier | Cannot act for the carrier; `SelfDealing`/`InvalidParties` block the same address playing both roles. |
| **Carrier** | Accept, mark in-transit/delivered, raise disputes, upload documents to assigned shipments, rate the shipper | Only on shipments assigned to them; cannot pull funds. |
| **Any address** | Register its own identity, register its own reputation profile, read everything | Self-service writes only touch the caller's own record. |
| **Authorised contract / backend** | Push completion stats, register users on the reputation contract | Must be the configured address, or the admin. |
| **Off-chain indexer** | Reads events | No write access; must treat payloads as post-transition snapshots. |

## Trust boundaries and mitigations

1. **Money movement is contract-enforced.** Tokens are only held by the
   `escrow` contract; release, refund and dispute resolution are
   admin-gated (`require_settlement_authority`) and status-checked, so a
   double payout requires an `InvalidStatus`-violating state that cannot be
   reached twice.
2. **Cross-contract links are explicit and pausable.** `escrow` and
   `document` validate against a configured shipment contract;
   `reputation` validates its authorised caller on every `update_stats`.
   Each link is admin-only to change, so an attacker cannot repoint them
   without the admin key.
3. **Party checks happen on-chain.** `document` refuses uploads from
   non-parties, `shipment` refuses self-dealing, `escrow` refuses identical
   parties — the backend is not trusted to enforce these.
4. **Pause is an incident lever, not a design default.** Pausing blocks
   state mutation in all five contracts. Note that in `escrow` this also
   blocks settlement of already-funded escrows: during a pause, funds are
   frozen rather than drained. Restoring service is `unpause`, which is
   admin-signed.
5. **Events are the audit trail.** Every state-changing entrypoint emits a
   `(subject, action, key)` event whose payload is the post-transition
   record (see [`EVENTS.md`](EVENTS.md)), so divergence between storage and
   an indexer is detectable.
6. **Personal data stays off-chain.** `identity` stores only a hash and
   wallet address; the document registry stores hashes and CIDs, not file
   contents.
7. **Storage growth is bounded** where it is user-driven: per-hash wallet
   caps in `identity`, length caps on document fields, and paginated
   getters everywhere so no read is unbounded.

## Known limitations / accepted risks

- **No upgrade path.** No contract exposes `update_current_contract_wasm`;
  fixing a deployed contract means redeploying and re-pointing every
  dependent contract. Stored state does not migrate automatically.
- **Admin is a single point of failure.** A compromised admin can resolve
  disputes in its own favour, verify forged documents and void legitimate
  ratings. Mitigation is operational: `rotate_admin` to a fresh key and
  `pause` during an incident.
- **Reputation type switching.** `update_user_type` lets a user relabel
  themselves; per-type counters are preserved, so the score composition
  changes with the label. Treated as a correctness risk for ranking, not
  for funds.
- **Ratings are not shipment-verified on-chain.** `submit_rating` records a
  `shipment_id` but does not prove that shipment completed; correctness
  depends on the caller's off-chain validation.
- **Escrow settlement is currently admin-driven**, not automatically wired
  to shipment transitions; a silent admin delays payouts.

## Pre-deployment checklist

1. **Initialise atomically and in order** — `shipment` first (no
   dependencies), then `identity`, `document` (needs the shipment address),
   `escrow` (needs admin + token address), then `reputation` (needs admin +
   authorised contract). Every `initialize` is one-shot (`AlreadyInitialized`
   on a second call), so a typo means a redeploy.
2. **Confirm every admin address** is the intended key (hardware-backed or
   multisig as required by operations), not a developer's hot wallet.
3. **Set and verify the cross-contract links**: `document` and `escrow`
   → shipment contract, `reputation` → authorised contract. Read them back
   with `get_shipment_contract` / `get_authorized_contract`.
4. **Confirm the token contract** configured in `escrow` is the intended
   SEP-41 asset and that `get_balance()` is zero before funding starts.
5. **Leave contracts unpaused** after smoke-testing `pause`/`unpause`, and
   record who holds the pause key.
6. **Wire an indexer** to the event subjects (`shipment`, `escrow`,
   `document`, `identity`, `reputation`) before serving traffic, so state
   divergence is caught early.
7. **Run the workspace test suite** (`cargo test --all`) and the WASM size
   check (`scripts/check-wasm-size.sh`) against the exact artifacts to be
   deployed.
8. **Record deployed addresses and hashes** in the release notes so
   off-chain systems and the incident runbook reference the same chain state.
