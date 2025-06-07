#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, String, token};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Payment(String),
    PaymentCount,
    EscrowBalance(String),
    SupportedTokens,
    ContractConfig,
}

#[derive(Clone)]
#[contracttype]
pub enum PaymentStatus {
    Created,
    Funded,
    Escrowed,
    Released,
    Refunded,
    Disputed,
}

#[derive(Clone)]
#[contracttype]
pub enum PaymentType {
    FullPayment,
    Milestone,
    COD, // Cash on Delivery
}

#[derive(Clone)]
#[contracttype]
pub struct Payment {
    pub id: String,
    pub shipment_id: String,
    pub payer: Address,
    pub payee: Address,
    pub amount: u64,
    pub token: Address,
    pub payment_type: PaymentType,
    pub status: PaymentStatus,
    pub created_at: u64,
    pub funded_at: Option<u64>,
    pub released_at: Option<u64>,
    pub dispute_deadline: u64,
    pub milestone_conditions: Option<String>,
    pub auto_release: bool,
}

#[derive(Clone)]
#[contracttype]
pub struct PaymentConfig {
    pub admin: Address,
    pub fee_percentage: u32, // Basis points
    pub dispute_period_days: u64,
    pub auto_release_enabled: bool,
}

#[contract]
pub struct PaymentContract;

#[contractimpl]
impl PaymentContract {
    /// Initialize payment contract
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        
        let config = PaymentConfig {
            admin: admin.clone(),
            fee_percentage: 250, // 2.5%
            dispute_period_days: 7,
            auto_release_enabled: true,
        };

        env.storage().instance().set(&DataKey::ContractConfig, &config);
        env.storage().instance().set(&DataKey::PaymentCount, &0u64);
        
        // Initialize supported tokens (XLM native)
        let supported_tokens = vec![Address::from_contract_id(&env, &BytesN::from_array(&env, &[0; 32]))];
        env.storage().instance().set(&DataKey::SupportedTokens, &supported_tokens);
    }

    /// Create a new payment
    pub fn create_payment(
        env: Env,
        payer: Address,
        payee: Address,
        shipment_id: String,
        amount: u64,
        token: Address,
        payment_type: PaymentType,
        auto_release: bool,
        milestone_conditions: Option<String>,
    ) -> String {
        payer.require_auth();

        let mut payment_count: u64 = env.storage().instance().get(&DataKey::PaymentCount).unwrap_or(0);
        payment_count += 1;

        let payment_id = format!("PAY{:08}", payment_count);
        let current_time = env.ledger().timestamp();
        let config: PaymentConfig = env.storage().instance().get(&DataKey::ContractConfig).unwrap();

        let payment = Payment {
            id: payment_id.clone(),
            shipment_id,
            payer,
            payee,
            amount,
            token,
            payment_type,
            status: PaymentStatus::Created,
            created_at: current_time,
            funded_at: None,
            released_at: None,
            dispute_deadline: current_time + (config.dispute_period_days * 24 * 60 * 60),
            milestone_conditions,
            auto_release,
        };

        env.storage().persistent().set(&DataKey::Payment(payment_id.clone()), &payment);
        env.storage().instance().set(&DataKey::PaymentCount, &payment_count);

        payment_id
    }

    /// Fund payment (transfer tokens to escrow)
    pub fn fund_payment(env: Env, payer: Address, payment_id: String) {
        payer.require_auth();

        let mut payment: Payment = env.storage().persistent()
            .get(&DataKey::Payment(payment_id.clone()))
            .expect("Payment not found");

        if payment.payer != payer {
            panic!("Only payer can fund payment");
        }

        if !matches!(payment.status, PaymentStatus::Created) {
            panic!("Payment already funded or processed");
        }

        // Transfer tokens to contract
        let token_client = token::Client::new(&env, &payment.token);
        token_client.transfer(&payer, &env.current_contract_address(), &(payment.amount as i128));

        payment.status = PaymentStatus::Escrowed;
        payment.funded_at = Some(env.ledger().timestamp());

        env.storage().persistent().set(&DataKey::Payment(payment_id.clone()), &payment);
        
        // Track escrow balance
        let current_balance: u64 = env.storage().persistent()
            .get(&DataKey::EscrowBalance(payment_id.clone()))
            .unwrap_or(0);
        env.storage().persistent().set(&DataKey::EscrowBalance(payment_id), &(current_balance + payment.amount));
    }

    /// Release payment to payee
    pub fn release_payment(env: Env, caller: Address, payment_id: String) {
        caller.require_auth();

        let mut payment: Payment = env.storage().persistent()
            .get(&DataKey::Payment(payment_id.clone()))
            .expect("Payment not found");

        // Check authorization
        if caller != payment.payer && caller != payment.payee {
            let config: PaymentConfig = env.storage().instance().get(&DataKey::ContractConfig).unwrap();
            if caller != config.admin {
                panic!("Unauthorized to release payment");
            }
        }

        if !matches!(payment.status, PaymentStatus::Escrowed) {
            panic!("Payment not in escrow");
        }

        // Calculate fee
        let config: PaymentConfig = env.storage().instance().get(&DataKey::ContractConfig).unwrap();
        let fee = (payment.amount * config.fee_percentage as u64) / 10000;
        let payout_amount = payment.amount - fee;

        // Transfer to payee
        let token_client = token::Client::new(&env, &payment.token);
        token_client.transfer(&env.current_contract_address(), &payment.payee, &(payout_amount as i128));

        // Transfer fee to admin
        if fee > 0 {
            token_client.transfer(&env.current_contract_address(), &config.admin, &(fee as i128));
        }

        payment.status = PaymentStatus::Released;
        payment.released_at = Some(env.ledger().timestamp());

        env.storage().persistent().set(&DataKey::Payment(payment_id.clone()), &payment);
        
        // Update escrow balance
        env.storage().persistent().remove(&DataKey::EscrowBalance(payment_id));
    }

    /// Refund payment to payer
    pub fn refund_payment(env: Env, caller: Address, payment_id: String, reason: String) {
        caller.require_auth();

        let mut payment: Payment = env.storage().persistent()
            .get(&DataKey::Payment(payment_id.clone()))
            .expect("Payment not found");

        // Check authorization
        let config: PaymentConfig = env.storage().instance().get(&DataKey::ContractConfig).unwrap();
        if caller != payment.payer && caller != config.admin {
            panic!("Unauthorized to refund payment");
        }

        if !matches!(payment.status, PaymentStatus::Escrowed) {
            panic!("Payment not in escrow");
        }

        // Transfer back to payer
        let token_client = token::Client::new(&env, &payment.token);
        token_client.transfer(&env.current_contract_address(), &payment.payer, &(payment.amount as i128));

        payment.status = PaymentStatus::Refunded;
        env.storage().persistent().set(&DataKey::Payment(payment_id.clone()), &payment);
        
        // Update escrow balance
        env.storage().persistent().remove(&DataKey::EscrowBalance(payment_id));
    }

    /// Auto-release payment after dispute period
    pub fn auto_release_payment(env: Env, payment_id: String) {
        let mut payment: Payment = env.storage().persistent()
            .get(&DataKey::Payment(payment_id.clone()))
            .expect("Payment not found");

        if !payment.auto_release {
            panic!("Auto-release not enabled for this payment");
        }

        if !matches!(payment.status, PaymentStatus::Escrowed) {
            panic!("Payment not in escrow");
        }

        if env.ledger().timestamp() < payment.dispute_deadline {
            panic!("Dispute period not yet expired");
        }

        // Auto-release to payee
        let config: PaymentConfig = env.storage().instance().get(&DataKey::ContractConfig).unwrap();
        let fee = (payment.amount * config.fee_percentage as u64) / 10000;
        let payout_amount = payment.amount - fee;

        let token_client = token::Client::new(&env, &payment.token);
        token_client.transfer(&env.current_contract_address(), &payment.payee, &(payout_amount as i128));

        if fee > 0 {
            token_client.transfer(&env.current_contract_address(), &config.admin, &(fee as i128));
        }

        payment.status = PaymentStatus::Released;
        payment.released_at = Some(env.ledger().timestamp());

        env.storage().persistent().set(&DataKey::Payment(payment_id.clone()), &payment);
        env.storage().persistent().remove(&DataKey::EscrowBalance(payment_id));
    }

    /// Get payment details
    pub fn get_payment(env: Env, payment_id: String) -> Payment {
        env.storage().persistent()
            .get(&DataKey::Payment(payment_id))
            .expect("Payment not found")
    }

    /// Get escrow balance for payment
    pub fn get_escrow_balance(env: Env, payment_id: String) -> u64 {
        env.storage().persistent()
            .get(&DataKey::EscrowBalance(payment_id))
            .unwrap_or(0)
    }

    /// Add supported token (Admin only)
    pub fn add_supported_token(env: Env, admin: Address, token: Address) {
        admin.require_auth();
        let config: PaymentConfig = env.storage().instance().get(&DataKey::ContractConfig).unwrap();
        
        if admin != config.admin {
            panic!("Admin access required");
        }

        let mut supported_tokens: Vec<Address> = env.storage().instance()
            .get(&DataKey::SupportedTokens)
            .unwrap_or(vec![]);
        
        supported_tokens.push_back(token);
        env.storage().instance().set(&DataKey::SupportedTokens, &supported_tokens);
    }

    /// Get supported tokens
    pub fn get_supported_tokens(env: Env) -> Vec<Address> {
        env.storage().instance()
            .get(&DataKey::SupportedTokens)
            .unwrap_or(vec![])
    }
}
