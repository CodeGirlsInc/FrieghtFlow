#![no_std]

mod types;
mod error;

use soroban_sdk::{contract, contractimpl, Address, BytesN, Env, String};

use types::*;
use error::*;

#[contract]
pub struct EscrowPaymentContract;

#[contractimpl]
impl EscrowPaymentContract {
    // -------------------------
    // INIT
    // -------------------------
    pub fn initialize(env: Env, admin: Address, arbitrator: Address) {
        admin.require_auth();

        env.storage().persistent().set(&DataKey::Admin, &admin);
        env.storage().persistent().set(&DataKey::Arbitrator, &arbitrator);
        env.storage().persistent().set(&DataKey::Counter, &0u64);
    }

    fn ensure_init(env: &Env) {
        if !env.storage().persistent().has(&DataKey::Admin) {
            fail(env, EscrowError::NotInitialized)
        }
    }

    // -------------------------
    // CREATE ESCROW
    // -------------------------
    pub fn create_escrow(
        env: Env,
        shipment_id: BytesN<32>,
        payee: Address,
        amount: i128,
    ) -> u64 {
        Self::ensure_init(&env);

        let payer = env.invoker();
        payer.require_auth();

        if amount <= 0 {
            fail(&env, EscrowError::InvalidAmount);
        }

        if env.storage().persistent().has(&DataKey::ShipmentEscrow(shipment_id.clone())) {
            fail(&env, EscrowError::EscrowExists);
        }

        let mut counter: u64 = env.storage().persistent().get(&DataKey::Counter).unwrap();
        counter += 1;

        let now = env.ledger().timestamp();
        let deadline = now + 7 * 24 * 60 * 60;

        let escrow = EscrowPayment {
            payment_id: counter,
            shipment_id: shipment_id.clone(),
            payer: payer.clone(),
            payee: payee.clone(),
            amount,
            status: PaymentStatus::Locked,
            created_at: now,
            released_at: None,
            dispute_deadline: deadline,
        };

        env.storage().persistent().set(&DataKey::Payment(counter), &escrow);
        env.storage().persistent().set(&DataKey::ShipmentEscrow(shipment_id), &true);
        env.storage().persistent().set(&DataKey::Counter, &counter);

        env.events().publish(
            ("EscrowCreated",),
            (counter, escrow.amount, payer, payee),
        );

        counter
    }

    // -------------------------
    // RELEASE
    // -------------------------
    pub fn release_payment(env: Env, payment_id: u64) {
        Self::ensure_init(&env);

        let mut escrow: EscrowPayment =
            env.storage().persistent().get(&DataKey::Payment(payment_id))
            .unwrap_or_else(|| fail(&env, EscrowError::PaymentNotFound));

        escrow.payer.require_auth();

        if escrow.status != PaymentStatus::Locked {
            fail(&env, EscrowError::InvalidStatus);
        }

        escrow.status = PaymentStatus::Released;
        escrow.released_at = Some(env.ledger().timestamp());

        env.storage().persistent().set(&DataKey::Payment(payment_id), &escrow);

        env.events().publish(
            ("PaymentReleased",),
            (payment_id, escrow.amount, escrow.payee),
        );
    }

    // -------------------------
    // REFUND
    // -------------------------
    pub fn refund_payment(env: Env, payment_id: u64) {
        Self::ensure_init(&env);

        let mut escrow: EscrowPayment =
            env.storage().persistent().get(&DataKey::Payment(payment_id))
            .unwrap_or_else(|| fail(&env, EscrowError::PaymentNotFound));

        escrow.payer.require_auth();

        if escrow.status != PaymentStatus::Locked {
            fail(&env, EscrowError::InvalidStatus);
        }

        escrow.status = PaymentStatus::Refunded;

        env.storage().persistent().set(&DataKey::Payment(payment_id), &escrow);

        env.events().publish(
            ("PaymentRefunded",),
            (payment_id, escrow.amount, escrow.payer),
        );
    }

    // -------------------------
    // DISPUTE
    // -------------------------
    pub fn initiate_dispute(env: Env, payment_id: u64, reason: String) {
        Self::ensure_init(&env);

        let mut escrow: EscrowPayment =
            env.storage().persistent().get(&DataKey::Payment(payment_id))
            .unwrap_or_else(|| fail(&env, EscrowError::PaymentNotFound));

        let caller = env.invoker();
        caller.require_auth();

        if caller != escrow.payer && caller != escrow.payee {
            fail(&env, EscrowError::Unauthorized);
        }

        if env.ledger().timestamp() > escrow.dispute_deadline {
            fail(&env, EscrowError::DisputeWindowExpired);
        }

        escrow.status = PaymentStatus::Disputed;
        env.storage().persistent().set(&DataKey::Payment(payment_id), &escrow);

        env.events().publish(("DisputeInitiated",), (payment_id, caller, reason));
    }

    // -------------------------
    // RESOLVE
    // -------------------------
    pub fn resolve_dispute(env: Env, payment_id: u64, release_to_carrier: bool) {
        Self::ensure_init(&env);

        let arbitrator: Address = env.storage().persistent().get(&DataKey::Arbitrator).unwrap();
        arbitrator.require_auth();

        let mut escrow: EscrowPayment =
            env.storage().persistent().get(&DataKey::Payment(payment_id))
            .unwrap_or_else(|| fail(&env, EscrowError::PaymentNotFound));

        if escrow.status != PaymentStatus::Disputed {
            fail(&env, EscrowError::InvalidStatus);
        }

        escrow.status = if release_to_carrier {
            PaymentStatus::Released
        } else {
            PaymentStatus::Refunded
        };

        env.storage().persistent().set(&DataKey::Payment(payment_id), &escrow);

        env.events().publish(
            ("DisputeResolved",),
            (payment_id, release_to_carrier),
        );
    }

    // -------------------------
    // GET
    // -------------------------
    pub fn get_payment(env: Env, payment_id: u64) -> EscrowPayment {
        env.storage()
            .persistent()
            .get(&DataKey::Payment(payment_id))
            .unwrap_or_else(|| fail(&env, EscrowError::PaymentNotFound))
    }
}
