#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    symbol_short, Address, BytesN, Env, Symbol,
};

#[contracttype]
enum DataKey {
    Admin,
    Paused,
    Escrow(BytesN<32>),
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum EscrowStatus {
    Funded,
    Released,
    Refunded,
    Disputed,
}

#[contracttype]
#[derive(Clone)]
pub struct EscrowRecord {
    pub depositor: Address,
    pub amount:    i128,
    pub status:    EscrowStatus,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum ContractError {
    Unauthorized       = 1,
    ContractPaused     = 2,
    EscrowNotFound     = 3,
    AlreadyFunded      = 4,
    InvalidState       = 5,
    AlreadyInitialized = 6,
}

#[contract]
pub struct EscrowPausableContract;

#[contractimpl]
impl EscrowPausableContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), ContractError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(ContractError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Paused, &false);
        Ok(())
    }

    pub fn pause(env: Env, caller: Address) -> Result<(), ContractError> {
        Self::require_admin(&env, &caller)?;
        env.storage().instance().set(&DataKey::Paused, &true);
        let now = env.ledger().timestamp();
        env.events().publish(
            (Symbol::new(&env, "ContractPaused"), caller.clone()),
            (caller, now),
        );
        Ok(())
    }

    pub fn unpause(env: Env, caller: Address) -> Result<(), ContractError> {
        Self::require_admin(&env, &caller)?;
        env.storage().instance().set(&DataKey::Paused, &false);
        Ok(())
    }

    pub fn is_paused(env: Env) -> bool {
        env.storage()
            .instance()
            .get(&DataKey::Paused)
            .unwrap_or(false)
    }

    /// Deposit funds — blocked when paused.
    pub fn fund_escrow(
        env: Env,
        escrow_id: BytesN<32>,
        depositor: Address,
        amount: i128,
    ) -> Result<(), ContractError> {
        Self::require_not_paused(&env)?;

        if env.storage().persistent().has(&DataKey::Escrow(escrow_id.clone())) {
            return Err(ContractError::AlreadyFunded);
        }

        let record = EscrowRecord { depositor, amount, status: EscrowStatus::Funded };
        env.storage().persistent().set(&DataKey::Escrow(escrow_id), &record);
        Ok(())
    }

    /// Open a dispute — blocked when paused.
    pub fn open_dispute(
        env: Env,
        escrow_id: BytesN<32>,
    ) -> Result<(), ContractError> {
        Self::require_not_paused(&env)?;
        let mut record = Self::get_escrow_record(&env, &escrow_id)?;
        if record.status != EscrowStatus::Funded {
            return Err(ContractError::InvalidState);
        }
        record.status = EscrowStatus::Disputed;
        env.storage().persistent().set(&DataKey::Escrow(escrow_id), &record);
        Ok(())
    }

    /// Release funds to recipient — works even when paused.
    pub fn release_funds(
        env: Env,
        caller: Address,
        escrow_id: BytesN<32>,
        _recipient: Address,
    ) -> Result<i128, ContractError> {
        Self::require_admin(&env, &caller)?;
        let mut record = Self::get_escrow_record(&env, &escrow_id)?;
        if record.status != EscrowStatus::Funded && record.status != EscrowStatus::Disputed {
            return Err(ContractError::InvalidState);
        }
        let amount = record.amount;
        record.status = EscrowStatus::Released;
        env.storage().persistent().set(&DataKey::Escrow(escrow_id), &record);
        Ok(amount)
    }

    /// Refund to depositor — works even when paused.
    pub fn refund(
        env: Env,
        caller: Address,
        escrow_id: BytesN<32>,
    ) -> Result<i128, ContractError> {
        Self::require_admin(&env, &caller)?;
        let mut record = Self::get_escrow_record(&env, &escrow_id)?;
        if record.status != EscrowStatus::Funded && record.status != EscrowStatus::Disputed {
            return Err(ContractError::InvalidState);
        }
        let amount = record.amount;
        record.status = EscrowStatus::Refunded;
        env.storage().persistent().set(&DataKey::Escrow(escrow_id), &record);
        Ok(amount)
    }

    fn require_admin(env: &Env, caller: &Address) -> Result<(), ContractError> {
        caller.require_auth();
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(ContractError::Unauthorized)?;
        if *caller != admin {
            return Err(ContractError::Unauthorized);
        }
        Ok(())
    }

    fn require_not_paused(env: &Env) -> Result<(), ContractError> {
        if env.storage().instance().get(&DataKey::Paused).unwrap_or(false) {
            return Err(ContractError::ContractPaused);
        }
        Ok(())
    }

    fn get_escrow_record(env: &Env, escrow_id: &BytesN<32>) -> Result<EscrowRecord, ContractError> {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id.clone()))
            .ok_or(ContractError::EscrowNotFound)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, BytesN, Env};

    fn setup() -> (Env, EscrowPausableContractClient<'static>, Address) {
        let env   = Env::default();
        env.mock_all_auths();
        let id     = env.register(EscrowPausableContract, ());
        let client = EscrowPausableContractClient::new(&env, &id);
        let admin  = Address::generate(&env);
        client.initialize(&admin).unwrap();
        (env, client, admin)
    }

    fn escrow_id(env: &Env) -> BytesN<32> { BytesN::from_array(env, &[2u8; 32]) }

    #[test]
    fn test_fund_fails_when_paused() {
        let (env, client, admin) = setup();
        client.pause(&admin).unwrap();
        let depositor = Address::generate(&env);
        let err = client.try_fund_escrow(&escrow_id(&env), &depositor, &1000).unwrap_err();
        assert_eq!(err.unwrap(), ContractError::ContractPaused);
    }

    #[test]
    fn test_dispute_fails_when_paused() {
        let (env, client, admin) = setup();
        let depositor = Address::generate(&env);
        client.fund_escrow(&escrow_id(&env), &depositor, &1000).unwrap();
        client.pause(&admin).unwrap();
        let err = client.try_open_dispute(&escrow_id(&env)).unwrap_err();
        assert_eq!(err.unwrap(), ContractError::ContractPaused);
    }

    #[test]
    fn test_release_succeeds_when_paused() {
        let (env, client, admin) = setup();
        let depositor  = Address::generate(&env);
        let recipient  = Address::generate(&env);
        client.fund_escrow(&escrow_id(&env), &depositor, &1000).unwrap();
        client.pause(&admin).unwrap();
        let amount = client.release_funds(&admin, &escrow_id(&env), &recipient).unwrap();
        assert_eq!(amount, 1000);
    }

    #[test]
    fn test_refund_succeeds_when_paused() {
        let (env, client, admin) = setup();
        let depositor = Address::generate(&env);
        client.fund_escrow(&escrow_id(&env), &depositor, &500).unwrap();
        client.pause(&admin).unwrap();
        let amount = client.refund(&admin, &escrow_id(&env)).unwrap();
        assert_eq!(amount, 500);
    }

    #[test]
    fn test_non_admin_pause_unauthorized() {
        let (env, client, _admin) = setup();
        let rogue = Address::generate(&env);
        let err = client.try_pause(&rogue).unwrap_err();
        assert_eq!(err.unwrap(), ContractError::Unauthorized);
    }

    #[test]
    fn test_is_paused_reflects_state() {
        let (env, client, admin) = setup();
        assert!(!client.is_paused());
        client.pause(&admin).unwrap();
        assert!(client.is_paused());
        client.unpause(&admin).unwrap();
        assert!(!client.is_paused());
    }
}
