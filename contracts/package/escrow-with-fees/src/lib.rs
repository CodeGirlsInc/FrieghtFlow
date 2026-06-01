//! # Escrow With Fees Contract  [CT-11]
//!
//! Fee-aware escrow that deducts a configurable platform fee (in basis points)
//! from the release amount and routes it to a treasury address.
//!
//! ## Fee mechanics
//! - Fee is deducted on `release_funds`, NOT on `fund_escrow`
//! - Full refunds on cancellation return the full funded amount — no fee on refunds
//! - `platform_fee_bps` is updatable by admin; an `FeeUpdated` event is emitted
//! - `release_funds` emits a `ReleaseWithFee` event: `{ carrier_amount, fee_amount, treasury }`
//!
//! ## Basis points
//! 100 bps = 1%, 250 bps = 2.5%, 10000 bps = 100%

#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env,
};

// ── Errors ────────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowFeeError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    NotFound = 3,
    AlreadyFunded = 4,
    InvalidStatus = 5,
    Unauthorized = 6,
    InvalidAmount = 7,
    InvalidFeeBps = 8,
}

// ── Types ─────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowStatus {
    Pending,
    Funded,
    Released,
    Refunded,
    Disputed,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct EscrowRecord {
    pub shipment_id: u64,
    pub shipper: Address,
    pub carrier: Address,
    /// Amount deposited by the shipper (gross, before fee deduction).
    pub funded_amount: i128,
    pub status: EscrowStatus,
    pub funded_at: u64,
    pub settled_at: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    TokenContract,
    PlatformTreasury,
    PlatformFeeBps,
    Escrow(u64),
}

const TTL_LEDGERS: u32 = 6_307_200; // ~1 year
/// Maximum fee: 100% = 10 000 bps (sanity cap)
const MAX_FEE_BPS: u32 = 10_000;

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct EscrowWithFeesContract;

#[contractimpl]
impl EscrowWithFeesContract {
    // ── Setup ─────────────────────────────────────────────────────────────

    /// One-time initialisation.
    /// `platform_fee_bps`: e.g. 250 = 2.5%.  Must be ≤ 10 000.
    pub fn initialize(
        env: Env,
        admin: Address,
        token_contract: Address,
        platform_treasury: Address,
        platform_fee_bps: u32,
    ) -> Result<(), EscrowFeeError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(EscrowFeeError::AlreadyInitialized);
        }
        if platform_fee_bps > MAX_FEE_BPS {
            return Err(EscrowFeeError::InvalidFeeBps);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::TokenContract, &token_contract);
        env.storage()
            .instance()
            .set(&DataKey::PlatformTreasury, &platform_treasury);
        env.storage()
            .instance()
            .set(&DataKey::PlatformFeeBps, &platform_fee_bps);
        Ok(())
    }

    // ── Admin: update fee ─────────────────────────────────────────────────

    /// Admin-only: update the platform fee in basis points.
    /// Emits a `FeeUpdated` event.
    pub fn update_fee_bps(env: Env, new_fee_bps: u32) -> Result<(), EscrowFeeError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(EscrowFeeError::NotInitialized)?;
        admin.require_auth();

        if new_fee_bps > MAX_FEE_BPS {
            return Err(EscrowFeeError::InvalidFeeBps);
        }

        let old_fee: u32 = env
            .storage()
            .instance()
            .get(&DataKey::PlatformFeeBps)
            .unwrap_or(0);

        env.storage()
            .instance()
            .set(&DataKey::PlatformFeeBps, &new_fee_bps);

        env.events().publish(
            (symbol_short!("FeeUpdated"),),
            (old_fee, new_fee_bps),
        );

        Ok(())
    }

    // ── Shipper actions ───────────────────────────────────────────────────

    /// Shipper locks funds for a shipment.
    /// Requires prior `approve` on the token contract for this contract address.
    pub fn fund_escrow(
        env: Env,
        shipper: Address,
        carrier: Address,
        shipment_id: u64,
        amount: i128,
    ) -> Result<(), EscrowFeeError> {
        shipper.require_auth();

        if amount <= 0 {
            return Err(EscrowFeeError::InvalidAmount);
        }

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
                return Err(EscrowFeeError::AlreadyFunded);
            }
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .ok_or(EscrowFeeError::NotInitialized)?;

        let token = token::Client::new(&env, &token_addr);
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
            funded_amount: amount,
            status: EscrowStatus::Funded,
            funded_at: now,
            settled_at: 0,
        };

        Self::store(&env, &record);
        Ok(())
    }

    // ── Settlement ────────────────────────────────────────────────────────

    /// Release funds to carrier, deducting the platform fee.
    ///
    /// - Carrier receives `funded_amount - fee`
    /// - Treasury receives `fee`
    /// - Emits `ReleaseWithFee { carrier_amount, fee_amount, treasury_address }`
    ///
    /// Only the shipper (or admin) can call this.
    pub fn release_funds(env: Env, caller: Address, shipment_id: u64) -> Result<(), EscrowFeeError> {
        caller.require_auth();

        let mut record = Self::load(&env, shipment_id)?;

        // Only shipper or admin may release
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(EscrowFeeError::NotInitialized)?;

        if caller != record.shipper && caller != admin {
            return Err(EscrowFeeError::Unauthorized);
        }

        if record.status != EscrowStatus::Funded {
            return Err(EscrowFeeError::InvalidStatus);
        }

        let fee_bps: u32 = env
            .storage()
            .instance()
            .get(&DataKey::PlatformFeeBps)
            .unwrap_or(0);

        let treasury: Address = env
            .storage()
            .instance()
            .get(&DataKey::PlatformTreasury)
            .ok_or(EscrowFeeError::NotInitialized)?;

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .unwrap();
        let token = token::Client::new(&env, &token_addr);

        // fee = funded_amount * fee_bps / 10_000  (integer division, rounds down)
        let fee_amount: i128 = (record.funded_amount * fee_bps as i128) / 10_000;
        let carrier_amount: i128 = record.funded_amount - fee_amount;

        // Transfer carrier's share
        token.transfer(
            &env.current_contract_address(),
            &record.carrier,
            &carrier_amount,
        );

        // Transfer fee to treasury (only if fee > 0)
        if fee_amount > 0 {
            token.transfer(
                &env.current_contract_address(),
                &treasury,
                &fee_amount,
            );
        }

        record.status = EscrowStatus::Released;
        record.settled_at = env.ledger().timestamp();
        Self::store(&env, &record);

        // Emit ReleaseWithFee event
        env.events().publish(
            (symbol_short!("RelWithFee"), shipment_id),
            (carrier_amount, fee_amount, treasury),
        );

        Ok(())
    }

    /// Refund full funded amount to shipper on cancellation — no fee deducted.
    pub fn refund(env: Env, shipment_id: u64) -> Result<(), EscrowFeeError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(EscrowFeeError::NotInitialized)?;
        admin.require_auth();

        let mut record = Self::load(&env, shipment_id)?;

        if record.status != EscrowStatus::Funded {
            return Err(EscrowFeeError::InvalidStatus);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .unwrap();
        let token = token::Client::new(&env, &token_addr);

        // Full refund — no fee
        token.transfer(
            &env.current_contract_address(),
            &record.shipper,
            &record.funded_amount,
        );

        record.status = EscrowStatus::Refunded;
        record.settled_at = env.ledger().timestamp();
        Self::store(&env, &record);
        Ok(())
    }

    /// Raise a dispute (shipper or carrier only).
    pub fn open_dispute(
        env: Env,
        caller: Address,
        shipment_id: u64,
    ) -> Result<(), EscrowFeeError> {
        caller.require_auth();

        let mut record = Self::load(&env, shipment_id)?;

        if caller != record.shipper && caller != record.carrier {
            return Err(EscrowFeeError::Unauthorized);
        }
        if record.status != EscrowStatus::Funded {
            return Err(EscrowFeeError::InvalidStatus);
        }

        record.status = EscrowStatus::Disputed;
        Self::store(&env, &record);
        Ok(())
    }

    /// Admin resolves a disputed escrow.
    /// `release_to_carrier = true` → fee-deducted release to carrier.
    /// `release_to_carrier = false` → full refund to shipper (no fee).
    pub fn admin_resolve(
        env: Env,
        shipment_id: u64,
        release_to_carrier: bool,
    ) -> Result<(), EscrowFeeError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(EscrowFeeError::NotInitialized)?;
        admin.require_auth();

        let mut record = Self::load(&env, shipment_id)?;

        if record.status != EscrowStatus::Disputed {
            return Err(EscrowFeeError::InvalidStatus);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .unwrap();
        let token = token::Client::new(&env, &token_addr);

        if release_to_carrier {
            let fee_bps: u32 = env
                .storage()
                .instance()
                .get(&DataKey::PlatformFeeBps)
                .unwrap_or(0);
            let treasury: Address = env
                .storage()
                .instance()
                .get(&DataKey::PlatformTreasury)
                .ok_or(EscrowFeeError::NotInitialized)?;

            let fee_amount: i128 = (record.funded_amount * fee_bps as i128) / 10_000;
            let carrier_amount: i128 = record.funded_amount - fee_amount;

            token.transfer(
                &env.current_contract_address(),
                &record.carrier,
                &carrier_amount,
            );
            if fee_amount > 0 {
                token.transfer(
                    &env.current_contract_address(),
                    &treasury,
                    &fee_amount,
                );
            }
            record.status = EscrowStatus::Released;
        } else {
            // Full refund — no fee
            token.transfer(
                &env.current_contract_address(),
                &record.shipper,
                &record.funded_amount,
            );
            record.status = EscrowStatus::Refunded;
        }

        record.settled_at = env.ledger().timestamp();
        Self::store(&env, &record);
        Ok(())
    }

    // ── Queries ───────────────────────────────────────────────────────────

    pub fn get_escrow(env: Env, shipment_id: u64) -> Result<EscrowRecord, EscrowFeeError> {
        Self::load(&env, shipment_id)
    }

    pub fn get_fee_bps(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::PlatformFeeBps)
            .unwrap_or(0)
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    fn load(env: &Env, shipment_id: u64) -> Result<EscrowRecord, EscrowFeeError> {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(shipment_id))
            .ok_or(EscrowFeeError::NotFound)
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

    const AMOUNT: i128 = 10_000_000; // 10 units (7 decimals)
    const SHIPMENT_ID: u64 = 1;

    fn create_token(env: &Env, admin: &Address, recipient: &Address, amount: i128) -> Address {
        let token_address = env
            .register_stellar_asset_contract_v2(admin.clone())
            .address();
        StellarAssetClient::new(env, &token_address).mint(recipient, &amount);
        token_address
    }

    fn setup(
        fee_bps: u32,
    ) -> (
        Env,
        Address, // admin
        Address, // shipper
        Address, // carrier
        Address, // treasury
        Address, // token
        EscrowWithFeesContractClient<'static>,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);
        let treasury = Address::generate(&env);
        let token_addr = create_token(&env, &admin, &shipper, AMOUNT);

        let contract_id = env.register(EscrowWithFeesContract {}, ());
        let client = EscrowWithFeesContractClient::new(&env, &contract_id);
        client.initialize(&admin, &token_addr, &treasury, &fee_bps);

        (env, admin, shipper, carrier, treasury, token_addr, client)
    }

    fn fund(
        env: &Env,
        token_addr: &Address,
        client: &EscrowWithFeesContractClient,
        shipper: &Address,
        carrier: &Address,
    ) {
        let token = TokenClient::new(env, token_addr);
        token.approve(
            shipper,
            &client.address,
            &AMOUNT,
            &(env.ledger().sequence() + 1000),
        );
        client.fund_escrow(shipper, carrier, &SHIPMENT_ID, &AMOUNT);
    }

    // ── 1% fee (100 bps) ──────────────────────────────────────────────────

    #[test]
    fn test_release_with_1_percent_fee() {
        let (env, _admin, shipper, carrier, treasury, token_addr, client) = setup(100);
        fund(&env, &token_addr, &client, &shipper, &carrier);

        client.release_funds(&shipper, &SHIPMENT_ID);

        let token = TokenClient::new(&env, &token_addr);
        // fee = 10_000_000 * 100 / 10_000 = 100_000
        let expected_fee: i128 = 100_000;
        let expected_carrier: i128 = AMOUNT - expected_fee;

        assert_eq!(token.balance(&carrier), expected_carrier);
        assert_eq!(token.balance(&treasury), expected_fee);
        assert_eq!(token.balance(&client.address), 0);
    }

    // ── 2.5% fee (250 bps) ────────────────────────────────────────────────

    #[test]
    fn test_release_with_2_5_percent_fee() {
        let (env, _admin, shipper, carrier, treasury, token_addr, client) = setup(250);
        fund(&env, &token_addr, &client, &shipper, &carrier);

        client.release_funds(&shipper, &SHIPMENT_ID);

        let token = TokenClient::new(&env, &token_addr);
        // fee = 10_000_000 * 250 / 10_000 = 250_000
        let expected_fee: i128 = 250_000;
        let expected_carrier: i128 = AMOUNT - expected_fee;

        assert_eq!(token.balance(&carrier), expected_carrier);
        assert_eq!(token.balance(&treasury), expected_fee);
    }

    // ── 0% fee (0 bps) ────────────────────────────────────────────────────

    #[test]
    fn test_release_with_zero_fee() {
        let (env, _admin, shipper, carrier, treasury, token_addr, client) = setup(0);
        fund(&env, &token_addr, &client, &shipper, &carrier);

        client.release_funds(&shipper, &SHIPMENT_ID);

        let token = TokenClient::new(&env, &token_addr);
        assert_eq!(token.balance(&carrier), AMOUNT);
        assert_eq!(token.balance(&treasury), 0);
    }

    // ── Full refund on cancellation — no fee ──────────────────────────────

    #[test]
    fn test_refund_returns_full_amount_no_fee() {
        let (env, _admin, shipper, carrier, treasury, token_addr, client) = setup(250);
        fund(&env, &token_addr, &client, &shipper, &carrier);

        client.refund(&SHIPMENT_ID);

        let token = TokenClient::new(&env, &token_addr);
        // Shipper gets full amount back
        assert_eq!(token.balance(&shipper), AMOUNT);
        // Treasury gets nothing
        assert_eq!(token.balance(&treasury), 0);
        assert_eq!(token.balance(&client.address), 0);
    }

    // ── Non-shipper cannot release ────────────────────────────────────────

    #[test]
    fn test_non_shipper_cannot_release() {
        let (env, _admin, shipper, carrier, _treasury, token_addr, client) = setup(100);
        fund(&env, &token_addr, &client, &shipper, &carrier);

        let stranger = Address::generate(&env);
        let result = client.try_release_funds(&stranger, &SHIPMENT_ID);
        assert_eq!(result, Err(Ok(EscrowFeeError::Unauthorized)));
    }

    // ── ReleaseWithFee event emitted ──────────────────────────────────────

    #[test]
    fn test_release_emits_event() {
        let (env, _admin, shipper, carrier, _treasury, token_addr, client) = setup(100);
        fund(&env, &token_addr, &client, &shipper, &carrier);

        client.release_funds(&shipper, &SHIPMENT_ID);

        // Verify the escrow record is Released
        let record = client.get_escrow(&SHIPMENT_ID);
        assert_eq!(record.status, EscrowStatus::Released);
    }

    // ── Fee update by admin ───────────────────────────────────────────────

    #[test]
    fn test_admin_can_update_fee() {
        let (env, _admin, shipper, carrier, treasury, token_addr, client) = setup(100);

        // Update fee to 500 bps (5%)
        client.update_fee_bps(&500u32);
        assert_eq!(client.get_fee_bps(), 500);

        fund(&env, &token_addr, &client, &shipper, &carrier);
        client.release_funds(&shipper, &SHIPMENT_ID);

        let token = TokenClient::new(&env, &token_addr);
        // fee = 10_000_000 * 500 / 10_000 = 500_000
        assert_eq!(token.balance(&treasury), 500_000);
        assert_eq!(token.balance(&carrier), AMOUNT - 500_000);
    }

    // ── admin_resolve with fee ────────────────────────────────────────────

    #[test]
    fn test_admin_resolve_release_deducts_fee() {
        let (env, _admin, shipper, carrier, treasury, token_addr, client) = setup(250);
        fund(&env, &token_addr, &client, &shipper, &carrier);
        client.open_dispute(&shipper, &SHIPMENT_ID);

        client.admin_resolve(&SHIPMENT_ID, &true);

        let token = TokenClient::new(&env, &token_addr);
        let expected_fee: i128 = 250_000;
        assert_eq!(token.balance(&carrier), AMOUNT - expected_fee);
        assert_eq!(token.balance(&treasury), expected_fee);
    }

    // ── admin_resolve refund — no fee ─────────────────────────────────────

    #[test]
    fn test_admin_resolve_refund_no_fee() {
        let (env, _admin, shipper, carrier, treasury, token_addr, client) = setup(250);
        fund(&env, &token_addr, &client, &shipper, &carrier);
        client.open_dispute(&carrier, &SHIPMENT_ID);

        client.admin_resolve(&SHIPMENT_ID, &false);

        let token = TokenClient::new(&env, &token_addr);
        assert_eq!(token.balance(&shipper), AMOUNT);
        assert_eq!(token.balance(&treasury), 0);
    }
}
