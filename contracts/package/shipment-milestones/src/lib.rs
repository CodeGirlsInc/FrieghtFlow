#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, Address, BytesN, Env, String, Symbol, Vec,
};

// ── Errors ────────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum MilestoneError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InvalidMilestoneType = 4,
    MilestoneLimitReached = 5,
}

// ── Types ─────────────────────────────────────────────────────────────────────

const MAX_MILESTONES: u32 = 20;

#[contracttype]
#[derive(Clone, Debug)]
pub struct Milestone {
    pub milestone_type: Symbol,
    pub notes: String,
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    /// Milestones for a shipment: shipment_id (BytesN<32>) -> Vec<Milestone>
    Milestones(BytesN<32>),
}

const TTL_LEDGERS: u32 = 6_307_200;

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct ShipmentMilestonesContract;

#[contractimpl]
impl ShipmentMilestonesContract {
    /// One-time initialization.
    pub fn initialize(env: Env, admin: Address) -> Result<(), MilestoneError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(MilestoneError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        Ok(())
    }

    /// Add a milestone to a shipment.
    /// Supported milestone_type values: CUSTOMS_CLEARED, PORT_ARRIVAL,
    /// OUT_FOR_DELIVERY, DELAY, EXCEPTION
    pub fn add_milestone(
        env: Env,
        caller: Address,
        shipment_id: BytesN<32>,
        milestone_type: Symbol,
        notes: String,
        timestamp: u64,
    ) -> Result<(), MilestoneError> {
        caller.require_auth();

        // Validate milestone type
        if !Self::is_valid_milestone_type(&env, &milestone_type) {
            return Err(MilestoneError::InvalidMilestoneType);
        }

        let key = DataKey::Milestones(shipment_id.clone());

        let mut milestones: Vec<Milestone> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| Vec::new(&env));

        if milestones.len() >= MAX_MILESTONES {
            return Err(MilestoneError::MilestoneLimitReached);
        }

        let milestone = Milestone {
            milestone_type,
            notes,
            timestamp,
        };

        milestones.push_back(milestone);

        // Sort by timestamp ascending (insertion sort — milestones are few)
        let len = milestones.len();
        for i in 1..len {
            let mut j = i;
            while j > 0 {
                let prev = milestones.get(j - 1).unwrap();
                let curr = milestones.get(j).unwrap();
                if prev.timestamp > curr.timestamp {
                    milestones.set(j - 1, curr);
                    milestones.set(j, prev);
                    j -= 1;
                } else {
                    break;
                }
            }
        }

        env.storage().persistent().set(&key, &milestones);
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);

        Ok(())
    }

    /// Get all milestones for a shipment, ordered by timestamp ascending.
    pub fn get_milestones(env: Env, shipment_id: BytesN<32>) -> Vec<Milestone> {
        let key = DataKey::Milestones(shipment_id);
        env.storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| Vec::new(&env))
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    fn is_valid_milestone_type(env: &Env, milestone_type: &Symbol) -> bool {
        let valid_types = [
            Symbol::new(env, "CUSTOMS_CLEARED"),
            Symbol::new(env, "PORT_ARRIVAL"),
            Symbol::new(env, "OUT_FOR_DELIVERY"),
            Symbol::new(env, "DELAY"),
            Symbol::new(env, "EXCEPTION"),
        ];
        for vt in valid_types.iter() {
            if milestone_type == vt {
                return true;
            }
        }
        false
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, BytesN as _},
        Env,
    };

    fn setup() -> (Env, Address, ShipmentMilestonesContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let contract_id = env.register(ShipmentMilestonesContract {}, ());
        let client = ShipmentMilestonesContractClient::new(&env, &contract_id);
        client.initialize(&admin);
        (env, admin, client)
    }

    #[test]
    fn test_add_valid_milestone() {
        let (env, _, client) = setup();
        let caller = Address::generate(&env);
        let shipment_id = BytesN::random(&env);

        client.add_milestone(
            &caller,
            &shipment_id,
            &Symbol::new(&env, "CUSTOMS_CLEARED"),
            &String::from_str(&env, "Cleared at Lagos port"),
            &1000u64,
        );

        let milestones = client.get_milestones(&shipment_id);
        assert_eq!(milestones.len(), 1);

        let m = milestones.get(0).unwrap();
        assert_eq!(m.milestone_type, Symbol::new(&env, "CUSTOMS_CLEARED"));
        assert_eq!(m.timestamp, 1000);
    }

    #[test]
    fn test_milestone_limit_reached() {
        let (env, _, client) = setup();
        let caller = Address::generate(&env);
        let shipment_id = BytesN::random(&env);

        // Add 20 milestones (the max)
        for i in 0..20u64 {
            client.add_milestone(
                &caller,
                &shipment_id,
                &Symbol::new(&env, "DELAY"),
                &String::from_str(&env, "delay note"),
                &(i + 1),
            );
        }

        // 21st should fail
        let result = client.try_add_milestone(
            &caller,
            &shipment_id,
            &Symbol::new(&env, "DELAY"),
            &String::from_str(&env, "one too many"),
            &21u64,
        );
        assert_eq!(result, Err(Ok(MilestoneError::MilestoneLimitReached)));
    }

    #[test]
    fn test_milestones_ordered_by_timestamp() {
        let (env, _, client) = setup();
        let caller = Address::generate(&env);
        let shipment_id = BytesN::random(&env);

        // Add out of order
        client.add_milestone(
            &caller,
            &shipment_id,
            &Symbol::new(&env, "PORT_ARRIVAL"),
            &String::from_str(&env, "arrived at port"),
            &3000u64,
        );
        client.add_milestone(
            &caller,
            &shipment_id,
            &Symbol::new(&env, "CUSTOMS_CLEARED"),
            &String::from_str(&env, "customs done"),
            &1000u64,
        );
        client.add_milestone(
            &caller,
            &shipment_id,
            &Symbol::new(&env, "OUT_FOR_DELIVERY"),
            &String::from_str(&env, "on the way"),
            &5000u64,
        );

        let milestones = client.get_milestones(&shipment_id);
        assert_eq!(milestones.len(), 3);
        assert_eq!(milestones.get(0).unwrap().timestamp, 1000);
        assert_eq!(milestones.get(1).unwrap().timestamp, 3000);
        assert_eq!(milestones.get(2).unwrap().timestamp, 5000);
    }

    #[test]
    fn test_invalid_milestone_type_rejected() {
        let (env, _, client) = setup();
        let caller = Address::generate(&env);
        let shipment_id = BytesN::random(&env);

        let result = client.try_add_milestone(
            &caller,
            &shipment_id,
            &Symbol::new(&env, "INVALID_TYPE"),
            &String::from_str(&env, "bad type"),
            &1000u64,
        );
        assert_eq!(result, Err(Ok(MilestoneError::InvalidMilestoneType)));
    }

    #[test]
    fn test_all_valid_milestone_types() {
        let (env, _, client) = setup();
        let caller = Address::generate(&env);
        let shipment_id = BytesN::random(&env);

        let types = [
            "CUSTOMS_CLEARED",
            "PORT_ARRIVAL",
            "OUT_FOR_DELIVERY",
            "DELAY",
            "EXCEPTION",
        ];

        for (i, t) in types.iter().enumerate() {
            client.add_milestone(
                &caller,
                &shipment_id,
                &Symbol::new(&env, t),
                &String::from_str(&env, "note"),
                &((i as u64) + 1),
            );
        }

        let milestones = client.get_milestones(&shipment_id);
        assert_eq!(milestones.len(), 5);
    }

    #[test]
    fn test_empty_milestones_returns_empty_vec() {
        let (env, _, client) = setup();
        let shipment_id = BytesN::random(&env);

        let milestones = client.get_milestones(&shipment_id);
        assert_eq!(milestones.len(), 0);
    }
}
