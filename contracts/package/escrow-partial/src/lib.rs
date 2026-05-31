#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env, Symbol};

// ── Errors ────────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PartialEscrowError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    NotFound = 3,
    Unauthorized = 4,
    InsufficientFunds = 5,
    InvalidAmount = 6,
    AlreadyRefunded = 7,
}

// ── Types ─────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PartialEscrowStatus {
    Active,
    FullyReleased,
    Refunded,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct PartialEscrowRecord {
    pub escrow_id: u64,
    pub shipper: Address,
    pub carrier: Address,
    pub total_funded: i128,
    pub total_released: i128,
    pub remaining: i128,
    pub status: PartialEscrowStatus,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Counter,
    Escrow(u64),
}

const TTL_LEDGERS: u32 = 6_307_200;

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct PartialEscrowContract;

#[contractimpl]
impl PartialEscrowContract {
    /// One-time initialization.
    pub fn initialize(env: Env, admin: Address) -> Result<(), PartialEscrowError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(PartialEscrowError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().persistent().set(&DataKey::Counter, &0u64);
        Ok(())
    }

    /// Create a new partial-release escrow.
    pub fn create_escrow(
        env: Env,
        shipper: Address,
        carrier: Address,
        amount: i128,
    ) -> Result<u64, PartialEscrowError> {
        shipper.require_auth();

        if amount <= 0 {
            return Err(PartialEscrowError::InvalidAmount);
        }

        let escrow_id = Self::next_id(&env);

        let record = PartialEscrowRecord {
            escrow_id,
            shipper,
            carrier,
            total_funded: amount,
            total_released: 0,
            remaining: amount,
            status: PartialEscrowStatus::Active,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &record);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Escrow(escrow_id), TTL_LEDGERS, TTL_LEDGERS);

        Ok(escrow_id)
    }

    /// Release a partial amount of held funds to the carrier.
    /// Emits a PartialRelease event with { amount, remaining_balance }.
    pub fn release_partial(
        env: Env,
        escrow_id: u64,
        amount: i128,
    ) -> Result<(), PartialEscrowError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(PartialEscrowError::NotInitialized)?;
        admin.require_auth();

        if amount <= 0 {
            return Err(PartialEscrowError::InvalidAmount);
        }

        let mut record: PartialEscrowRecord = Self::load(&env, escrow_id)?;

        if record.status == PartialEscrowStatus::Refunded {
            return Err(PartialEscrowError::AlreadyRefunded);
        }

        if amount > record.remaining {
            return Err(PartialEscrowError::InsufficientFunds);
        }

        record.total_released += amount;
        record.remaining -= amount;

        if record.remaining == 0 {
            record.status = PartialEscrowStatus::FullyReleased;
        }

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &record);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Escrow(escrow_id), TTL_LEDGERS, TTL_LEDGERS);

        // Emit PartialRelease event
        env.events().publish(
            (Symbol::new(&env, "PartialRelease"), escrow_id),
            (amount, record.remaining),
        );

        Ok(())
    }

    /// Refund only the remaining (unreleased) amount to the shipper.
    pub fn refund(env: Env, escrow_id: u64) -> Result<i128, PartialEscrowError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(PartialEscrowError::NotInitialized)?;
        admin.require_auth();

        let mut record: PartialEscrowRecord = Self::load(&env, escrow_id)?;

        if record.status == PartialEscrowStatus::Refunded {
            return Err(PartialEscrowError::AlreadyRefunded);
        }

        let refund_amount = record.remaining;
        record.remaining = 0;
        record.status = PartialEscrowStatus::Refunded;

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &record);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Escrow(escrow_id), TTL_LEDGERS, TTL_LEDGERS);

        Ok(refund_amount)
    }

    // ── Queries ───────────────────────────────────────────────────────────

    pub fn get_escrow(env: Env, escrow_id: u64) -> Result<PartialEscrowRecord, PartialEscrowError> {
        Self::load(&env, escrow_id)
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    fn load(env: &Env, escrow_id: u64) -> Result<PartialEscrowRecord, PartialEscrowError> {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .ok_or(PartialEscrowError::NotFound)
    }

    fn next_id(env: &Env) -> u64 {
        let current: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::Counter)
            .unwrap_or(0);
        let next = current + 1;
        env.storage().persistent().set(&DataKey::Counter, &next);
        next
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::{Address as _, Events}, Env};

    fn setup() -> (Env, Address, PartialEscrowContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let contract_id = env.register(PartialEscrowContract {}, ());
        let client = PartialEscrowContractClient::new(&env, &contract_id);
        client.initialize(&admin);
        (env, admin, client)
    }

    #[test]
    fn test_single_partial_release() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);

        let id = client.create_escrow(&shipper, &carrier, &1000i128);

        client.release_partial(&id, &300i128);

        let record = client.get_escrow(&id);
        assert_eq!(record.total_funded, 1000);
        assert_eq!(record.total_released, 300);
        assert_eq!(record.remaining, 700);
        assert_eq!(record.status, PartialEscrowStatus::Active);
    }

    #[test]
    fn test_multiple_partial_releases_sum_to_total() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);

        let id = client.create_escrow(&shipper, &carrier, &1000i128);

        client.release_partial(&id, &200i128);
        client.release_partial(&id, &300i128);
        client.release_partial(&id, &500i128);

        let record = client.get_escrow(&id);
        assert_eq!(record.total_funded, 1000);
        assert_eq!(record.total_released, 1000);
        assert_eq!(record.remaining, 0);
        assert_eq!(record.status, PartialEscrowStatus::FullyReleased);
    }

    #[test]
    fn test_over_release_rejected() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);

        let id = client.create_escrow(&shipper, &carrier, &1000i128);

        client.release_partial(&id, &800i128);

        // Trying to release more than remaining
        let result = client.try_release_partial(&id, &300i128);
        assert_eq!(result, Err(Ok(PartialEscrowError::InsufficientFunds)));
    }

    #[test]
    fn test_refund_returns_remaining_only() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);

        let id = client.create_escrow(&shipper, &carrier, &1000i128);

        // Release some first
        client.release_partial(&id, &400i128);

        // Refund should return only remaining
        let refund_amount = client.refund(&id);
        assert_eq!(refund_amount, 600);

        let record = client.get_escrow(&id);
        assert_eq!(record.remaining, 0);
        assert_eq!(record.total_released, 400);
        assert_eq!(record.status, PartialEscrowStatus::Refunded);
    }

    #[test]
    fn test_release_after_refund_fails() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);

        let id = client.create_escrow(&shipper, &carrier, &1000i128);
        client.refund(&id);

        let result = client.try_release_partial(&id, &100i128);
        assert_eq!(result, Err(Ok(PartialEscrowError::AlreadyRefunded)));
    }

    #[test]
    fn test_partial_release_emits_event() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);

        let id = client.create_escrow(&shipper, &carrier, &1000i128);
        client.release_partial(&id, &250i128);

        // Verify event was emitted (events are captured in test env)
        let events = env.events().all();
        assert!(events.len() > 0);
    }
}
