//! # Escrow Timeout Contract  [CT-07]
//!
//! Escrow contract with dispute auto-resolution after a configurable timeout.
//! If a dispute is not resolved by admin before `disputed_at + dispute_timeout_seconds`,
//! anyone can call `resolve_timeout` to auto-resolve it:
//!   - Shipper opened the dispute → refund to shipper
//!   - Carrier opened the dispute → release to carrier
//!
//! Admin can override with `manual_resolve` before the timeout expires.
//! A `TimeoutResolved` event is emitted on auto-resolution.

#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, Symbol,
};

// ── Errors ────────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowTimeoutError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    NotFound = 3,
    AlreadyFunded = 4,
    InvalidStatus = 5,
    Unauthorized = 6,
    InvalidAmount = 7,
    TimeoutNotReached = 8,
    AlreadyResolved = 9,
}

// ── Types ─────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowStatus {
    Pending,
    Funded,
    Released,
    Refunded,
    /// Disputed — stores who opened the dispute (shipper or carrier).
    Disputed,
}

/// Tracks which party opened the dispute so auto-resolution knows the direction.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DisputeOpener {
    None,
    Shipper,
    Carrier,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct EscrowRecord {
    pub shipment_id: u64,
    pub shipper: Address,
    pub carrier: Address,
    pub amount: i128,
    pub status: EscrowStatus,
    pub funded_at: u64,
    pub settled_at: u64,
    /// Ledger timestamp when the dispute was opened (0 if not disputed).
    pub disputed_at: u64,
    /// Which party opened the dispute.
    pub dispute_opener: DisputeOpener,
    /// Timeout in seconds; set at initialization.
    pub dispute_timeout_seconds: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    TokenContract,
    DisputeTimeout,
    Escrow(u64),
}

const TTL_LEDGERS: u32 = 6_307_200; // ~1 year
/// Default dispute timeout: 7 days in seconds.
const DEFAULT_TIMEOUT_SECONDS: u64 = 604_800;

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct EscrowTimeoutContract;

#[contractimpl]
impl EscrowTimeoutContract {
    // ── Setup ─────────────────────────────────────────────────────────────

    /// One-time initialisation.
    /// `dispute_timeout_seconds` defaults to 604800 (7 days) if 0 is passed.
    pub fn initialize(
        env: Env,
        admin: Address,
        token_contract: Address,
        dispute_timeout_seconds: u64,
    ) -> Result<(), EscrowTimeoutError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(EscrowTimeoutError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::TokenContract, &token_contract);

        let timeout = if dispute_timeout_seconds == 0 {
            DEFAULT_TIMEOUT_SECONDS
        } else {
            dispute_timeout_seconds
        };
        env.storage()
            .instance()
            .set(&DataKey::DisputeTimeout, &timeout);
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
    ) -> Result<(), EscrowTimeoutError> {
        shipper.require_auth();

        if amount <= 0 {
            return Err(EscrowTimeoutError::InvalidAmount);
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
                return Err(EscrowTimeoutError::AlreadyFunded);
            }
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .ok_or(EscrowTimeoutError::NotInitialized)?;

        let timeout: u64 = env
            .storage()
            .instance()
            .get(&DataKey::DisputeTimeout)
            .unwrap_or(DEFAULT_TIMEOUT_SECONDS);

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
            amount,
            status: EscrowStatus::Funded,
            funded_at: now,
            settled_at: 0,
            disputed_at: 0,
            dispute_opener: DisputeOpener::None,
            dispute_timeout_seconds: timeout,
        };

        Self::store(&env, &record);
        Ok(())
    }

    // ── Dispute ───────────────────────────────────────────────────────────

    /// Shipper or carrier opens a dispute.
    /// Records who opened it so auto-resolution knows the direction.
    pub fn open_dispute(
        env: Env,
        caller: Address,
        shipment_id: u64,
    ) -> Result<(), EscrowTimeoutError> {
        caller.require_auth();

        let mut record = Self::load(&env, shipment_id)?;

        if record.status != EscrowStatus::Funded {
            return Err(EscrowTimeoutError::InvalidStatus);
        }

        let opener = if caller == record.shipper {
            DisputeOpener::Shipper
        } else if caller == record.carrier {
            DisputeOpener::Carrier
        } else {
            return Err(EscrowTimeoutError::Unauthorized);
        };

        record.status = EscrowStatus::Disputed;
        record.disputed_at = env.ledger().timestamp();
        record.dispute_opener = opener;
        Self::store(&env, &record);
        Ok(())
    }

    // ── Timeout resolution ────────────────────────────────────────────────

    /// Callable by anyone once `current_time >= disputed_at + dispute_timeout_seconds`.
    ///
    /// Resolution logic:
    ///   - Shipper opened → refund to shipper
    ///   - Carrier opened → release to carrier
    ///
    /// Emits a `TimeoutResolved` event.
    pub fn resolve_timeout(env: Env, shipment_id: u64) -> Result<(), EscrowTimeoutError> {
        let mut record = Self::load(&env, shipment_id)?;

        if record.status != EscrowStatus::Disputed {
            return Err(EscrowTimeoutError::InvalidStatus);
        }

        let now = env.ledger().timestamp();
        let deadline = record
            .disputed_at
            .saturating_add(record.dispute_timeout_seconds);

        if now < deadline {
            return Err(EscrowTimeoutError::TimeoutNotReached);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .ok_or(EscrowTimeoutError::NotInitialized)?;
        let token = token::Client::new(&env, &token_addr);

        let (recipient, resolution) = match record.dispute_opener {
            DisputeOpener::Shipper => {
                // Shipper opened → refund shipper
                (record.shipper.clone(), symbol_short!("REFUNDED"))
            }
            DisputeOpener::Carrier => {
                // Carrier opened → release to carrier
                (record.carrier.clone(), symbol_short!("RELEASED"))
            }
            DisputeOpener::None => {
                // Should not happen, but default to refund
                (record.shipper.clone(), symbol_short!("REFUNDED"))
            }
        };

        token.transfer(&env.current_contract_address(), &recipient, &record.amount);

        record.status = if resolution == symbol_short!("RELEASED") {
            EscrowStatus::Released
        } else {
            EscrowStatus::Refunded
        };
        record.settled_at = now;
        Self::store(&env, &record);

        // Emit TimeoutResolved event
        env.events().publish(
            (symbol_short!("TMOUT_RES"), shipment_id),
            (shipment_id, resolution, now),
        );

        Ok(())
    }

    // ── Admin override ────────────────────────────────────────────────────

    /// Admin can manually resolve a dispute before the timeout expires.
    /// `decision`: `"RELEASE"` → funds to carrier; anything else → refund to shipper.
    pub fn manual_resolve(
        env: Env,
        shipment_id: u64,
        decision: Symbol,
    ) -> Result<(), EscrowTimeoutError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(EscrowTimeoutError::NotInitialized)?;
        admin.require_auth();

        let mut record = Self::load(&env, shipment_id)?;

        if record.status != EscrowStatus::Disputed {
            return Err(EscrowTimeoutError::InvalidStatus);
        }

        let token_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .unwrap();
        let token = token::Client::new(&env, &token_addr);

        let release = decision == symbol_short!("RELEASE");
        let recipient = if release {
            record.carrier.clone()
        } else {
            record.shipper.clone()
        };

        token.transfer(&env.current_contract_address(), &recipient, &record.amount);

        record.status = if release {
            EscrowStatus::Released
        } else {
            EscrowStatus::Refunded
        };
        record.settled_at = env.ledger().timestamp();
        Self::store(&env, &record);
        Ok(())
    }

    // ── Queries ───────────────────────────────────────────────────────────

    pub fn get_escrow(env: Env, shipment_id: u64) -> Result<EscrowRecord, EscrowTimeoutError> {
        Self::load(&env, shipment_id)
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    fn load(env: &Env, shipment_id: u64) -> Result<EscrowRecord, EscrowTimeoutError> {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(shipment_id))
            .ok_or(EscrowTimeoutError::NotFound)
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

    const AMOUNT: i128 = 1_000_000_000;
    const SHIPMENT_ID: u64 = 1;
    const TIMEOUT: u64 = 3600; // 1 hour for tests

    fn create_token(env: &Env, admin: &Address, recipient: &Address, amount: i128) -> Address {
        let token_address = env
            .register_stellar_asset_contract_v2(admin.clone())
            .address();
        StellarAssetClient::new(env, &token_address).mint(recipient, &amount);
        token_address
    }

    fn setup() -> (
        Env,
        Address, // admin
        Address, // shipper
        Address, // carrier
        Address, // token
        EscrowTimeoutContractClient<'static>,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);
        let token_addr = create_token(&env, &admin, &shipper, AMOUNT);

        let contract_id = env.register(EscrowTimeoutContract {}, ());
        let client = EscrowTimeoutContractClient::new(&env, &contract_id);
        client.initialize(&admin, &token_addr, &TIMEOUT);

        (env, admin, shipper, carrier, token_addr, client)
    }

    fn fund_escrow(
        env: &Env,
        token_addr: &Address,
        client: &EscrowTimeoutContractClient,
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

    // ── resolve_timeout before timeout → TimeoutNotReached ────────────────

    #[test]
    fn test_resolve_before_timeout_fails() {
        let (env, _admin, shipper, carrier, token_addr, client) = setup();
        fund_escrow(&env, &token_addr, &client, &shipper, &carrier);
        client.open_dispute(&shipper, &SHIPMENT_ID);

        // Time has not advanced past the timeout
        let result = client.try_resolve_timeout(&SHIPMENT_ID);
        assert_eq!(result, Err(Ok(EscrowTimeoutError::TimeoutNotReached)));
    }

    // ── resolve_timeout after timeout (shipper opened → refund) ──────────

    #[test]
    fn test_resolve_after_timeout_shipper_opened_refunds() {
        let (env, _admin, shipper, carrier, token_addr, client) = setup();
        fund_escrow(&env, &token_addr, &client, &shipper, &carrier);
        client.open_dispute(&shipper, &SHIPMENT_ID);

        // Advance ledger time past the timeout
        env.ledger().with_mut(|li| {
            li.timestamp += TIMEOUT + 1;
        });

        client.resolve_timeout(&SHIPMENT_ID);

        let record = client.get_escrow(&SHIPMENT_ID);
        assert_eq!(record.status, EscrowStatus::Refunded);

        let token = TokenClient::new(&env, &token_addr);
        assert_eq!(token.balance(&shipper), AMOUNT);
        assert_eq!(token.balance(&client.address), 0);
    }

    // ── resolve_timeout after timeout (carrier opened → release) ─────────

    #[test]
    fn test_resolve_after_timeout_carrier_opened_releases() {
        let (env, _admin, shipper, carrier, token_addr, client) = setup();
        fund_escrow(&env, &token_addr, &client, &shipper, &carrier);
        client.open_dispute(&carrier, &SHIPMENT_ID);

        env.ledger().with_mut(|li| {
            li.timestamp += TIMEOUT + 1;
        });

        client.resolve_timeout(&SHIPMENT_ID);

        let record = client.get_escrow(&SHIPMENT_ID);
        assert_eq!(record.status, EscrowStatus::Released);

        let token = TokenClient::new(&env, &token_addr);
        assert_eq!(token.balance(&carrier), AMOUNT);
    }

    // ── admin override before timeout ─────────────────────────────────────

    #[test]
    fn test_admin_override_before_timeout() {
        let (env, _admin, shipper, carrier, token_addr, client) = setup();
        fund_escrow(&env, &token_addr, &client, &shipper, &carrier);
        client.open_dispute(&shipper, &SHIPMENT_ID);

        // Admin resolves before timeout — should succeed
        client.manual_resolve(&SHIPMENT_ID, &symbol_short!("RELEASE"));

        let record = client.get_escrow(&SHIPMENT_ID);
        assert_eq!(record.status, EscrowStatus::Released);

        let token = TokenClient::new(&env, &token_addr);
        assert_eq!(token.balance(&carrier), AMOUNT);
    }

    // ── resolve_timeout on non-disputed escrow → InvalidStatus ───────────

    #[test]
    fn test_resolve_timeout_non_disputed_fails() {
        let (env, _admin, shipper, carrier, token_addr, client) = setup();
        fund_escrow(&env, &token_addr, &client, &shipper, &carrier);

        // Not disputed — should fail
        let result = client.try_resolve_timeout(&SHIPMENT_ID);
        assert_eq!(result, Err(Ok(EscrowTimeoutError::InvalidStatus)));
    }

    // ── third party cannot open dispute ───────────────────────────────────

    #[test]
    fn test_third_party_cannot_open_dispute() {
        let (env, _admin, shipper, carrier, token_addr, client) = setup();
        fund_escrow(&env, &token_addr, &client, &shipper, &carrier);

        let stranger = Address::generate(&env);
        let result = client.try_open_dispute(&stranger, &SHIPMENT_ID);
        assert_eq!(result, Err(Ok(EscrowTimeoutError::Unauthorized)));
    }
}
