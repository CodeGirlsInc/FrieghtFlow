#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, String, Vec};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Policy(String),
    Claim(String),
    PolicyCount,
    ClaimCount,
    ContractConfig,
}

#[derive(Clone)]
#[contracttype]
pub enum PolicyStatus {
    Active,
    Expired,
    Claimed,
    Cancelled,
}

#[derive(Clone)]
#[contracttype]
pub enum ClaimStatus {
    Submitted,
    UnderReview,
    Approved,
    Rejected,
    Paid,
}

#[derive(Clone)]
#[contracttype]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Clone)]
#[contracttype]
pub struct InsurancePolicy {
    pub id: String,
    pub shipment_id: String,
    pub policyholder: Address,
    pub insurer: Address,
    pub coverage_amount: u64,
    pub premium: u64,
    pub risk_level: RiskLevel,
    pub coverage_type: Vec<String>, // e.g., "theft", "damage", "delay"
    pub status: PolicyStatus,
    pub start_date: u64,
    pub end_date: u64,
    pub created_at: u64,
    pub terms_hash: String,
}

#[derive(Clone)]
#[contracttype]
pub struct InsuranceClaim {
    pub id: String,
    pub policy_id: String,
    pub claimant: Address,
    pub claim_amount: u64,
    pub incident_type: String,
    pub incident_date: u64,
    pub description: String,
    pub evidence_documents: Vec<String>,
    pub status: ClaimStatus,
    pub submitted_at: u64,
    pub reviewed_at: Option<u64>,
    pub approved_amount: Option<u64>,
    pub reviewer: Option<Address>,
    pub review_notes: Option<String>,
}

#[derive(Clone)]
#[contracttype]
pub struct InsuranceConfig {
    pub admin: Address,
    pub max_coverage: u64,
    pub min_premium_rate: u32, // Basis points
    pub max_premium_rate: u32, // Basis points
    pub claim_review_period: u64, // Seconds
}

#[contract]
pub struct InsuranceContract;

#[contractimpl]
impl InsuranceContract {
    /// Initialize insurance contract
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        
        let config = InsuranceConfig {
            admin: admin.clone(),
            max_coverage: 10_000_000_000_000u64, // $10M USD
            min_premium_rate: 50,  // 0.5%
            max_premium_rate: 1000, // 10%
            claim_review_period: 7 * 24 * 60 * 60, // 7 days
        };

        env.storage().instance().set(&DataKey::ContractConfig, &config);
        env.storage().instance().set(&DataKey::PolicyCount, &0u64);
        env.storage().instance().set(&DataKey::ClaimCount, &0u64);
    }

    /// Create insurance policy
    pub fn create_policy(
        env: Env,
        policyholder: Address,
        insurer: Address,
        shipment_id: String,
        coverage_amount: u64,
        premium: u64,
        risk_level: RiskLevel,
        coverage_type: Vec<String>,
        duration_days: u64,
        terms_hash: String,
    ) -> String {
        policyholder.require_auth();

        let config: InsuranceConfig = env.storage().instance().get(&DataKey::ContractConfig).unwrap();
        
        if coverage_amount > config.max_coverage {
            panic!("Coverage amount exceeds maximum");
        }

        // Validate premium rate
        let premium_rate = (premium * 10000) / coverage_amount;
        if premium_rate < config.min_premium_rate as u64 || premium_rate > config.max_premium_rate as u64 {
            panic!("Premium rate outside allowed range");
        }

        let mut policy_count: u64 = env.storage().instance().get(&DataKey::PolicyCount).unwrap_or(0);
        policy_count += 1;

        let policy_id = format!("INS{:08}", policy_count);
        let current_time = env.ledger().timestamp();

        let policy = InsurancePolicy {
            id: policy_id.clone(),
            shipment_id,
            policyholder,
            insurer,
            coverage_amount,
            premium,
            risk_level,
            coverage_type,
            status: PolicyStatus::Active,
            start_date: current_time,
            end_date: current_time + (duration_days * 24 * 60 * 60),
            created_at: current_time,
            terms_hash,
        };

        env.storage().persistent().set(&DataKey::Policy(policy_id.clone()), &policy);
        env.storage().instance().set(&DataKey::PolicyCount, &policy_count);

        policy_id
    }

    /// Submit insurance claim
    pub fn submit_claim(
        env: Env,
        claimant: Address,
        policy_id: String,
        claim_amount: u64,
        incident_type: String,
        incident_date: u64,
        description: String,
        evidence_documents: Vec<String>,
    ) -> String {
        claimant.require_auth();

        let policy: InsurancePolicy = env.storage().persistent()
            .get(&DataKey::Policy(policy_id.clone()))
            .expect("Policy not found");

        if claimant != policy.policyholder {
            panic!("Only policyholder can submit claims");
        }

        if !matches!(policy.status, PolicyStatus::Active) {
            panic!("Policy is not active");
        }

        if claim_amount > policy.coverage_amount {
            panic!("Claim amount exceeds coverage");
        }

        let current_time = env.ledger().timestamp();
        if current_time > policy.end_date {
            panic!("Policy has expired");
        }

        let mut claim_count: u64 = env.storage().instance().get(&DataKey::ClaimCount).unwrap_or(0);
        claim_count += 1;

        let claim_id = format!("CLM{:08}", claim_count);

        let claim = InsuranceClaim {
            id: claim_id.clone(),
            policy_id,
            claimant,
            claim_amount,
            incident_type,
            incident_date,
            description,
            evidence_documents,
            status: ClaimStatus::Submitted,
            submitted_at: current_time,
            reviewed_at: None,
            approved_amount: None,
            reviewer: None,
            review_notes: None,
        };

        env.storage().persistent().set(&DataKey::Claim(claim_id.clone()), &claim);
        env.storage().instance().set(&DataKey::ClaimCount, &claim_count);

        claim_id
    }

    /// Review insurance claim
    pub fn review_claim(
        env: Env,
        reviewer: Address,
        claim_id: String,
        approved: bool,
        approved_amount: Option<u64>,
        review_notes: Option<String>,
    ) {
        reviewer.require_auth();

        let mut claim: InsuranceClaim = env.storage().persistent()
            .get(&DataKey::Claim(claim_id.clone()))
            .expect("Claim not found");

        let policy: InsurancePolicy = env.storage().persistent()
            .get(&DataKey::Policy(claim.policy_id.clone()))
            .expect("Policy not found");

        if reviewer != policy.insurer {
            let config: InsuranceConfig = env.storage().instance().get(&DataKey::ContractConfig).unwrap();
            if reviewer != config.admin {
                panic!("Only insurer or admin can review claims");
            }
        }

        if !matches!(claim.status, ClaimStatus::Submitted | ClaimStatus::UnderReview) {
            panic!("Claim already reviewed");
        }

        let current_time = env.ledger().timestamp();
        claim.reviewed_at = Some(current_time);
        claim.reviewer = Some(reviewer);
        claim.review_notes = review_notes;

        if approved {
            let final_amount = approved_amount.unwrap_or(claim.claim_amount);
            if final_amount > claim.claim_amount {
                panic!("Approved amount cannot exceed claim amount");
            }
            claim.approved_amount = Some(final_amount);
            claim.status = ClaimStatus::Approved;
        } else {
            claim.status = ClaimStatus::Rejected;
        }

        env.storage().persistent().set(&DataKey::Claim(claim_id), &claim);
    }

    /// Mark claim as paid
    pub fn mark_claim_paid(env: Env, insurer: Address, claim_id: String) {
        insurer.require_auth();

        let mut claim: InsuranceClaim = env.storage().persistent()
            .get(&DataKey::Claim(claim_id.clone()))
            .expect("Claim not found");

        let policy: InsurancePolicy = env.storage().persistent()
            .get(&DataKey::Policy(claim.policy_id.clone()))
            .expect("Policy not found");

        if insurer != policy.insurer {
            panic!("Only insurer can mark claim as paid");
        }

        if !matches!(claim.status, ClaimStatus::Approved) {
            panic!("Claim must be approved first");
        }

        claim.status = ClaimStatus::Paid;
        env.storage().persistent().set(&DataKey::Claim(claim_id), &claim);

        // Update policy status
        let mut updated_policy = policy;
        updated_policy.status = PolicyStatus::Claimed;
        env.storage().persistent().set(&DataKey::Policy(updated_policy.id.clone()), &updated_policy);
    }

    /// Cancel policy
    pub fn cancel_policy(env: Env, caller: Address, policy_id: String, reason: String) {
        caller.require_auth();

        let mut policy: InsurancePolicy = env.storage().persistent()
            .get(&DataKey::Policy(policy_id.clone()))
            .expect("Policy not found");

        if caller != policy.policyholder && caller != policy.insurer {
            let config: InsuranceConfig = env.storage().instance().get(&DataKey::ContractConfig).unwrap();
            if caller != config.admin {
                panic!("Unauthorized to cancel policy");
            }
        }

        if !matches!(policy.status, PolicyStatus::Active) {
            panic!("Policy is not active");
        }

        policy.status = PolicyStatus::Cancelled;
        env.storage().persistent().set(&DataKey::Policy(policy_id), &policy);
    }

    /// Get policy details
    pub fn get_policy(env: Env, policy_id: String) -> InsurancePolicy {
        env.storage().persistent()
            .get(&DataKey::Policy(policy_id))
            .expect("Policy not found")
    }

    /// Get claim details
    pub fn get_claim(env: Env, claim_id: String) -> InsuranceClaim {
        env.storage().persistent()
            .get(&DataKey::Claim(claim_id))
            .expect("Claim not found")
    }

    /// Get policy count
    pub fn get_policy_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::PolicyCount).unwrap_or(0)
    }

    /// Get claim count
    pub fn get_claim_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::ClaimCount).unwrap_or(0)
    }
}
