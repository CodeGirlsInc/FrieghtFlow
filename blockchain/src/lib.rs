#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, Symbol, String, Vec, Map, Address};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Shipment(String),
    Payment(String),
    UserRole(Address),
    ShipmentCount,
    PaymentCount,
}

#[derive(Clone)]
#[contracttype]
pub enum ShipmentStatus {
    Created,
    InTransit,
    Delivered,
    Cancelled,
}

#[derive(Clone)]
#[contracttype]
pub enum PaymentStatus {
    Pending,
    Escrowed,
    Released,
    Refunded,
}

#[derive(Clone)]
#[contracttype]
pub enum UserRole {
    Admin,
    Shipper,
    Carrier,
    Receiver,
}

#[derive(Clone)]
#[contracttype]
pub struct Shipment {
    pub id: String,
    pub shipper: Address,
    pub carrier: Address,
    pub receiver: Address,
    pub origin: String,
    pub destination: String,
    pub cargo_description: String,
    pub weight: u64,
    pub value: u64,
    pub status: ShipmentStatus,
    pub created_at: u64,
    pub updated_at: u64,
    pub tracking_number: String,
}

#[derive(Clone)]
#[contracttype]
pub struct Payment {
    pub id: String,
    pub shipment_id: String,
    pub payer: Address,
    pub payee: Address,
    pub amount: u64,
    pub currency: String,
    pub status: PaymentStatus,
    pub created_at: u64,
    pub paid_at: Option<u64>,
}

#[contract]
pub struct FreightFlowContract;

#[contractimpl]
impl FreightFlowContract {
    /// Initialize the contract with admin
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::UserRole(admin.clone()), &UserRole::Admin);
        env.storage().instance().set(&DataKey::ShipmentCount, &0u64);
        env.storage().instance().set(&DataKey::PaymentCount, &0u64);
    }

    /// Set user role (Admin only)
    pub fn set_user_role(env: Env, admin: Address, user: Address, role: UserRole) {
        admin.require_auth();
        let admin_role: UserRole = env.storage().instance().get(&DataKey::UserRole(admin)).unwrap_or(UserRole::Shipper);
        
        match admin_role {
            UserRole::Admin => {
                env.storage().instance().set(&DataKey::UserRole(user), &role);
            },
            _ => panic!("Only admin can set user roles"),
        }
    }

    /// Create a new shipment
    pub fn create_shipment(
        env: Env,
        shipper: Address,
        carrier: Address,
        receiver: Address,
        origin: String,
        destination: String,
        cargo_description: String,
        weight: u64,
        value: u64,
        tracking_number: String,
    ) -> String {
        shipper.require_auth();

        let mut shipment_count: u64 = env.storage().instance().get(&DataKey::ShipmentCount).unwrap_or(0);
        shipment_count += 1;

        let shipment_id = format!("SHIP_{}", shipment_count);
        let current_time = env.ledger().timestamp();

        let shipment = Shipment {
            id: shipment_id.clone(),
            shipper: shipper.clone(),
            carrier,
            receiver,
            origin,
            destination,
            cargo_description,
            weight,
            value,
            status: ShipmentStatus::Created,
            created_at: current_time,
            updated_at: current_time,
            tracking_number,
        };

        env.storage().persistent().set(&DataKey::Shipment(shipment_id.clone()), &shipment);
        env.storage().instance().set(&DataKey::ShipmentCount, &shipment_count);

        shipment_id
    }

    /// Update shipment status
    pub fn update_shipment_status(
        env: Env,
        caller: Address,
        shipment_id: String,
        new_status: ShipmentStatus,
    ) {
        caller.require_auth();

        let mut shipment: Shipment = env.storage().persistent()
            .get(&DataKey::Shipment(shipment_id.clone()))
            .expect("Shipment not found");

        // Verify caller has permission to update
        let caller_role: UserRole = env.storage().instance()
            .get(&DataKey::UserRole(caller.clone()))
            .unwrap_or(UserRole::Shipper);

        let can_update = match caller_role {
            UserRole::Admin => true,
            UserRole::Carrier => caller == shipment.carrier,
            UserRole::Shipper => caller == shipment.shipper,
            UserRole::Receiver => caller == shipment.receiver && matches!(new_status, ShipmentStatus::Delivered),
        };

        if !can_update {
            panic!("Unauthorized to update shipment status");
        }

        shipment.status = new_status;
        shipment.updated_at = env.ledger().timestamp();

        env.storage().persistent().set(&DataKey::Shipment(shipment_id), &shipment);
    }

    /// Create payment for shipment
    pub fn create_payment(
        env: Env,
        payer: Address,
        payee: Address,
        shipment_id: String,
        amount: u64,
        currency: String,
    ) -> String {
        payer.require_auth();

        let mut payment_count: u64 = env.storage().instance().get(&DataKey::PaymentCount).unwrap_or(0);
        payment_count += 1;

        let payment_id = format!("PAY_{}", payment_count);
        let current_time = env.ledger().timestamp();

        let payment = Payment {
            id: payment_id.clone(),
            shipment_id,
            payer,
            payee,
            amount,
            currency,
            status: PaymentStatus::Pending,
            created_at: current_time,
            paid_at: None,
        };

        env.storage().persistent().set(&DataKey::Payment(payment_id.clone()), &payment);
        env.storage().instance().set(&DataKey::PaymentCount, &payment_count);

        payment_id
    }

    /// Process payment (move to escrow)
    pub fn process_payment(env: Env, payer: Address, payment_id: String) {
        payer.require_auth();

        let mut payment: Payment = env.storage().persistent()
            .get(&DataKey::Payment(payment_id.clone()))
            .expect("Payment not found");

        if payment.payer != payer {
            panic!("Only payer can process payment");
        }

        if !matches!(payment.status, PaymentStatus::Pending) {
            panic!("Payment already processed");
        }

        payment.status = PaymentStatus::Escrowed;
        payment.paid_at = Some(env.ledger().timestamp());

        env.storage().persistent().set(&DataKey::Payment(payment_id), &payment);
    }

    /// Release payment (when shipment is delivered)
    pub fn release_payment(env: Env, caller: Address, payment_id: String) {
        caller.require_auth();

        let mut payment: Payment = env.storage().persistent()
            .get(&DataKey::Payment(payment_id.clone()))
            .expect("Payment not found");

        let shipment: Shipment = env.storage().persistent()
            .get(&DataKey::Shipment(payment.shipment_id.clone()))
            .expect("Shipment not found");

        // Only allow release if shipment is delivered and caller is authorized
        let can_release = matches!(shipment.status, ShipmentStatus::Delivered) &&
            (caller == payment.payer || caller == shipment.receiver);

        if !can_release {
            panic!("Cannot release payment: shipment not delivered or unauthorized");
        }

        if !matches!(payment.status, PaymentStatus::Escrowed) {
            panic!("Payment not in escrow");
        }

        payment.status = PaymentStatus::Released;
        env.storage().persistent().set(&DataKey::Payment(payment_id), &payment);
    }

    /// Get shipment details
    pub fn get_shipment(env: Env, shipment_id: String) -> Shipment {
        env.storage().persistent()
            .get(&DataKey::Shipment(shipment_id))
            .expect("Shipment not found")
    }

    /// Get payment details
    pub fn get_payment(env: Env, payment_id: String) -> Payment {
        env.storage().persistent()
            .get(&DataKey::Payment(payment_id))
            .expect("Payment not found")
    }

    /// Get user role
    pub fn get_user_role(env: Env, user: Address) -> UserRole {
        env.storage().instance()
            .get(&DataKey::UserRole(user))
            .unwrap_or(UserRole::Shipper)
    }

    /// Get total shipment count
    pub fn get_shipment_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::ShipmentCount).unwrap_or(0)
    }

    /// Get total payment count
    pub fn get_payment_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::PaymentCount).unwrap_or(0)
    }
}
