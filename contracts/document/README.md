# Document Contract

On-chain document registry for tamper-proof freight document verification. Stores SHA-256 hashes and IPFS CIDs for documents such as bills of lading, proof of delivery, invoices, and customs declarations. Supports a Pending → Verified/Rejected workflow with admin verification.

## Storage Layout

| Key | Type | Description | TTL |
|---|---|---|---|
| `Admin` (instance) | `Address` | Platform admin | — |
| `Counter` (persistent) | `u64` | Auto-incrementing document ID | ~1 year |
| `Document(u64)` (persistent) | `DocumentRecord` | Document record by ID | ~1 year |
| `ShipmentCount(u64)` (persistent) | `u32` | Number of documents for a shipment | ~1 year |
| `ShipmentDoc(u64, u32)` (persistent) | `u64` | Document ID at index for a shipment | ~1 year |

## Types

- **DocumentType:** `BillOfLading | ProofOfDelivery | Invoice | CustomsDeclaration | InsuranceCertificate | Photo | Other`
- **DocumentStatus:** `Pending | Verified | Rejected`
- **DocumentRecord:** `{ id, shipment_id, uploader, doc_type, content_hash, ipfs_cid, uploaded_at, status, verified_by?, verified_at?, rejection_reason? }`

## Functions

### `initialize(admin)`

One-time setup.

- **Auth:** `admin.require_auth()`
- **Errors:** `AlreadyInitialized`

### `register_document(uploader, shipment_id, doc_type, content_hash, ipfs_cid) → u64`

Register a document. Starts in `Pending` status. The IPFS CID must not be empty.

- **Auth:** `uploader.require_auth()`
- **Errors:** `InvalidInput`, `Unauthorized`
- **Example:**
  ```
  soroban contract invoke --id <CONTRACT> -- register_document --uploader GABC... --shipment_id 42 --doc_type BillOfLading --content_hash <BYTES_32> --ipfs_cid <BYTES>
  ```

### `verify_document(admin, document_id, content_hash)`

Admin verifies the on-chain hash matches the submitted hash. Moves status to `Verified`.

- **Auth:** Admin `require_auth()`
- **Errors:** `NotFound`, `NotPending`, `HashMismatch`, `Unauthorized`

### `reject_document(admin, document_id)`

Admin rejects a document. Moves status to `Rejected`.

- **Auth:** Admin `require_auth()`
- **Errors:** `NotFound`, `NotPending`, `Unauthorized`

### `transfer_admin(new_admin)`

Admin rotates to a new admin address.

- **Auth:** Current admin `require_auth()`
- **Errors:** `SameAdmin`, `Unauthorized`

### Query functions

- `get_document(document_id) → DocumentRecord`
- `list_documents_for_shipment(shipment_id, offset, limit) → Vec<DocumentRecord>` — paginated
- `get_document_count_for_shipment(shipment_id) → u32`

## Error Codes

| Name | Value | Description |
|---|---|---|
| `NotInitialized` | 1 | Admin not set |
| `AlreadyInitialized` | 2 | Init called twice |
| `NotFound` | 3 | Document ID not found |
| `Unauthorized` | 4 | Caller is not the admin |
| `NotPending` | 5 | Document is already Verified or Rejected |
| `HashMismatch` | 6 | Submitted hash doesn't match registration |
| `InvalidInput` | 7 | Empty IPFS CID or missing fields |
| `SameAdmin` | 8 | New admin is the same as current |

## Events

| Event | Topics | Data |
|---|---|---|
| `document_registered` | — | `document_id, shipment_id` |
| `document_verified` | — | `document_id` |
| `document_rejected` | — | `document_id` |
| `admin_transferred` | — | `new_admin` |
