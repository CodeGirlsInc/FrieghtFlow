#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, BytesN, Env, Symbol,
};

#[contracttype]
enum DataKey {
    Shipment(BytesN<32>),
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum ShipmentStatus {
    Created,
    Accepted,
    InTransit,
    Delivered,
    Completed,
    Disputed,
    Cancelled,
}

#[contracttype]
#[derive(Clone)]
pub struct ShipmentRecord {
    pub shipper: Address,
    pub carrier: Address,
    pub status:  ShipmentStatus,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum ContractError {
    ShipmentNotFound  = 1,
    InvalidTransition = 2,
    AlreadyExists     = 3,
}

fn emit(
    env: &Env,
    event_name: &str,
    shipment_id: &BytesN<32>,
    new_status: ShipmentStatus,
    actor: &Address,
) {
    let topic = (Symbol::new(env, event_name), shipment_id.clone());
    let payload = (shipment_id.clone(), new_status, actor.clone(), env.ledger().timestamp());
    env.events().publish(topic, payload);
}

#[contract]
pub struct ShipmentEventsContract;

#[contractimpl]
impl ShipmentEventsContract {
    pub fn create_shipment(
        env: Env,
        shipment_id: BytesN<32>,
        shipper: Address,
        carrier: Address,
    ) -> Result<(), ContractError> {
        if env.storage().persistent().has(&DataKey::Shipment(shipment_id.clone())) {
            return Err(ContractError::AlreadyExists);
        }
        let record = ShipmentRecord { shipper: shipper.clone(), carrier, status: ShipmentStatus::Created };
        env.storage().persistent().set(&DataKey::Shipment(shipment_id.clone()), &record);
        emit(&env, "ShipmentCreated", &shipment_id, ShipmentStatus::Created, &shipper);
        Ok(())
    }

    pub fn accept_shipment(
        env: Env,
        shipment_id: BytesN<32>,
        actor: Address,
    ) -> Result<(), ContractError> {
        let mut r = Self::load(&env, &shipment_id)?;
        if r.status != ShipmentStatus::Created { return Err(ContractError::InvalidTransition); }
        r.status = ShipmentStatus::Accepted;
        env.storage().persistent().set(&DataKey::Shipment(shipment_id.clone()), &r);
        emit(&env, "ShipmentAccepted", &shipment_id, ShipmentStatus::Accepted, &actor);
        Ok(())
    }

    pub fn mark_in_transit(
        env: Env,
        shipment_id: BytesN<32>,
        actor: Address,
    ) -> Result<(), ContractError> {
        let mut r = Self::load(&env, &shipment_id)?;
        if r.status != ShipmentStatus::Accepted { return Err(ContractError::InvalidTransition); }
        r.status = ShipmentStatus::InTransit;
        env.storage().persistent().set(&DataKey::Shipment(shipment_id.clone()), &r);
        emit(&env, "InTransit", &shipment_id, ShipmentStatus::InTransit, &actor);
        Ok(())
    }

    pub fn mark_delivered(
        env: Env,
        shipment_id: BytesN<32>,
        actor: Address,
    ) -> Result<(), ContractError> {
        let mut r = Self::load(&env, &shipment_id)?;
        if r.status != ShipmentStatus::InTransit { return Err(ContractError::InvalidTransition); }
        r.status = ShipmentStatus::Delivered;
        env.storage().persistent().set(&DataKey::Shipment(shipment_id.clone()), &r);
        emit(&env, "Delivered", &shipment_id, ShipmentStatus::Delivered, &actor);
        Ok(())
    }

    pub fn complete_shipment(
        env: Env,
        shipment_id: BytesN<32>,
        actor: Address,
    ) -> Result<(), ContractError> {
        let mut r = Self::load(&env, &shipment_id)?;
        if r.status != ShipmentStatus::Delivered { return Err(ContractError::InvalidTransition); }
        r.status = ShipmentStatus::Completed;
        env.storage().persistent().set(&DataKey::Shipment(shipment_id.clone()), &r);
        emit(&env, "Completed", &shipment_id, ShipmentStatus::Completed, &actor);
        Ok(())
    }

    pub fn open_dispute(
        env: Env,
        shipment_id: BytesN<32>,
        actor: Address,
    ) -> Result<(), ContractError> {
        let mut r = Self::load(&env, &shipment_id)?;
        if r.status != ShipmentStatus::Delivered && r.status != ShipmentStatus::InTransit {
            return Err(ContractError::InvalidTransition);
        }
        r.status = ShipmentStatus::Disputed;
        env.storage().persistent().set(&DataKey::Shipment(shipment_id.clone()), &r);
        emit(&env, "Disputed", &shipment_id, ShipmentStatus::Disputed, &actor);
        Ok(())
    }

    pub fn cancel_shipment(
        env: Env,
        shipment_id: BytesN<32>,
        actor: Address,
    ) -> Result<(), ContractError> {
        let mut r = Self::load(&env, &shipment_id)?;
        if r.status == ShipmentStatus::Completed || r.status == ShipmentStatus::Cancelled {
            return Err(ContractError::InvalidTransition);
        }
        r.status = ShipmentStatus::Cancelled;
        env.storage().persistent().set(&DataKey::Shipment(shipment_id.clone()), &r);
        emit(&env, "Cancelled", &shipment_id, ShipmentStatus::Cancelled, &actor);
        Ok(())
    }

    fn load(env: &Env, shipment_id: &BytesN<32>) -> Result<ShipmentRecord, ContractError> {
        env.storage()
            .persistent()
            .get(&DataKey::Shipment(shipment_id.clone()))
            .ok_or(ContractError::ShipmentNotFound)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, Events},
        Address, BytesN, Env, IntoVal, Symbol,
    };

    fn setup() -> (Env, ShipmentEventsContractClient<'static>) {
        let env    = Env::default();
        env.mock_all_auths();
        let id     = env.register(ShipmentEventsContract, ());
        let client = ShipmentEventsContractClient::new(&env, &id);
        (env, client)
    }

    fn sid(env: &Env) -> BytesN<32> { BytesN::from_array(env, &[9u8; 32]) }

    fn assert_event(env: &Env, expected_name: &str, shipment_id: &BytesN<32>) {
        let events = env.events().all();
        let found = events.iter().any(|(_, topics, _)| {
            // topics is a Vec<Val>; first topic is the Symbol
            topics.iter().any(|t| {
                t == Symbol::new(env, expected_name).into_val(env)
            })
        });
        assert!(found, "event '{}' not found in event log", expected_name);
    }

    #[test]
    fn test_create_emits_event() {
        let (env, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);
        client.create_shipment(&sid(&env), &shipper, &carrier).unwrap();
        assert_event(&env, "ShipmentCreated", &sid(&env));
    }

    #[test]
    fn test_accept_emits_event() {
        let (env, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);
        client.create_shipment(&sid(&env), &shipper, &carrier).unwrap();
        client.accept_shipment(&sid(&env), &carrier).unwrap();
        assert_event(&env, "ShipmentAccepted", &sid(&env));
    }

    #[test]
    fn test_full_happy_path_events() {
        let (env, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);
        let s = sid(&env);
        client.create_shipment(&s, &shipper, &carrier).unwrap();
        client.accept_shipment(&s, &carrier).unwrap();
        client.mark_in_transit(&s, &carrier).unwrap();
        client.mark_delivered(&s, &carrier).unwrap();
        client.complete_shipment(&s, &shipper).unwrap();

        for name in ["ShipmentCreated", "ShipmentAccepted", "InTransit", "Delivered", "Completed"] {
            assert_event(&env, name, &s);
        }
    }

    #[test]
    fn test_dispute_emits_event() {
        let (env, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);
        let s = sid(&env);
        client.create_shipment(&s, &shipper, &carrier).unwrap();
        client.accept_shipment(&s, &carrier).unwrap();
        client.mark_in_transit(&s, &carrier).unwrap();
        client.open_dispute(&s, &shipper).unwrap();
        assert_event(&env, "Disputed", &s);
    }

    #[test]
    fn test_cancel_emits_event() {
        let (env, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);
        let s = sid(&env);
        client.create_shipment(&s, &shipper, &carrier).unwrap();
        client.cancel_shipment(&s, &shipper).unwrap();
        assert_event(&env, "Cancelled", &s);
    }

    #[test]
    fn test_invalid_transition_rejected() {
        let (env, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);
        let s = sid(&env);
        client.create_shipment(&s, &shipper, &carrier).unwrap();
        // Can't go from Created → Delivered directly
        let err = client.try_mark_delivered(&s, &carrier).unwrap_err();
        assert_eq!(err.unwrap(), ContractError::InvalidTransition);
    }
}
