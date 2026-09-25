use soroban_sdk::{contracttype, Address};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowStatus {
    /// Declared for a potential future two-step create-then-fund flow.
    ///
    /// **Currently unused:** `funding::fund` is the only place an
    /// `EscrowRecord` is ever constructed, and it sets `status: Funded`
    /// immediately — there is no `create_escrow` entrypoint that would
    /// produce a `Pending` record. This variant is retained for ABI
    /// stability (removing it would change the on-chain encoding of the
    /// enum) but must not be matched as a valid live state anywhere in
    /// the contract logic until a two-step flow is intentionally added.
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
    /// shipment_id → the fee (in base units) that was retained by the
    /// platform the last time this escrow was settled as a partial refund.
    ///
    /// Held under its own key rather than as a field on [`EscrowRecord`]
    /// for the same reason `EscrowStatus::Pending` is retained unused:
    /// adding a field to `EscrowRecord` would change the on-chain encoding
    /// of the value returned by `get_escrow` and of every event payload,
    /// breaking already-deployed clients for no gain. `DataKey` is never
    /// part of the ABI, so a new variant here is free.
    EscrowFee(u64),
    Paused,
}
