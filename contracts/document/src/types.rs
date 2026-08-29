use soroban_sdk::{contracttype, Address, Bytes, BytesN};

/// ~1 year in ledgers at ~5 s/ledger.
pub const TTL_LEDGERS: u32 = 6_307_200;

/// Categories of freight documents.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DocumentType {
    BillOfLading,
    ProofOfDelivery,
    Invoice,
    CustomsDeclaration,
    InsuranceCertificate,
    Photo,
    Other,
}

/// The algorithm used to compute a document's `content_hash`.
///
/// Recorded explicitly on `DocumentRecord` rather than assumed, so a future
/// migration to a different hash function doesn't have to guess which
/// algorithm produced a given `content_hash` — it can `match` on this field.
///
/// Migration note: every `DocumentRecord` registered before this field
/// existed was hashed with SHA-256, since that was the only algorithm this
/// contract ever accepted (see `content_hash`'s original doc comment). A
/// live deployment upgrading storage from the pre-field format must backfill
/// `hash_algorithm: HashAlgorithm::Sha256` for those existing records —
/// there is nothing to backfill in this repository, since no record has
/// shipped without this field.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum HashAlgorithm {
    Sha256,
}

/// A registered document record.
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct DocumentRecord {
    pub id: u64,
    pub shipment_id: u64,
    pub uploader: Address,
    pub doc_type: DocumentType,
    /// Hash of the document content (32 bytes). See `hash_algorithm` for
    /// which algorithm produced it.
    pub content_hash: BytesN<32>,
    /// The algorithm `content_hash` was computed with.
    pub hash_algorithm: HashAlgorithm,
    /// IPFS CID encoded as raw bytes (typically 46 bytes for CIDv0 / up to 59 for CIDv1).
    pub ipfs_cid: Bytes,
    pub uploaded_at: u64,
    pub is_verified: bool,
    pub verified_by: Option<Address>,
    pub verified_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    /// Address of the shipment contract that `register_document` validates against.
    ShipmentContract,
    Counter,
    Document(u64),
    ShipmentDocs(u64), // shipment_id → Vec<u64> of doc IDs
    Paused,
}
