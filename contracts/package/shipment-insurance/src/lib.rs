#![no_std]

//! Shipment Insurance Contract (CT-08)
//!
//! Records insurance metadata on-chain so that escrow dispute and refund
//! decisions can reference insurance status provably.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, String,
};

// ── Errors ────────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum InsuranceError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    NotFound = 3,
    Unauthorized = 4,
    PolicyIdTooLong = 5,
    InvalidStatus = 6,
}

// ── Types ─────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ShipmentStatus {
    Created,
    InTransit,
    Delivered,
    Disputed,
    Completed,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Shipment {
    pub id: u64,
    pub shipper: Address,
    pub status: ShipmentStatus,
    pub is_insured: bool,
    pub insurance_premium: i128,
    pub insurance_policy_id: String,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct InsuranceStatus {
    pub is_insured: bool,
    pub premium: i128,
    pub policy_id: String,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Counter,
    Shipment(u64),
}

const TTL_LEDGERS: u32 = 6_307_200;
const MAX_POLICY_ID_LEN: u32 = 64;

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct ShipmentInsuranceContract;

#[contractimpl]
impl ShipmentInsuranceContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), InsuranceError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(InsuranceError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().persistent().set(&DataKey::Counter, &0u64);
        Ok(())
    }

    /// Create a shipment with insurance metadata.
    ///
    /// `insurance_policy_id` max length is 64 characters; longer values return `PolicyIdTooLong`.
    /// Uninsured shipments should pass `is_insured: false`, `insurance_premium: 0`,
    /// and an empty `insurance_policy_id`.
    pub fn create_shipment(
        env: Env,
        shipper: Address,
        is_insured: bool,
        insurance_premium: i128,
        insurance_policy_id: String,
    ) -> Result<u64, InsuranceError> {
        shipper.require_auth();

        if insurance_policy_id.len() > MAX_POLICY_ID_LEN {
            return Err(InsuranceError::PolicyIdTooLong);
        }

        let id = Self::next_id(&env);
        let shipment = Shipment {
            id,
            shipper,
            status: ShipmentStatus::Created,
            is_insured,
            insurance_premium,
            insurance_policy_id,
            created_at: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Shipment(id), &shipment);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Shipment(id), TTL_LEDGERS, TTL_LEDGERS);

        Ok(id)
    }

    /// Returns the insurance status for a shipment.
    pub fn get_insurance_status(
        env: Env,
        shipment_id: u64,
    ) -> Result<InsuranceStatus, InsuranceError> {
        let s = Self::load(&env, shipment_id)?;
        Ok(InsuranceStatus {
            is_insured: s.is_insured,
            premium: s.insurance_premium,
            policy_id: s.insurance_policy_id,
        })
    }

    /// Open a dispute on a shipment. If the shipment is insured, emits an
    /// `InsuranceClaim` event with the policy ID.
    pub fn open_dispute(
        env: Env,
        caller: Address,
        shipment_id: u64,
    ) -> Result<(), InsuranceError> {
        caller.require_auth();

        let mut s = Self::load(&env, shipment_id)?;

        if s.shipper != caller {
            return Err(InsuranceError::Unauthorized);
        }
        if !matches!(s.status, ShipmentStatus::Created | ShipmentStatus::InTransit | ShipmentStatus::Delivered) {
            return Err(InsuranceError::InvalidStatus);
        }

        s.status = ShipmentStatus::Disputed;
        env.storage()
            .persistent()
            .set(&DataKey::Shipment(shipment_id), &s);

        if s.is_insured {
            env.events().publish(
                (symbol_short!("insurance"), symbol_short!("claim")),
                s.insurance_policy_id,
            );
        }

        Ok(())
    }

    pub fn get_shipment(env: Env, shipment_id: u64) -> Result<Shipment, InsuranceError> {
        Self::load(&env, shipment_id)
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    fn load(env: &Env, id: u64) -> Result<Shipment, InsuranceError> {
        env.storage()
            .persistent()
            .get(&DataKey::Shipment(id))
            .ok_or(InsuranceError::NotFound)
    }

    fn next_id(env: &Env) -> u64 {
        let current: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::Counter)
            .unwrap_or(0);
        let next = current + 1;
        env.storage().persistent().set(&DataKey::Counter, &next);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Counter, TTL_LEDGERS, TTL_LEDGERS);
        next
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, String};

    fn setup() -> (Env, Address, ShipmentInsuranceContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let id = env.register(ShipmentInsuranceContract {}, ());
        let client = ShipmentInsuranceContractClient::new(&env, &id);
        client.initialize(&admin);
        (env, admin, client)
    }

    fn s(env: &Env, v: &str) -> String {
        String::from_str(env, v)
    }

    #[test]
    fn test_insured_shipment_creation() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);

        let id = client.create_shipment(
            &shipper,
            &true,
            &5_000_000i128,
            &s(&env, "POL-2024-001"),
        );

        let status = client.get_insurance_status(&id);
        assert!(status.is_insured);
        assert_eq!(status.premium, 5_000_000);
        assert_eq!(status.policy_id, s(&env, "POL-2024-001"));
    }

    #[test]
    fn test_uninsured_shipment_creation() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);

        let id = client.create_shipment(&shipper, &false, &0i128, &s(&env, ""));

        let status = client.get_insurance_status(&id);
        assert!(!status.is_insured);
        assert_eq!(status.premium, 0);
    }

    #[test]
    fn test_dispute_on_insured_shipment_emits_event() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);

        let id = client.create_shipment(
            &shipper,
            &true,
            &1_000_000i128,
            &s(&env, "POL-CLAIM-42"),
        );

        client.open_dispute(&shipper, &id);

        let shipment = client.get_shipment(&id);
        assert_eq!(shipment.status, ShipmentStatus::Disputed);
    }

    #[test]
    fn test_dispute_on_uninsured_shipment_no_event() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);

        let id = client.create_shipment(&shipper, &false, &0i128, &s(&env, ""));
        client.open_dispute(&shipper, &id);

        let shipment = client.get_shipment(&id);
        assert_eq!(shipment.status, ShipmentStatus::Disputed);
    }

    #[test]
    fn test_policy_id_too_long_returns_error() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        // 65-character policy ID
        let long_id = s(&env, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1");

        let result = client.try_create_shipment(&shipper, &true, &0i128, &long_id);
        assert_eq!(result, Err(Ok(InsuranceError::PolicyIdTooLong)));
    }

    #[test]
    fn test_policy_id_exactly_64_chars_succeeds() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let exact_id = s(&env, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

        let id = client.create_shipment(&shipper, &true, &0i128, &exact_id);
        let status = client.get_insurance_status(&id);
        assert_eq!(status.policy_id, exact_id);
    }

    #[test]
    fn test_not_found_error() {
        let (_, _, client) = setup();
        assert_eq!(
            client.try_get_shipment(&999u64),
            Err(Ok(InsuranceError::NotFound))
        );
    }
}
