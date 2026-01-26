#![no_std]

use soroban_sdk::{contracttype, Address, BytesN, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PaymentStatus {
    Pending,
    Locked,
    Released,
    Refunded,
    Disputed,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct EscrowPayment {
    pub payment_id: u64,
    pub shipment_id: BytesN<32>,
    pub payer: Address,
    pub payee: Address,
    pub amount: i128,
    pub status: PaymentStatus,
    pub created_at: u64,
    pub released_at: Option<u64>,
    pub dispute_deadline: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Arbitrator,
    Counter,
    Payment(u64),
    ShipmentEscrow(BytesN<32>),
}
