#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, Address, Env, String, Vec,
};

// ── Errors ────────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ShipmentError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    NotFound = 3,
    Unauthorized = 4,
    InvalidStatus = 5,
    InvalidInput = 6,
    NotCarrier = 7,
    NotShipper = 8,
}

// ── Types ─────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ShipmentStatus {
    Created,    // Shipper posted, awaiting carrier
    Accepted,   // Carrier accepted, awaiting pickup
    InTransit,  // Carrier has picked up cargo
    Delivered,  // Carrier marked as delivered, awaiting shipper confirm
    Completed,  // Shipper confirmed delivery — triggers payment release
    Disputed,   // Either party raised a dispute
    Cancelled,  // Cancelled by shipper (only from Created or Accepted)
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Shipment {
    pub id: u64,
    pub shipper: Address,
    pub carrier: Option<Address>,
    pub origin: String,
    pub destination: String,
    pub cargo_description: String,
    pub weight_kg: u32,
    /// Price in stroops (1 XLM = 10,000,000 stroops)
    pub price: i128,
    pub status: ShipmentStatus,
    pub created_at: u64,
    pub updated_at: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Counter,
    Shipment(u64),
    ShipperList(Address),
    CarrierList(Address),
}

const TTL_LEDGERS: u32 = 6_307_200; // ~1 year at ~5 s/ledger

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct ShipmentContract;

#[contractimpl]
impl ShipmentContract {
    // ── Admin ─────────────────────────────────────────────────────────────

    /// One-time setup.
    pub fn initialize(env: Env, admin: Address) -> Result<(), ShipmentError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(ShipmentError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().persistent().set(&DataKey::Counter, &0u64);
        Ok(())
    }

    // ── Shipper actions ───────────────────────────────────────────────────

    /// Shipper creates a new shipment posting.
    pub fn create_shipment(
        env: Env,
        shipper: Address,
        origin: String,
        destination: String,
        cargo_description: String,
        weight_kg: u32,
        price: i128,
    ) -> Result<u64, ShipmentError> {
        shipper.require_auth();

        if weight_kg == 0 || price <= 0 {
            return Err(ShipmentError::InvalidInput);
        }

        let id = Self::next_id(&env);
        let now = env.ledger().timestamp();

        let shipment = Shipment {
            id,
            shipper: shipper.clone(),
            carrier: None,
            origin,
            destination,
            cargo_description,
            weight_kg,
            price,
            status: ShipmentStatus::Created,
            created_at: now,
            updated_at: now,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Shipment(id), &shipment);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Shipment(id), TTL_LEDGERS, TTL_LEDGERS);

        Self::append_to_list(&env, DataKey::ShipperList(shipper), id);

        Ok(id)
    }

    /// Shipper confirms delivery and marks shipment Completed.
    /// This is the trigger for escrow payment release.
    pub fn confirm_delivery(
        env: Env,
        shipper: Address,
        shipment_id: u64,
    ) -> Result<(), ShipmentError> {
        shipper.require_auth();

        let mut shipment = Self::load(&env, shipment_id)?;

        if shipment.shipper != shipper {
            return Err(ShipmentError::NotShipper);
        }
        if shipment.status != ShipmentStatus::Delivered {
            return Err(ShipmentError::InvalidStatus);
        }

        shipment.status = ShipmentStatus::Completed;
        shipment.updated_at = env.ledger().timestamp();
        Self::save(&env, &shipment);
        Ok(())
    }

    /// Shipper cancels — only allowed from Created or Accepted.
    pub fn cancel_shipment(
        env: Env,
        shipper: Address,
        shipment_id: u64,
    ) -> Result<(), ShipmentError> {
        shipper.require_auth();

        let mut shipment = Self::load(&env, shipment_id)?;

        if shipment.shipper != shipper {
            return Err(ShipmentError::NotShipper);
        }
        if !matches!(
            shipment.status,
            ShipmentStatus::Created | ShipmentStatus::Accepted
        ) {
            return Err(ShipmentError::InvalidStatus);
        }

        shipment.status = ShipmentStatus::Cancelled;
        shipment.updated_at = env.ledger().timestamp();
        Self::save(&env, &shipment);
        Ok(())
    }

    // ── Carrier actions ───────────────────────────────────────────────────

    /// Carrier accepts an open shipment.
    pub fn accept_shipment(
        env: Env,
        carrier: Address,
        shipment_id: u64,
    ) -> Result<(), ShipmentError> {
        carrier.require_auth();

        let mut shipment = Self::load(&env, shipment_id)?;

        if shipment.status != ShipmentStatus::Created {
            return Err(ShipmentError::InvalidStatus);
        }

        shipment.carrier = Some(carrier.clone());
        shipment.status = ShipmentStatus::Accepted;
        shipment.updated_at = env.ledger().timestamp();
        Self::save(&env, &shipment);

        Self::append_to_list(&env, DataKey::CarrierList(carrier), shipment_id);
        Ok(())
    }

    /// Carrier marks shipment as picked up and in transit.
    pub fn mark_in_transit(
        env: Env,
        carrier: Address,
        shipment_id: u64,
    ) -> Result<(), ShipmentError> {
        carrier.require_auth();

        let mut shipment = Self::load(&env, shipment_id)?;

        if shipment.status != ShipmentStatus::Accepted {
            return Err(ShipmentError::InvalidStatus);
        }
        if shipment.carrier.as_ref() != Some(&carrier) {
            return Err(ShipmentError::NotCarrier);
        }

        shipment.status = ShipmentStatus::InTransit;
        shipment.updated_at = env.ledger().timestamp();
        Self::save(&env, &shipment);
        Ok(())
    }

    /// Carrier marks cargo as delivered at destination.
    pub fn mark_delivered(
        env: Env,
        carrier: Address,
        shipment_id: u64,
    ) -> Result<(), ShipmentError> {
        carrier.require_auth();

        let mut shipment = Self::load(&env, shipment_id)?;

        if shipment.status != ShipmentStatus::InTransit {
            return Err(ShipmentError::InvalidStatus);
        }
        if shipment.carrier.as_ref() != Some(&carrier) {
            return Err(ShipmentError::NotCarrier);
        }

        shipment.status = ShipmentStatus::Delivered;
        shipment.updated_at = env.ledger().timestamp();
        Self::save(&env, &shipment);
        Ok(())
    }

    // ── Dispute ───────────────────────────────────────────────────────────

    /// Either party can raise a dispute when the shipment is InTransit or Delivered.
    pub fn raise_dispute(
        env: Env,
        caller: Address,
        shipment_id: u64,
    ) -> Result<(), ShipmentError> {
        caller.require_auth();

        let mut shipment = Self::load(&env, shipment_id)?;

        let is_party = shipment.shipper == caller
            || shipment.carrier.as_ref() == Some(&caller);

        if !is_party {
            return Err(ShipmentError::Unauthorized);
        }
        if !matches!(
            shipment.status,
            ShipmentStatus::InTransit | ShipmentStatus::Delivered
        ) {
            return Err(ShipmentError::InvalidStatus);
        }

        shipment.status = ShipmentStatus::Disputed;
        shipment.updated_at = env.ledger().timestamp();
        Self::save(&env, &shipment);
        Ok(())
    }

    /// Admin resolves a dispute: completed → pays carrier, cancelled → refunds shipper.
    pub fn resolve_dispute(
        env: Env,
        shipment_id: u64,
        resolve_as_completed: bool,
    ) -> Result<(), ShipmentError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(ShipmentError::NotInitialized)?;
        admin.require_auth();

        let mut shipment = Self::load(&env, shipment_id)?;

        if shipment.status != ShipmentStatus::Disputed {
            return Err(ShipmentError::InvalidStatus);
        }

        shipment.status = if resolve_as_completed {
            ShipmentStatus::Completed
        } else {
            ShipmentStatus::Cancelled
        };
        shipment.updated_at = env.ledger().timestamp();
        Self::save(&env, &shipment);
        Ok(())
    }

    // ── Queries ───────────────────────────────────────────────────────────

    pub fn get_shipment(env: Env, shipment_id: u64) -> Result<Shipment, ShipmentError> {
        Self::load(&env, shipment_id)
    }

    pub fn get_shipments_by_shipper(env: Env, shipper: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::ShipperList(shipper))
            .unwrap_or_else(|| Vec::new(&env))
    }

    pub fn get_shipments_by_carrier(env: Env, carrier: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::CarrierList(carrier))
            .unwrap_or_else(|| Vec::new(&env))
    }

    pub fn get_total_shipments(env: Env) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::Counter)
            .unwrap_or(0)
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    fn load(env: &Env, id: u64) -> Result<Shipment, ShipmentError> {
        env.storage()
            .persistent()
            .get(&DataKey::Shipment(id))
            .ok_or(ShipmentError::NotFound)
    }

    fn save(env: &Env, shipment: &Shipment) {
        env.storage()
            .persistent()
            .set(&DataKey::Shipment(shipment.id), shipment);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Shipment(shipment.id), TTL_LEDGERS, TTL_LEDGERS);
    }

    fn next_id(env: &Env) -> u64 {
        let current: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::Counter)
            .unwrap_or(0);
        let next = current + 1;
        env.storage()
            .persistent()
            .set(&DataKey::Counter, &next);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Counter, TTL_LEDGERS, TTL_LEDGERS);
        next
    }

    fn append_to_list(env: &Env, key: DataKey, id: u64) {
        let mut list: Vec<u64> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| Vec::new(env));
        list.push_back(id);
        env.storage().persistent().set(&key, &list);
        // Note: extend_ttl on Vec keys requires the key to be cloneable;
        // we skip it here for simplicity (lists extend with each write).
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, String};

    fn setup() -> (Env, Address, ShipmentContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let contract_id = env.register_contract(None, ShipmentContract);
        let client = ShipmentContractClient::new(&env, &contract_id);
        client.initialize(&admin);
        (env, admin, client)
    }

    fn str(env: &Env, s: &str) -> String {
        String::from_str(env, s)
    }

    fn make_shipment(
        env: &Env,
        client: &ShipmentContractClient,
        shipper: &Address,
    ) -> u64 {
        client.create_shipment(
            shipper,
            &str(env, "Lagos, Nigeria"),
            &str(env, "Nairobi, Kenya"),
            &str(env, "Electronics — 50 units"),
            &120,
            &5_000_000_000i128, // 500 XLM
        )
    }

    #[test]
    fn test_create_shipment() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);

        let id = make_shipment(&env, &client, &shipper);
        assert_eq!(id, 1);
        assert_eq!(client.get_total_shipments(), 1);

        let s = client.get_shipment(&id);
        assert_eq!(s.id, 1);
        assert_eq!(s.shipper, shipper);
        assert_eq!(s.status, ShipmentStatus::Created);
        assert!(s.carrier.is_none());
        assert_eq!(s.weight_kg, 120);
        assert_eq!(s.price, 5_000_000_000);
    }

    #[test]
    fn test_full_happy_path() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);

        // Create
        let id = make_shipment(&env, &client, &shipper);
        assert_eq!(client.get_shipment(&id).status, ShipmentStatus::Created);

        // Accept
        client.accept_shipment(&carrier, &id);
        let s = client.get_shipment(&id);
        assert_eq!(s.status, ShipmentStatus::Accepted);
        assert_eq!(s.carrier, Some(carrier.clone()));

        // In Transit
        client.mark_in_transit(&carrier, &id);
        assert_eq!(client.get_shipment(&id).status, ShipmentStatus::InTransit);

        // Delivered
        client.mark_delivered(&carrier, &id);
        assert_eq!(client.get_shipment(&id).status, ShipmentStatus::Delivered);

        // Confirm
        client.confirm_delivery(&shipper, &id);
        assert_eq!(client.get_shipment(&id).status, ShipmentStatus::Completed);
    }

    #[test]
    fn test_cancel_from_created() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);

        let id = make_shipment(&env, &client, &shipper);
        client.cancel_shipment(&shipper, &id);
        assert_eq!(client.get_shipment(&id).status, ShipmentStatus::Cancelled);
    }

    #[test]
    fn test_cancel_from_accepted() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);

        let id = make_shipment(&env, &client, &shipper);
        client.accept_shipment(&carrier, &id);
        client.cancel_shipment(&shipper, &id);
        assert_eq!(client.get_shipment(&id).status, ShipmentStatus::Cancelled);
    }

    #[test]
    fn test_cancel_in_transit_fails() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);

        let id = make_shipment(&env, &client, &shipper);
        client.accept_shipment(&carrier, &id);
        client.mark_in_transit(&carrier, &id);

        let result = client.try_cancel_shipment(&shipper, &id);
        assert_eq!(result, Err(Ok(ShipmentError::InvalidStatus)));
    }

    #[test]
    fn test_wrong_carrier_cannot_mark_in_transit() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);
        let impostor = Address::generate(&env);

        let id = make_shipment(&env, &client, &shipper);
        client.accept_shipment(&carrier, &id);

        let result = client.try_mark_in_transit(&impostor, &id);
        assert_eq!(result, Err(Ok(ShipmentError::NotCarrier)));
    }

    #[test]
    fn test_dispute_and_admin_resolve() {
        let (env, admin, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);

        let id = make_shipment(&env, &client, &shipper);
        client.accept_shipment(&carrier, &id);
        client.mark_in_transit(&carrier, &id);

        // Shipper raises dispute
        client.raise_dispute(&shipper, &id);
        assert_eq!(client.get_shipment(&id).status, ShipmentStatus::Disputed);

        // Admin resolves in carrier's favour
        client.resolve_dispute(&id, &true);
        assert_eq!(client.get_shipment(&id).status, ShipmentStatus::Completed);
    }

    #[test]
    fn test_dispute_resolved_as_cancelled() {
        let (env, _admin, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);

        let id = make_shipment(&env, &client, &shipper);
        client.accept_shipment(&carrier, &id);
        client.mark_in_transit(&carrier, &id);
        client.raise_dispute(&carrier, &id);
        client.resolve_dispute(&id, &false);
        assert_eq!(client.get_shipment(&id).status, ShipmentStatus::Cancelled);
    }

    #[test]
    fn test_shipper_carrier_lists() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);

        let id1 = make_shipment(&env, &client, &shipper);
        let id2 = make_shipment(&env, &client, &shipper);
        client.accept_shipment(&carrier, &id1);
        client.accept_shipment(&carrier, &id2);

        let by_shipper = client.get_shipments_by_shipper(&shipper);
        assert_eq!(by_shipper.len(), 2);

        let by_carrier = client.get_shipments_by_carrier(&carrier);
        assert_eq!(by_carrier.len(), 2);
    }

    #[test]
    fn test_not_found_error() {
        let (_, _, client) = setup();
        let result = client.try_get_shipment(&999);
        assert_eq!(result, Err(Ok(ShipmentError::NotFound)));
    }

    #[test]
    fn test_invalid_input_zero_weight() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);

        let result = client.try_create_shipment(
            &shipper,
            &str(&env, "A"),
            &str(&env, "B"),
            &str(&env, "cargo"),
            &0u32,
            &1_000i128,
        );
        assert_eq!(result, Err(Ok(ShipmentError::InvalidInput)));
    }
}
