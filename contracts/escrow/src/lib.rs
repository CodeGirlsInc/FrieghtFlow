#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, token, Address, Env};

// ── Errors ────────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    NotFound = 3,
    AlreadyFunded = 4,
    NotFunded = 5,
    InvalidStatus = 6,
    Unauthorized = 7,
    InvalidAmount = 8,
    InsufficientBalance = 9,
}

// ── Types ─────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowStatus {
    /// Escrow record created, waiting for shipper to deposit funds.
    Pending,
    /// Funds are held in the contract.
    Funded,
    /// Payment released to carrier — shipment completed.
    Released,
    /// Funds returned to shipper — shipment cancelled.
    Refunded,
    /// In dispute — awaiting admin resolution.
    Disputed,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct EscrowRecord {
    pub shipment_id: u64,
    pub shipper: Address,
    pub carrier: Address,
    /// Amount of tokens held (in the token's base unit, e.g. stroops for XLM).
    pub amount: i128,
    pub status: EscrowStatus,
    pub funded_at: u64,
    pub settled_at: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    TokenContract,
    Escrow(u64), // shipment_id → EscrowRecord
}

const TTL_LEDGERS: u32 = 6_307_200; // ~1 year

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    // ── Setup ─────────────────────────────────────────────────────────────

    /// One-time initialisation.  `token_contract` is the SEP-41 token address
    /// (e.g. the Stellar native-XLM wrapper contract on Soroban).
    pub fn initialize(
        env: Env,
        admin: Address,
        token_contract: Address,
    ) -> Result<(), EscrowError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(EscrowError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::TokenContract, &token_contract);
        Ok(())
    }

    // ── Shipper actions ───────────────────────────────────────────────────

    /// Shipper locks funds for a shipment.
    ///
    /// **Pre-condition:** the shipper must have called `approve` on the token
    /// contract, granting this escrow contract an allowance ≥ `amount`.
    ///
    /// The contract pulls the tokens from `shipper` via `transfer_from`.
    pub fn fund_escrow(
        env: Env,
        shipper: Address,
        carrier: Address,
        shipment_id: u64,
        amount: i128,
    ) -> Result<(), EscrowError> {
        shipper.require_auth();

        if amount <= 0 {
            return Err(EscrowError::InvalidAmount);
        }

        // Ensure no double-funding for the same shipment.
        if env
            .storage()
            .persistent()
            .has(&DataKey::Escrow(shipment_id))
        {
            let existing: EscrowRecord = env
                .storage()
                .persistent()
                .get(&DataKey::Escrow(shipment_id))
                .unwrap();
            if existing.status == EscrowStatus::Funded {
                return Err(EscrowError::AlreadyFunded);
            }
        }

        // Pull tokens from shipper into this contract.
        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .ok_or(EscrowError::NotInitialized)?;

        let token = token::Client::new(&env, &token_addr);
        // transfer_from: spender=this_contract, from=shipper, to=this_contract, amount
        token.transfer_from(
            &env.current_contract_address(),
            &shipper,
            &env.current_contract_address(),
            &amount,
        );

        let now = env.ledger().timestamp();
        let record = EscrowRecord {
            shipment_id,
            shipper,
            carrier,
            amount,
            status: EscrowStatus::Funded,
            funded_at: now,
            settled_at: 0,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(shipment_id), &record);
        env.storage().persistent().extend_ttl(
            &DataKey::Escrow(shipment_id),
            TTL_LEDGERS,
            TTL_LEDGERS,
        );

        Ok(())
    }

    // ── Settlement ────────────────────────────────────────────────────────

    /// Release locked funds to the carrier.
    /// Called when a shipment is Completed (shipper confirmed delivery).
    /// In production this would be called by an authorized shipment contract;
    /// for now admin can also trigger it after off-chain verification.
    pub fn release_payment(env: Env, shipment_id: u64) -> Result<(), EscrowError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(EscrowError::NotInitialized)?;
        admin.require_auth();

        let mut record = Self::load(&env, shipment_id)?;

        if record.status != EscrowStatus::Funded {
            return Err(EscrowError::InvalidStatus);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .unwrap();
        let token = token::Client::new(&env, &token_addr);
        token.transfer(
            &env.current_contract_address(),
            &record.carrier,
            &record.amount,
        );

        record.status = EscrowStatus::Released;
        record.settled_at = env.ledger().timestamp();
        Self::store(&env, &record);
        Ok(())
    }

    /// Refund locked funds back to the shipper.
    /// Called when a shipment is Cancelled.
    pub fn refund_payment(env: Env, shipment_id: u64) -> Result<(), EscrowError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(EscrowError::NotInitialized)?;
        admin.require_auth();

        let mut record = Self::load(&env, shipment_id)?;

        if record.status != EscrowStatus::Funded {
            return Err(EscrowError::InvalidStatus);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .unwrap();
        let token = token::Client::new(&env, &token_addr);
        token.transfer(
            &env.current_contract_address(),
            &record.shipper,
            &record.amount,
        );

        record.status = EscrowStatus::Refunded;
        record.settled_at = env.ledger().timestamp();
        Self::store(&env, &record);
        Ok(())
    }

    /// Raise a dispute for the escrow (mirrors the shipment dispute).
    /// Either party can call this; admin then resolves via release or refund.
    pub fn raise_dispute(env: Env, caller: Address, shipment_id: u64) -> Result<(), EscrowError> {
        caller.require_auth();

        let mut record = Self::load(&env, shipment_id)?;

        let is_party = record.shipper == caller || record.carrier == caller;
        if !is_party {
            return Err(EscrowError::Unauthorized);
        }
        if record.status != EscrowStatus::Funded {
            return Err(EscrowError::InvalidStatus);
        }

        record.status = EscrowStatus::Disputed;
        Self::store(&env, &record);
        Ok(())
    }

    /// Admin resolves a disputed escrow.
    /// `release_to_carrier = true` → funds go to carrier.
    /// `release_to_carrier = false` → funds returned to shipper.
    pub fn resolve_dispute(
        env: Env,
        shipment_id: u64,
        release_to_carrier: bool,
    ) -> Result<(), EscrowError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(EscrowError::NotInitialized)?;
        admin.require_auth();

        let mut record = Self::load(&env, shipment_id)?;

        if record.status != EscrowStatus::Disputed {
            return Err(EscrowError::InvalidStatus);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .unwrap();
        let token = token::Client::new(&env, &token_addr);

        let recipient = if release_to_carrier {
            record.carrier.clone()
        } else {
            record.shipper.clone()
        };

        token.transfer(&env.current_contract_address(), &recipient, &record.amount);

        record.status = if release_to_carrier {
            EscrowStatus::Released
        } else {
            EscrowStatus::Refunded
        };
        record.settled_at = env.ledger().timestamp();
        Self::store(&env, &record);
        Ok(())
    }

    // ── Queries ───────────────────────────────────────────────────────────

    pub fn get_escrow(env: Env, shipment_id: u64) -> Result<EscrowRecord, EscrowError> {
        Self::load(&env, shipment_id)
    }

    pub fn get_balance(env: Env) -> i128 {
        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .unwrap_or_else(|| panic!());
        let token = token::Client::new(&env, &token_addr);
        token.balance(&env.current_contract_address())
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    fn load(env: &Env, shipment_id: u64) -> Result<EscrowRecord, EscrowError> {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(shipment_id))
            .ok_or(EscrowError::NotFound)
    }

    fn store(env: &Env, record: &EscrowRecord) {
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(record.shipment_id), record);
        env.storage().persistent().extend_ttl(
            &DataKey::Escrow(record.shipment_id),
            TTL_LEDGERS,
            TTL_LEDGERS,
        );
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{
        testutils::Address as _,
        token::{Client as TokenClient, StellarAssetClient},
        Env,
    };

    /// Deploy a test SAC token, mint `amount` to `recipient`, return token address.
    fn create_token(env: &Env, admin: &Address, recipient: &Address, amount: i128) -> Address {
        let token_address = env
            .register_stellar_asset_contract_v2(admin.clone())
            .address();
        let sac = StellarAssetClient::new(env, &token_address);
        sac.mint(recipient, &amount);
        token_address
    }

    fn setup(
        shipper_balance: i128,
    ) -> (
        Env,
        Address, // admin
        Address, // shipper
        Address, // carrier
        Address, // token
        EscrowContractClient<'static>,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);

        let token_addr = create_token(&env, &admin, &shipper, shipper_balance);

        let contract_id = env.register(EscrowContract {}, ());
        let client = EscrowContractClient::new(&env, &contract_id);
        client.initialize(&admin, &token_addr);

        (env, admin, shipper, carrier, token_addr, client)
    }

    const AMOUNT: i128 = 500_000_000; // 50 XLM in stroops (7 decimals)
    const SHIPMENT_ID: u64 = 42;

    fn fund(client: &EscrowContractClient, shipper: &Address, carrier: &Address) {
        client.fund_escrow(shipper, carrier, &SHIPMENT_ID, &AMOUNT);
    }

    #[test]
    fn test_fund_and_release() {
        let (env, _admin, shipper, carrier, token_addr, client) = setup(AMOUNT);

        fund(&client, &shipper, &carrier);

        let record = client.get_escrow(&SHIPMENT_ID);
        assert_eq!(record.status, EscrowStatus::Funded);
        assert_eq!(record.amount, AMOUNT);

        // Check contract holds the tokens
        let token = TokenClient::new(&env, &token_addr);
        assert_eq!(token.balance(&client.address), AMOUNT);

        // Release to carrier
        client.release_payment(&SHIPMENT_ID);

        let record = client.get_escrow(&SHIPMENT_ID);
        assert_eq!(record.status, EscrowStatus::Released);
        assert_eq!(token.balance(&carrier), AMOUNT);
        assert_eq!(token.balance(&client.address), 0);
    }

    #[test]
    fn test_fund_and_refund() {
        let (env, _admin, shipper, carrier, token_addr, client) = setup(AMOUNT);

        fund(&client, &shipper, &carrier);

        client.refund_payment(&SHIPMENT_ID);

        let record = client.get_escrow(&SHIPMENT_ID);
        assert_eq!(record.status, EscrowStatus::Refunded);

        let token = TokenClient::new(&env, &token_addr);
        assert_eq!(token.balance(&shipper), AMOUNT);
    }

    #[test]
    fn test_dispute_resolved_to_carrier() {
        let (env, _admin, shipper, carrier, token_addr, client) = setup(AMOUNT);

        fund(&client, &shipper, &carrier);
        client.raise_dispute(&shipper, &SHIPMENT_ID);

        let record = client.get_escrow(&SHIPMENT_ID);
        assert_eq!(record.status, EscrowStatus::Disputed);

        client.resolve_dispute(&SHIPMENT_ID, &true);
        let token = TokenClient::new(&env, &token_addr);
        assert_eq!(token.balance(&carrier), AMOUNT);
    }

    #[test]
    fn test_dispute_resolved_to_shipper() {
        let (env, _admin, shipper, carrier, token_addr, client) = setup(AMOUNT);

        fund(&client, &shipper, &carrier);
        client.raise_dispute(&carrier, &SHIPMENT_ID);
        client.resolve_dispute(&SHIPMENT_ID, &false);

        let token = TokenClient::new(&env, &token_addr);
        assert_eq!(token.balance(&shipper), AMOUNT);
    }

    #[test]
    fn test_double_fund_fails() {
        let (_, _, shipper, carrier, _, client) = setup(AMOUNT * 2);

        fund(&client, &shipper, &carrier);
        let result = client.try_fund_escrow(&shipper, &carrier, &SHIPMENT_ID, &AMOUNT);
        assert_eq!(result, Err(Ok(EscrowError::AlreadyFunded)));
    }

    #[test]
    fn test_release_unfunded_fails() {
        let (_, _, _, _, _, client) = setup(AMOUNT);

        let result = client.try_release_payment(&SHIPMENT_ID);
        assert_eq!(result, Err(Ok(EscrowError::NotFound)));
    }

    #[test]
    fn test_invalid_amount_fails() {
        let (_, _, shipper, carrier, _, client) = setup(AMOUNT);

        let result = client.try_fund_escrow(&shipper, &carrier, &SHIPMENT_ID, &0i128);
        assert_eq!(result, Err(Ok(EscrowError::InvalidAmount)));
    }

    #[test]
    fn test_unauthorized_dispute_fails() {
        let (env, _, shipper, carrier, _, client) = setup(AMOUNT);

        fund(&client, &shipper, &carrier);
        let random = Address::generate(&env);
        let result = client.try_raise_dispute(&random, &SHIPMENT_ID);
        assert_eq!(result, Err(Ok(EscrowError::Unauthorized)));
    }
}
