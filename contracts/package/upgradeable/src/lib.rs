#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, BytesN, Env};

#[contracttype]
pub enum DataKey {
    UpgradeAuthority,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ContractError {
    Unauthorized = 1,
}

#[contract]
pub struct UpgradeableContract;

#[contractimpl]
impl UpgradeableContract {
    pub fn initialize(env: Env, upgrade_authority: Address) {
        env.storage()
            .persistent()
            .set(&DataKey::UpgradeAuthority, &upgrade_authority);
    }

    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {
        let authority: Address = env
            .storage()
            .persistent()
            .get(&DataKey::UpgradeAuthority)
            .unwrap();

        authority.require_auth();

        env.deployer().update_current_contract_wasm(new_wasm_hash);
    }

    pub fn transfer_upgrade_authority(env: Env, new_authority: Address) {
        let current_authority: Address = env
            .storage()
            .persistent()
            .get(&DataKey::UpgradeAuthority)
            .unwrap();

        current_authority.require_auth();

        env.storage()
            .persistent()
            .set(&DataKey::UpgradeAuthority, &new_authority);

        env.events().publish(
            (symbol_short!("upgraded"), symbol_short!("auth")),
            new_authority,
        );
    }

    pub fn get_upgrade_authority(env: Env) -> Address {
        env.storage()
            .persistent()
            .get(&DataKey::UpgradeAuthority)
            .unwrap()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Events};

    #[test]
    fn test_initialize_and_get_upgrade_authority() {
        let env = Env::default();
        let contract_id = env.register(UpgradeableContract, ());
        let client = UpgradeableContractClient::new(&env, &contract_id);

        let authority = Address::generate(&env);
        client.initialize(&authority);

        assert_eq!(client.get_upgrade_authority(), authority);
    }

    #[test]
    fn test_transfer_upgrade_authority() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(UpgradeableContract, ());
        let client = UpgradeableContractClient::new(&env, &contract_id);

        let authority = Address::generate(&env);
        let new_authority = Address::generate(&env);

        client.initialize(&authority);
        client.transfer_upgrade_authority(&new_authority);

        assert_eq!(client.get_upgrade_authority(), new_authority);
    }

    #[test]
    #[should_panic]
    fn test_unauthorized_transfer_upgrade_authority() {
        let env = Env::default();
        let contract_id = env.register(UpgradeableContract, ());
        let client = UpgradeableContractClient::new(&env, &contract_id);

        let authority = Address::generate(&env);
        let rogue = Address::generate(&env);

        client.initialize(&authority);
        // rogue is not the authority, no mock_all_auths — should panic
        client.transfer_upgrade_authority(&rogue);
    }

    #[test]
    fn test_upgrade_authority_transfer_emits_event() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(UpgradeableContract, ());
        let client = UpgradeableContractClient::new(&env, &contract_id);

        let authority = Address::generate(&env);
        let new_authority = Address::generate(&env);

        client.initialize(&authority);
        client.transfer_upgrade_authority(&new_authority);

        let events = env.events().all();
        assert!(!events.is_empty());
    }
}
