use soroban_sdk::{contracttype, Address};

/// ~1 year in ledgers at ~5 s/ledger.
pub const TTL_LEDGERS: u32 = 6_307_200;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowStatus {
    /// Escrow record created, waiting for shipper to deposit funds.
    Pending,
    /// Funds are held in the contract.
    Funded,
    /// Payment released to carrier — shipment completed.
    Released,
    /// Funds returned to shipper — shipment cancelled.
    Refunded,
    /// In dispute — awaiting admin resolution.
    Disputed,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct EscrowRecord {
    pub shipment_id: u64,
    pub shipper: Address,
    pub carrier: Address,
    /// Amount of tokens held (in the token's base unit, e.g. stroops for XLM).
    pub amount: i128,
    pub status: EscrowStatus,
    pub funded_at: u64,
    pub settled_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    TokenContract,
    ShipmentContract,
    Escrow(u64), // shipment_id → EscrowRecord
    Paused,
}
