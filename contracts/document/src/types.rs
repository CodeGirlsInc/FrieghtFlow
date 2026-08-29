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

/// A registered document record.
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct DocumentRecord {
    pub id: u64,
    pub shipment_id: u64,
    pub uploader: Address,
    pub doc_type: DocumentType,
    /// SHA-256 hash of the document content (32 bytes).
    pub content_hash: BytesN<32>,
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
