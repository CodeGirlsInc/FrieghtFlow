#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, BytesN, Env, Symbol,
};

mod shipment_interface {
    use soroban_sdk::{contractclient, BytesN, Env};
    #[contractclient(name = "ShipmentClient")]
    pub trait ShipmentTrait {
        fn get_status(env: Env, shipment_id: BytesN<32>) -> Symbol;
    }
}

mod escrow_interface {
    use soroban_sdk::{contractclient, BytesN, Env};
    #[contractclient(name = "EscrowClient")]
    pub trait EscrowTrait {
        fn get_status(env: Env, escrow_id: BytesN<32>) -> Symbol;
        fn release(env: Env, escrow_id: BytesN<32>);
    }
}

use escrow_interface::EscrowClient;
use shipment_interface::ShipmentClient;

#[contracttype]
enum DataKey {
    ShipmentContract,
    EscrowContract,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum ValidationError {
    ShipmentNotDelivered = 1,
    EscrowNotFunded      = 2,
    NotInitialized       = 3,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum ReleaseResult {
    Released,
    Blocked(ValidationError),
}


#[contract]
pub struct CrossContractValidator;

#[contractimpl]
impl CrossContractValidator {
    pub fn initialize(
        env: Env,
        shipment_contract: Address,
        escrow_contract: Address,
    ) {
        env.storage().instance().set(&DataKey::ShipmentContract, &shipment_contract);
        env.storage().instance().set(&DataKey::EscrowContract,   &escrow_contract);
    }

    /// Atomically validates shipment delivery and escrow funding before releasing.
    /// Returns `ReleaseResult::Blocked(reason)` if either check fails.
    pub fn validate_and_release(
        env: Env,
        shipment_id: BytesN<32>,
        escrow_id: BytesN<32>,
    ) -> ReleaseResult {
        let shipment_addr: Address = match env
            .storage()
            .instance()
            .get(&DataKey::ShipmentContract)
        {
            Some(a) => a,
            None => return ReleaseResult::Blocked(ValidationError::NotInitialized),
        };

        let escrow_addr: Address = match env
            .storage()
            .instance()
            .get(&DataKey::EscrowContract)
        {
            Some(a) => a,
            None => return ReleaseResult::Blocked(ValidationError::NotInitialized),
        };

        // 1. Check shipment status
        let shipment_status =
            ShipmentClient::new(&env, &shipment_addr).get_status(&shipment_id);
        if shipment_status != Symbol::new(&env, "DELIVERED") {
            return ReleaseResult::Blocked(ValidationError::ShipmentNotDelivered);
        }

        // 2. Check escrow status
        let escrow_status =
            EscrowClient::new(&env, &escrow_addr).get_status(&escrow_id);
        if escrow_status != Symbol::new(&env, "FUNDED") {
            return ReleaseResult::Blocked(ValidationError::EscrowNotFunded);
        }

        // 3. Both checks passed — release
        EscrowClient::new(&env, &escrow_addr).release(&escrow_id);

        ReleaseResult::Released
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{contract, contractimpl, testutils::Address as _, BytesN, Env, Symbol};

    #[contract]
    struct MockShipment;
    #[contractimpl]
    impl MockShipment {
        pub fn get_status(_env: Env, _id: BytesN<32>) -> Symbol {
            Symbol::new(&_env, "DELIVERED")
        }
    }

    #[contract]
    struct MockShipmentNotDelivered;
    #[contractimpl]
    impl MockShipmentNotDelivered {
        pub fn get_status(_env: Env, _id: BytesN<32>) -> Symbol {
            Symbol::new(&_env, "IN_TRANSIT")
        }
    }

    #[contract]
    struct MockEscrow;
    #[contractimpl]
    impl MockEscrow {
        pub fn get_status(_env: Env, _id: BytesN<32>) -> Symbol {
            Symbol::new(&_env, "FUNDED")
        }
        pub fn release(_env: Env, _id: BytesN<32>) {}
    }

    #[contract]
    struct MockEscrowNotFunded;
    #[contractimpl]
    impl MockEscrowNotFunded {
        pub fn get_status(_env: Env, _id: BytesN<32>) -> Symbol {
            Symbol::new(&_env, "RELEASED")
        }
        pub fn release(_env: Env, _id: BytesN<32>) {}
    }

    fn ids(env: &Env) -> (BytesN<32>, BytesN<32>) {
        (BytesN::from_array(env, &[1u8; 32]), BytesN::from_array(env, &[2u8; 32]))
    }

    #[test]
    fn test_happy_path_releases() {
        let env = Env::default();
        env.mock_all_auths();

        let shipment_id = env.register(MockShipment, ());
        let escrow_id   = env.register(MockEscrow, ());
        let validator_id = env.register(CrossContractValidator, ());
        let client = CrossContractValidatorClient::new(&env, &validator_id);

        client.initialize(&shipment_id, &escrow_id);
        let (sid, eid) = ids(&env);
        assert_eq!(client.validate_and_release(&sid, &eid), ReleaseResult::Released);
    }

    #[test]
    fn test_shipment_not_delivered_blocked() {
        let env = Env::default();
        env.mock_all_auths();

        let shipment_id  = env.register(MockShipmentNotDelivered, ());
        let escrow_id    = env.register(MockEscrow, ());
        let validator_id = env.register(CrossContractValidator, ());
        let client = CrossContractValidatorClient::new(&env, &validator_id);

        client.initialize(&shipment_id, &escrow_id);
        let (sid, eid) = ids(&env);
        assert_eq!(
            client.validate_and_release(&sid, &eid),
            ReleaseResult::Blocked(ValidationError::ShipmentNotDelivered)
        );
    }

    #[test]
    fn test_escrow_not_funded_blocked() {
        let env = Env::default();
        env.mock_all_auths();

        let shipment_id  = env.register(MockShipment, ());
        let escrow_id    = env.register(MockEscrowNotFunded, ());
        let validator_id = env.register(CrossContractValidator, ());
        let client = CrossContractValidatorClient::new(&env, &validator_id);

        client.initialize(&shipment_id, &escrow_id);
        let (sid, eid) = ids(&env);
        assert_eq!(
            client.validate_and_release(&sid, &eid),
            ReleaseResult::Blocked(ValidationError::EscrowNotFunded)
        );
    }
}
