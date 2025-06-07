#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, String, Vec, Map, BytesN};

// Data structures
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Shipment(String),
    ShipmentsByUser(Address),
    ShipmentCount,
    UserRole(Address),
    ContractConfig,
    PaymentContract,
    InsuranceContract,
    DocumentContract,
}

#[derive(Clone)]
#[contracttype]
pub enum ShipmentStatus {
    Created,
    Confirmed,
    PickedUp,
    InTransit,
    CustomsClearance,
    OutForDelivery,
    Delivered,
    Cancelled,
    Disputed,
}

#[derive(Clone)]
#[contracttype]
pub enum UserRole {
    Admin,
    Shipper,
    Carrier,
    Receiver,
    CustomsAgent,
    InsuranceAgent,
}

#[derive(Clone)]
#[contracttype]
pub enum CargoType {
    General,
    Hazardous,
    Perishable,
    Fragile,
    Oversized,
    Liquid,
    Electronics,
}

#[derive(Clone)]
#[contracttype]
pub struct Location {
    pub address: String,
    pub city: String,
    pub country: String,
    pub postal_code: String,
    pub latitude: Option<String>,
    pub longitude: Option<String>,
}

#[derive(Clone)]
#[contracttype]
pub struct CargoDetails {
    pub description: String,
    pub cargo_type: CargoType,
    pub weight_kg: u64,
    pub volume_m3: u64,
    pub value_usd: u64,
    pub hs_code: Option<String>,
    pub special_instructions: Option<String>,
}

#[derive(Clone)]
#[contracttype]
pub struct Shipment {
    pub id: String,
    pub shipper: Address,
    pub carrier: Address,
    pub receiver: Address,
    pub origin: Location,
    pub destination: Location,
    pub cargo: CargoDetails,
    pub status: ShipmentStatus,
    pub tracking_number: String,
    pub estimated_delivery: u64,
    pub actual_delivery: Option<u64>,
    pub created_at: u64,
    pub updated_at: u64,
    pub payment_id: Option<String>,
    pub insurance_id: Option<String>,
    pub documents: Vec<String>,
    pub milestones: Vec<Milestone>,
    pub requires_customs: bool,
    pub customs_cleared: bool,
}

#[derive(Clone)]
#[contracttype]
pub struct Milestone {
    pub timestamp: u64,
    pub status: ShipmentStatus,
    pub location: Option<Location>,
    pub notes: Option<String>,
    pub updated_by: Address,
}

#[derive(Clone)]
#[contracttype]
pub struct ContractConfig {
    pub admin: Address,
    pub payment_contract: Address,
    pub insurance_contract: Address,
    pub document_contract: Address,
    pub fee_percentage: u32, // Basis points (100 = 1%)
    pub max_shipment_value: u64,
    pub supported_currencies: Vec<String>,
}

#[contract]
pub struct FreightFlowContract;

#[contractimpl]
impl FreightFlowContract {
    /// Initialize the contract with configuration
    pub fn initialize(
        env: Env,
        admin: Address,
        payment_contract: Address,
        insurance_contract: Address,
        document_contract: Address,
    ) {
        admin.require_auth();
        
        let config = ContractConfig {
            admin: admin.clone(),
            payment_contract,
            insurance_contract,
            document_contract,
            fee_percentage: 250, // 2.5%
            max_shipment_value: 1_000_000_000_000u64, // $1M USD
            supported_currencies: vec![
                String::from_str(&env, "XLM"),
                String::from_str(&env, "USDC"),
                String::from_str(&env, "USD"),
            ],
        };

        env.storage().instance().set(&DataKey::ContractConfig, &config);
        env.storage().instance().set(&DataKey::UserRole(admin), &UserRole::Admin);
        env.storage().instance().set(&DataKey::ShipmentCount, &0u64);
    }

    /// Set user role (Admin only)
    pub fn set_user_role(env: Env, admin: Address, user: Address, role: UserRole) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        env.storage().instance().set(&DataKey::UserRole(user), &role);
    }

    /// Create a new shipment
    pub fn create_shipment(
        env: Env,
        shipper: Address,
        carrier: Address,
        receiver: Address,
        origin: Location,
        destination: Location,
        cargo: CargoDetails,
        estimated_delivery: u64,
        requires_customs: bool,
    ) -> String {
        shipper.require_auth();

        // Validate cargo value doesn't exceed maximum
        let config: ContractConfig = env.storage().instance().get(&DataKey::ContractConfig).unwrap();
        if cargo.value_usd > config.max_shipment_value {
            panic!("Cargo value exceeds maximum allowed");
        }

        let mut shipment_count: u64 = env.storage().instance().get(&DataKey::ShipmentCount).unwrap_or(0);
        shipment_count += 1;

        let shipment_id = format!("FF{:08}", shipment_count);
        let tracking_number = format!("TRK{}{:06}", env.ledger().timestamp() % 10000, shipment_count);
        let current_time = env.ledger().timestamp();

        let initial_milestone = Milestone {
            timestamp: current_time,
            status: ShipmentStatus::Created,
            location: Some(origin.clone()),
            notes: Some(String::from_str(&env, "Shipment created")),
            updated_by: shipper.clone(),
        };

        let shipment = Shipment {
            id: shipment_id.clone(),
            shipper: shipper.clone(),
            carrier,
            receiver,
            origin,
            destination,
            cargo,
            status: ShipmentStatus::Created,
            tracking_number,
            estimated_delivery,
            actual_delivery: None,
            created_at: current_time,
            updated_at: current_time,
            payment_id: None,
            insurance_id: None,
            documents: vec![],
            milestones: vec![initial_milestone],
            requires_customs,
            customs_cleared: false,
        };

        env.storage().persistent().set(&DataKey::Shipment(shipment_id.clone()), &shipment);
        env.storage().instance().set(&DataKey::ShipmentCount, &shipment_count);

        // Add to user's shipments
        Self::add_shipment_to_user(&env, &shipper, &shipment_id);

        shipment_id
    }

    /// Update shipment status with milestone
    pub fn update_shipment_status(
        env: Env,
        caller: Address,
        shipment_id: String,
        new_status: ShipmentStatus,
        location: Option<Location>,
        notes: Option<String>,
    ) {
        caller.require_auth();

        let mut shipment: Shipment = env.storage().persistent()
            .get(&DataKey::Shipment(shipment_id.clone()))
            .expect("Shipment not found");

        // Check authorization
        Self::require_shipment_access(&env, &caller, &shipment, &new_status);

        let current_time = env.ledger().timestamp();

        // Add milestone
        let milestone = Milestone {
            timestamp: current_time,
            status: new_status.clone(),
            location,
            notes,
            updated_by: caller,
        };

        shipment.milestones.push_back(milestone);
        shipment.status = new_status.clone();
        shipment.updated_at = current_time;

        // Set actual delivery time if delivered
        if matches!(new_status, ShipmentStatus::Delivered) {
            shipment.actual_delivery = Some(current_time);
        }

        env.storage().persistent().set(&DataKey::Shipment(shipment_id), &shipment);
    }

    /// Confirm customs clearance
    pub fn confirm_customs_clearance(
        env: Env,
        customs_agent: Address,
        shipment_id: String,
        clearance_notes: Option<String>,
    ) {
        customs_agent.require_auth();
        Self::require_role(&env, &customs_agent, &UserRole::CustomsAgent);

        let mut shipment: Shipment = env.storage().persistent()
            .get(&DataKey::Shipment(shipment_id.clone()))
            .expect("Shipment not found");

        if !shipment.requires_customs {
            panic!("Shipment does not require customs clearance");
        }

        shipment.customs_cleared = true;
        shipment.updated_at = env.ledger().timestamp();

        // Add customs milestone
        let milestone = Milestone {
            timestamp: env.ledger().timestamp(),
            status: ShipmentStatus::CustomsClearance,
            location: None,
            notes: clearance_notes,
            updated_by: customs_agent,
        };

        shipment.milestones.push_back(milestone);
        env.storage().persistent().set(&DataKey::Shipment(shipment_id), &shipment);
    }

    /// Link payment to shipment
    pub fn link_payment(env: Env, caller: Address, shipment_id: String, payment_id: String) {
        caller.require_auth();

        let mut shipment: Shipment = env.storage().persistent()
            .get(&DataKey::Shipment(shipment_id.clone()))
            .expect("Shipment not found");

        if caller != shipment.shipper {
            panic!("Only shipper can link payment");
        }

        shipment.payment_id = Some(payment_id);
        shipment.updated_at = env.ledger().timestamp();

        env.storage().persistent().set(&DataKey::Shipment(shipment_id), &shipment);
    }

    /// Link insurance to shipment
    pub fn link_insurance(env: Env, caller: Address, shipment_id: String, insurance_id: String) {
        caller.require_auth();

        let mut shipment: Shipment = env.storage().persistent()
            .get(&DataKey::Shipment(shipment_id.clone()))
            .expect("Shipment not found");

        if caller != shipment.shipper {
            panic!("Only shipper can link insurance");
        }

        shipment.insurance_id = Some(insurance_id);
        shipment.updated_at = env.ledger().timestamp();

        env.storage().persistent().set(&DataKey::Shipment(shipment_id), &shipment);
    }

    /// Add document to shipment
    pub fn add_document(env: Env, caller: Address, shipment_id: String, document_id: String) {
        caller.require_auth();

        let mut shipment: Shipment = env.storage().persistent()
            .get(&DataKey::Shipment(shipment_id.clone()))
            .expect("Shipment not found");

        // Check if caller has access to this shipment
        if caller != shipment.shipper && caller != shipment.carrier && caller != shipment.receiver {
            Self::require_role(&env, &caller, &UserRole::Admin);
        }

        shipment.documents.push_back(document_id);
        shipment.updated_at = env.ledger().timestamp();

        env.storage().persistent().set(&DataKey::Shipment(shipment_id), &shipment);
    }

    /// Get shipment details
    pub fn get_shipment(env: Env, shipment_id: String) -> Shipment {
        env.storage().persistent()
            .get(&DataKey::Shipment(shipment_id))
            .expect("Shipment not found")
    }

    /// Get shipments by user
    pub fn get_user_shipments(env: Env, user: Address) -> Vec<String> {
        env.storage().persistent()
            .get(&DataKey::ShipmentsByUser(user))
            .unwrap_or(vec![])
    }

    /// Get user role
    pub fn get_user_role(env: Env, user: Address) -> UserRole {
        env.storage().instance()
            .get(&DataKey::UserRole(user))
            .unwrap_or(UserRole::Shipper)
    }

    /// Get contract configuration
    pub fn get_config(env: Env) -> ContractConfig {
        env.storage().instance()
            .get(&DataKey::ContractConfig)
            .expect("Contract not initialized")
    }

    /// Get total shipment count
    pub fn get_shipment_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::ShipmentCount).unwrap_or(0)
    }

    /// Update contract configuration (Admin only)
    pub fn update_config(
        env: Env,
        admin: Address,
        fee_percentage: Option<u32>,
        max_shipment_value: Option<u64>,
    ) {
        admin.require_auth();
        Self::require_admin(&env, &admin);

        let mut config: ContractConfig = env.storage().instance().get(&DataKey::ContractConfig).unwrap();

        if let Some(fee) = fee_percentage {
            if fee > 1000 { // Max 10%
                panic!("Fee percentage too high");
            }
            config.fee_percentage = fee;
        }

        if let Some(max_value) = max_shipment_value {
            config.max_shipment_value = max_value;
        }

        env.storage().instance().set(&DataKey::ContractConfig, &config);
    }

    // Helper functions
    fn require_admin(env: &Env, user: &Address) {
        let role: UserRole = env.storage().instance()
            .get(&DataKey::UserRole(user.clone()))
            .unwrap_or(UserRole::Shipper);
        
        if !matches!(role, UserRole::Admin) {
            panic!("Admin access required");
        }
    }

    fn require_role(env: &Env, user: &Address, required_role: &UserRole) {
        let role: UserRole = env.storage().instance()
            .get(&DataKey::UserRole(user.clone()))
            .unwrap_or(UserRole::Shipper);
        
        if role != *required_role && !matches!(role, UserRole::Admin) {
            panic!("Insufficient permissions");
        }
    }

    fn require_shipment_access(env: &Env, caller: &Address, shipment: &Shipment, new_status: &ShipmentStatus) {
        let caller_role: UserRole = env.storage().instance()
            .get(&DataKey::UserRole(caller.clone()))
            .unwrap_or(UserRole::Shipper);

        let can_update = match caller_role {
            UserRole::Admin => true,
            UserRole::Carrier => *caller == shipment.carrier,
            UserRole::Shipper => *caller == shipment.shipper,
            UserRole::Receiver => {
                *caller == shipment.receiver && matches!(new_status, ShipmentStatus::Delivered)
            },
            UserRole::CustomsAgent => matches!(new_status, ShipmentStatus::CustomsClearance),
            _ => false,
        };

        if !can_update {
            panic!("Unauthorized to update shipment status");
        }
    }

    fn add_shipment_to_user(env: &Env, user: &Address, shipment_id: &String) {
        let mut user_shipments: Vec<String> = env.storage().persistent()
            .get(&DataKey::ShipmentsByUser(user.clone()))
            .unwrap_or(vec![]);
        
        user_shipments.push_back(shipment_id.clone());
        env.storage().persistent().set(&DataKey::ShipmentsByUser(user.clone()), &user_shipments);
    }
}
