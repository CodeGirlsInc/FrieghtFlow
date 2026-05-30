#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, BytesN, Env, Symbol,
};

#[contracttype]
pub enum DataKey {
    Admin,
    Certification(Address, Symbol),
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum CertStatus {
    Active,
    Revoked,
}

#[contracttype]
#[derive(Clone)]
pub struct CertRecord {
    pub issuer_hash: BytesN<32>,
    pub expires_at:  u64,
    pub status:      CertStatus,
}

#[contracttype]
#[derive(Clone)]
pub struct VerifyResponse {
    pub is_valid:    bool,
    pub expires_at:  u64,
    pub issuer_hash: BytesN<32>,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum ContractError {
    Unauthorized       = 1,
    InvalidCertType    = 2,
    CertNotFound       = 3,
    AlreadyInitialized = 4,
}

fn valid_cert_types() -> [&'static str; 5] {
    ["OPERATING_LICENSE", "INSURANCE", "SAFETY", "HAZMAT", "VEHICLE_REG"]
}

fn assert_valid_cert_type(env: &Env, cert_type: &Symbol) -> Result<(), ContractError> {
    for t in valid_cert_types() {
        if *cert_type == Symbol::new(env, t) {
            return Ok(());
        }
    }
    Err(ContractError::InvalidCertType)
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

#[contract]
pub struct CertificationRegistry;

#[contractimpl]
impl CertificationRegistry {
    /// One-time initialisation — sets the contract admin.
    pub fn initialize(env: Env, admin: Address) -> Result<(), ContractError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(ContractError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        Ok(())
    }

    /// Admin: register or update a carrier certification.
    pub fn register_certification(
        env: Env,
        caller: Address,
        carrier_wallet: Address,
        cert_type: Symbol,
        issuer_hash: BytesN<32>,
        expires_at: u64,
    ) -> Result<(), ContractError> {
        require_admin(&env, &caller)?;
        assert_valid_cert_type(&env, &cert_type)?;

        let record = CertRecord {
            issuer_hash,
            expires_at,
            status: CertStatus::Active,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Certification(carrier_wallet, cert_type), &record);
        Ok(())
    }

    /// Public: verify a carrier certification.
    /// Returns `is_valid: false` for expired or revoked certs without requiring
    /// an explicit revocation call.
    pub fn verify_certification(
        env: Env,
        carrier_wallet: Address,
        cert_type: Symbol,
    ) -> Result<VerifyResponse, ContractError> {
        let record: CertRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Certification(carrier_wallet, cert_type))
            .ok_or(ContractError::CertNotFound)?;

        let now = env.ledger().timestamp();
        let is_valid = record.status == CertStatus::Active && now <= record.expires_at;

        Ok(VerifyResponse {
            is_valid,
            expires_at:  record.expires_at,
            issuer_hash: record.issuer_hash,
        })
    }

    /// Admin: revoke a certification immediately.
    pub fn revoke_certification(
        env: Env,
        caller: Address,
        carrier_wallet: Address,
        cert_type: Symbol,
    ) -> Result<(), ContractError> {
        require_admin(&env, &caller)?;

        let key = DataKey::Certification(carrier_wallet, cert_type);
        let mut record: CertRecord = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(ContractError::CertNotFound)?;

        record.status = CertStatus::Revoked;
        env.storage().persistent().set(&key, &record);
        Ok(())
    }
}