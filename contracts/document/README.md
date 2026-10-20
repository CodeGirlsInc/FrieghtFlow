# Document Registry Contract

## Purpose

Stores tamper-proof hashes of freight documents (Bill of Lading, Proof of
Delivery, Invoice, Customs Declaration, Insurance Certificate, Photo, Other)
on-chain. The IPFS CID records where the full document lives; the on-chain
`content_hash` proves the document has not been altered since registration.
A document is only accepted if the shipment exists in the shipment contract
and the uploader is a party to it.

## Entrypoints

| Entrypoint | Who may call | What it does |
|---|---|---|
| `initialize(admin, shipment_contract)` | Anyone, once | Sets admin, shipment contract and pause flag. |
| `rotate_admin(current_admin, new_admin)` | Current admin | Transfers the admin role. |
| `pause(admin)` / `unpause(admin)` | Admin | Blocks / unblocks state mutation. |
| `set_shipment_contract(shipment_contract)` | Admin | Repoints the shipment contract used for validation. |
| `register_document(uploader, shipment_id, doc_type, content_hash, hash_algorithm, ipfs_cid)` | Shipper or carrier of the shipment | Validates the shipment, party and CID length, stores the record and appends it to the shipment's document list. |
| `verify_document(verifier, doc_id)` | Admin | Marks a document authentic (`is_verified = true`). |
| `flag_document(admin, doc_id, reason)` | Admin | Flags a verified document as fraudulent, reversing verification and recording the reason. |
| `check_integrity(doc_id, hash)` | Read-only | Compares a supplied hash with the registered `content_hash`. |
| `get_document(doc_id)` | Read-only | Returns the `DocumentRecord`. |
| `get_documents_by_shipment(shipment_id, offset, limit)` | Read-only | Paginated document ids for a shipment. |
| `get_total_documents()` | Read-only | Number of documents ever registered. |
| `get_shipment_contract()` | Read-only | The wired shipment contract address. |

`ipfs_cid` is capped at `MAX_IPFS_CID_LEN` (512) bytes and `reason` in
`flag_document` at 1024 bytes.

## Errors

| Code | Variant | Meaning |
|---|---|---|
| 1 | `NotInitialized` | The contract has never been initialised. |
| 2 | `AlreadyInitialized` | `initialize` was called a second time. |
| 3 | `NotFound` | No document with that id. |
| 4 | `Unauthorized` | The caller is not the admin for an admin-only call. |
| 5 | `AlreadyVerified` | The document is already verified. |
| 6 | `HashMismatch` | `check_integrity` was given the wrong hash. |
| 7 | `ShipmentNotFound` | The shipment id is unknown to the shipment contract. |
| 8 | `NotShipmentParty` | The uploader is neither shipper nor carrier. |
| 9 | `Paused` | The contract is paused and the call mutates state. |
| 10 | `NotVerified` | `flag_document` was called on a document that is not verified. |
| 11 | `FieldTooLong` | `ipfs_cid` > 512 bytes or `reason` > 1024 bytes. |

## Storage keys

| Key | Scope | Value |
|---|---|---|
| `Counter` | Persistent | Last assigned document id |
| `Document(u64)` | Persistent | `DocumentRecord` |
| `ShipmentDocs(u64)` | Persistent | `Vec<u64>` of document ids for a shipment |
| `Admin` | Instance | Current admin address |
| `ShipmentContract` | Instance | Shipment contract used for cross-contract validation |
| `Paused` | Instance | Pause flag |

## Events

Emitted per [`../EVENTS.md`](../EVENTS.md): `(document, <action>, document id)`
with the full post-transition `DocumentRecord` as payload.

Actions: `registered`, `verified`, `flagged`.

## Trust assumptions

- The **admin** decides what is authentic: it verifies and flags documents
  and repoints the shipment contract. A compromised admin can mark a forged
  document authentic, which is why verification is an explicit, auditable
  event rather than a silent field change.
- The **uploader** must be a party to the shipment (checked against the
  shipment contract), so unrelated addresses cannot anchor documents to
  someone else's shipment.
- The contract **trusts the shipment contract** for existence and party
  checks; if that address is wrong, those checks are worthless — hence
  `set_shipment_contract` being admin-only and pausable.
- The IPFS CID is a *pointer*, not a copy: availability of the file itself
  is off-chain, while integrity is guaranteed by `content_hash`.
