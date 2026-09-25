use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum DocumentError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    NotFound = 3,
    Unauthorized = 4,
    AlreadyVerified = 5,
    HashMismatch = 6,
    /// `shipment_id` does not name a shipment in the shipment contract.
    ShipmentNotFound = 7,
    /// The uploader is neither the shipper nor the carrier of the shipment.
    NotShipmentParty = 8,
    Paused = 9,
    /// `flag_document` was called on a document that isn't currently verified
    /// — there is nothing to flag/reverse.
    NotVerified = 10,
    /// A string or byte field exceeds its maximum allowed length.
    ///
    /// `ipfs_cid` in `register_document` is capped at 512 bytes (a CIDv1
    /// Base58/Base32 string is at most ~100 chars; 512 is a generous ceiling
    /// that still prevents unbounded persistent-storage growth).
    /// `reason` in `flag_document` is capped at 1024 bytes, matching
    /// `cargo_description` in the shipment contract.
    FieldTooLong = 11,
}
