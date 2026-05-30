#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env, Vec};

// ── Errors ────────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum MultisigEscrowError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    NotFound = 3,
    InvalidThreshold = 4,
    NotApprover = 5,
    AlreadyReleased = 6,
    AlreadyRefunded = 7,
    Unauthorized = 8,
}

// ── Types ─────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowMsStatus {
    Active,
    Released,
    Refunded,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct MultisigEscrow {
    pub escrow_id: u64,
    pub shipper: Address,
    pub carrier: Address,
    pub amount: i128,
    pub approvers: Vec<Address>,
    pub threshold: u32,
    pub release_approvals: u32,
    pub refund_approvals: u32,
    pub status: EscrowMsStatus,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Counter,
    Escrow(u64),
    /// Bitmap of release approvals: escrow_id -> Vec<bool>
    ReleaseMap(u64),
    /// Bitmap of refund approvals: escrow_id -> Vec<bool>
    RefundMap(u64),
}

const TTL_LEDGERS: u32 = 6_307_200;

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct MultisigEscrowContract;

#[contractimpl]
impl MultisigEscrowContract {
    /// One-time initialization.
    pub fn initialize(env: Env, admin: Address) -> Result<(), MultisigEscrowError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(MultisigEscrowError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().persistent().set(&DataKey::Counter, &0u64);
        Ok(())
    }

    /// Create a new multi-sig escrow.
    /// `approvers` is the list of addresses allowed to approve.
    /// `threshold` is the number of approvals required (N-of-M).
    pub fn create_escrow(
        env: Env,
        shipper: Address,
        carrier: Address,
        amount: i128,
        approvers: Vec<Address>,
        threshold: u32,
    ) -> Result<u64, MultisigEscrowError> {
        shipper.require_auth();

        let m = approvers.len();
        if threshold == 0 || threshold > m || m == 0 {
            return Err(MultisigEscrowError::InvalidThreshold);
        }

        let escrow_id = Self::next_id(&env);

        let escrow = MultisigEscrow {
            escrow_id,
            shipper,
            carrier,
            amount,
            approvers: approvers.clone(),
            threshold,
            release_approvals: 0,
            refund_approvals: 0,
            status: EscrowMsStatus::Active,
        };

        // Initialize approval bitmaps as Vec<bool> of length M (all false)
        let mut release_map = Vec::new(&env);
        let mut refund_map = Vec::new(&env);
        for _ in 0..m {
            release_map.push_back(false);
            refund_map.push_back(false);
        }

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &escrow);
        env.storage()
            .persistent()
            .set(&DataKey::ReleaseMap(escrow_id), &release_map);
        env.storage()
            .persistent()
            .set(&DataKey::RefundMap(escrow_id), &refund_map);

        Self::extend_ttl(&env, escrow_id);

        Ok(escrow_id)
    }

    /// Approve fund release. Callable by any registered approver.
    /// Duplicate approval from the same address is a no-op (idempotent).
    /// Funds are released automatically when threshold is met.
    pub fn approve_release(env: Env, approver: Address, escrow_id: u64) -> Result<(), MultisigEscrowError> {
        approver.require_auth();

        let mut escrow: MultisigEscrow = Self::load(&env, escrow_id)?;

        if escrow.status == EscrowMsStatus::Released {
            return Err(MultisigEscrowError::AlreadyReleased);
        }
        if escrow.status == EscrowMsStatus::Refunded {
            return Err(MultisigEscrowError::AlreadyRefunded);
        }

        let index = Self::find_approver_index(&escrow.approvers, &approver)?;

        let mut release_map: Vec<bool> = env
            .storage()
            .persistent()
            .get(&DataKey::ReleaseMap(escrow_id))
            .ok_or(MultisigEscrowError::NotFound)?;

        // Idempotent: if already approved, do nothing
        if release_map.get(index).unwrap_or(false) {
            return Ok(());
        }

        release_map.set(index, true);
        escrow.release_approvals += 1;

        // Check if threshold is met
        if escrow.release_approvals >= escrow.threshold {
            escrow.status = EscrowMsStatus::Released;
        }

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &escrow);
        env.storage()
            .persistent()
            .set(&DataKey::ReleaseMap(escrow_id), &release_map);
        Self::extend_ttl(&env, escrow_id);

        Ok(())
    }

    /// Approve refund. Requires threshold approvals OR admin override.
    /// Duplicate approval from the same address is a no-op (idempotent).
    pub fn approve_refund(env: Env, approver: Address, escrow_id: u64) -> Result<(), MultisigEscrowError> {
        approver.require_auth();

        let mut escrow: MultisigEscrow = Self::load(&env, escrow_id)?;

        if escrow.status == EscrowMsStatus::Released {
            return Err(MultisigEscrowError::AlreadyReleased);
        }
        if escrow.status == EscrowMsStatus::Refunded {
            return Err(MultisigEscrowError::AlreadyRefunded);
        }

        let index = Self::find_approver_index(&escrow.approvers, &approver)?;

        let mut refund_map: Vec<bool> = env
            .storage()
            .persistent()
            .get(&DataKey::RefundMap(escrow_id))
            .ok_or(MultisigEscrowError::NotFound)?;

        // Idempotent
        if refund_map.get(index).unwrap_or(false) {
            return Ok(());
        }

        refund_map.set(index, true);
        escrow.refund_approvals += 1;

        if escrow.refund_approvals >= escrow.threshold {
            escrow.status = EscrowMsStatus::Refunded;
        }

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &escrow);
        env.storage()
            .persistent()
            .set(&DataKey::RefundMap(escrow_id), &refund_map);
        Self::extend_ttl(&env, escrow_id);

        Ok(())
    }

    /// Admin override: force refund regardless of approvals.
    pub fn admin_refund(env: Env, escrow_id: u64) -> Result<(), MultisigEscrowError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(MultisigEscrowError::NotInitialized)?;
        admin.require_auth();

        let mut escrow: MultisigEscrow = Self::load(&env, escrow_id)?;

        if escrow.status == EscrowMsStatus::Released {
            return Err(MultisigEscrowError::AlreadyReleased);
        }
        if escrow.status == EscrowMsStatus::Refunded {
            return Err(MultisigEscrowError::AlreadyRefunded);
        }

        escrow.status = EscrowMsStatus::Refunded;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &escrow);
        Self::extend_ttl(&env, escrow_id);

        Ok(())
    }

    // ── Queries ───────────────────────────────────────────────────────────

    pub fn get_escrow(env: Env, escrow_id: u64) -> Result<MultisigEscrow, MultisigEscrowError> {
        Self::load(&env, escrow_id)
    }

    pub fn get_release_approvals(env: Env, escrow_id: u64) -> Result<u32, MultisigEscrowError> {
        let escrow: MultisigEscrow = Self::load(&env, escrow_id)?;
        Ok(escrow.release_approvals)
    }

    pub fn get_refund_approvals(env: Env, escrow_id: u64) -> Result<u32, MultisigEscrowError> {
        let escrow: MultisigEscrow = Self::load(&env, escrow_id)?;
        Ok(escrow.refund_approvals)
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    fn load(env: &Env, escrow_id: u64) -> Result<MultisigEscrow, MultisigEscrowError> {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .ok_or(MultisigEscrowError::NotFound)
    }

    fn find_approver_index(approvers: &Vec<Address>, approver: &Address) -> Result<u32, MultisigEscrowError> {
        for i in 0..approvers.len() {
            if approvers.get(i).unwrap() == *approver {
                return Ok(i);
            }
        }
        Err(MultisigEscrowError::NotApprover)
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

    fn extend_ttl(env: &Env, escrow_id: u64) {
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Escrow(escrow_id), TTL_LEDGERS, TTL_LEDGERS);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::ReleaseMap(escrow_id), TTL_LEDGERS, TTL_LEDGERS);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::RefundMap(escrow_id), TTL_LEDGERS, TTL_LEDGERS);
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    fn setup() -> (Env, Address, MultisigEscrowContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let contract_id = env.register(MultisigEscrowContract {}, ());
        let client = MultisigEscrowContractClient::new(&env, &contract_id);
        client.initialize(&admin);
        (env, admin, client)
    }

    #[test]
    fn test_threshold_met_releases_funds() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);
        let approver1 = Address::generate(&env);
        let approver2 = Address::generate(&env);

        let mut approvers = Vec::new(&env);
        approvers.push_back(approver1.clone());
        approvers.push_back(approver2.clone());

        let id = client.create_escrow(&shipper, &carrier, &1000i128, &approvers, &2u32);

        // First approval — not released yet
        client.approve_release(&approver1, &id);
        let escrow = client.get_escrow(&id);
        assert_eq!(escrow.status, EscrowMsStatus::Active);
        assert_eq!(escrow.release_approvals, 1);

        // Second approval — threshold met, released
        client.approve_release(&approver2, &id);
        let escrow = client.get_escrow(&id);
        assert_eq!(escrow.status, EscrowMsStatus::Released);
        assert_eq!(escrow.release_approvals, 2);
    }

    #[test]
    fn test_threshold_not_met_funds_held() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);
        let approver1 = Address::generate(&env);
        let approver2 = Address::generate(&env);
        let approver3 = Address::generate(&env);

        let mut approvers = Vec::new(&env);
        approvers.push_back(approver1.clone());
        approvers.push_back(approver2.clone());
        approvers.push_back(approver3.clone());

        // threshold = 3 of 3
        let id = client.create_escrow(&shipper, &carrier, &1000i128, &approvers, &3u32);

        client.approve_release(&approver1, &id);
        client.approve_release(&approver2, &id);

        // Only 2 of 3 — still Active
        let escrow = client.get_escrow(&id);
        assert_eq!(escrow.status, EscrowMsStatus::Active);
        assert_eq!(escrow.release_approvals, 2);
    }

    #[test]
    fn test_duplicate_approval_idempotent() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);
        let approver1 = Address::generate(&env);
        let approver2 = Address::generate(&env);

        let mut approvers = Vec::new(&env);
        approvers.push_back(approver1.clone());
        approvers.push_back(approver2.clone());

        let id = client.create_escrow(&shipper, &carrier, &1000i128, &approvers, &2u32);

        // Approve once
        client.approve_release(&approver1, &id);
        // Approve again — idempotent, no panic
        client.approve_release(&approver1, &id);

        let escrow = client.get_escrow(&id);
        assert_eq!(escrow.release_approvals, 1); // still 1
        assert_eq!(escrow.status, EscrowMsStatus::Active);
    }

    #[test]
    fn test_refund_threshold() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);
        let approver1 = Address::generate(&env);
        let approver2 = Address::generate(&env);

        let mut approvers = Vec::new(&env);
        approvers.push_back(approver1.clone());
        approvers.push_back(approver2.clone());

        let id = client.create_escrow(&shipper, &carrier, &1000i128, &approvers, &2u32);

        client.approve_refund(&approver1, &id);
        assert_eq!(client.get_escrow(&id).status, EscrowMsStatus::Active);

        client.approve_refund(&approver2, &id);
        assert_eq!(client.get_escrow(&id).status, EscrowMsStatus::Refunded);
    }

    #[test]
    fn test_admin_override_refund() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);
        let approver1 = Address::generate(&env);

        let mut approvers = Vec::new(&env);
        approvers.push_back(approver1.clone());

        let id = client.create_escrow(&shipper, &carrier, &1000i128, &approvers, &1u32);

        client.admin_refund(&id);
        assert_eq!(client.get_escrow(&id).status, EscrowMsStatus::Refunded);
    }

    #[test]
    fn test_non_approver_rejected() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);
        let approver1 = Address::generate(&env);
        let stranger = Address::generate(&env);

        let mut approvers = Vec::new(&env);
        approvers.push_back(approver1.clone());

        let id = client.create_escrow(&shipper, &carrier, &1000i128, &approvers, &1u32);

        let result = client.try_approve_release(&stranger, &id);
        assert_eq!(result, Err(Ok(MultisigEscrowError::NotApprover)));
    }

    #[test]
    fn test_invalid_threshold_rejected() {
        let (env, _, client) = setup();
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);
        let approver1 = Address::generate(&env);

        let mut approvers = Vec::new(&env);
        approvers.push_back(approver1.clone());

        // threshold > number of approvers
        let result = client.try_create_escrow(&shipper, &carrier, &1000i128, &approvers, &5u32);
        assert_eq!(result, Err(Ok(MultisigEscrowError::InvalidThreshold)));

        // threshold = 0
        let result = client.try_create_escrow(&shipper, &carrier, &1000i128, &approvers, &0u32);
        assert_eq!(result, Err(Ok(MultisigEscrowError::InvalidThreshold)));
    }
}
