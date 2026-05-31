#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, Vec};

#[contracttype]
enum DataKey {
    Config,
    Ratings(BytesN<32>), // keyed by user_id
}

#[contracttype]
#[derive(Clone)]
pub struct DecayConfig {
    /// Seconds before a rating is considered "recent" (default: 365 days)
    pub recent_threshold_secs: u64,
    /// Seconds before a rating is considered "old" (default: 730 days)
    pub old_threshold_secs: u64,
    /// Weight in basis points for recent ratings  (default: 10000 = 100%)
    pub recent_weight_bps: u32,
    /// Weight in basis points for mid-age ratings (default: 7000  =  70%)
    pub mid_weight_bps: u32,
    /// Weight in basis points for old ratings     (default: 4000  =  40%)
    pub old_weight_bps: u32,
}

impl Default for DecayConfig {
    fn default() -> Self {
        Self {
            recent_threshold_secs: 365 * 24 * 3600,
            old_threshold_secs:    730 * 24 * 3600,
            recent_weight_bps:     10_000,
            mid_weight_bps:         7_000,
            old_weight_bps:         4_000,
        }
    }
}

/// A single rating entry stored on-chain.
#[contracttype]
#[derive(Clone)]
pub struct RatingEntry {
    /// Raw score 0–1000
    pub score:      u32,
    /// Ledger timestamp when the rating was submitted
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum ContractError {
    AlreadyInitialized = 1,
    NotInitialized     = 2,
    InvalidScore       = 3,
    NoRatings          = 4,
}

#[contract]
pub struct ReputationDecayContract;

#[contractimpl]
impl ReputationDecayContract {
    /// One-time initialisation. Pass `None` to use default thresholds.
    pub fn initialize(env: Env, config: Option<DecayConfig>) -> Result<(), ContractError> {
        if env.storage().instance().has(&DataKey::Config) {
            return Err(ContractError::AlreadyInitialized);
        }
        let cfg = config.unwrap_or_default();
        env.storage().instance().set(&DataKey::Config, &cfg);
        Ok(())
    }

    /// Submit a rating (0–1000) for a user at the current ledger time.
    pub fn submit_rating(
        env: Env,
        user_id: BytesN<32>,
        score: u32,
    ) -> Result<(), ContractError> {
        if score > 1000 {
            return Err(ContractError::InvalidScore);
        }
        let now = env.ledger().timestamp();
        let entry = RatingEntry { score, created_at: now };

        let mut ratings: Vec<RatingEntry> = env
            .storage()
            .persistent()
            .get(&DataKey::Ratings(user_id.clone()))
            .unwrap_or_else(|| Vec::new(&env));

        ratings.push_back(entry);
        env.storage()
            .persistent()
            .set(&DataKey::Ratings(user_id), &ratings);
        Ok(())
    }

    /// Returns the decay-weighted composite score (0–1000) for a user.
    pub fn get_decayed_score(
        env: Env,
        user_id: BytesN<32>,
        current_ledger_time: u64,
    ) -> Result<u32, ContractError> {
        let cfg: DecayConfig = env
            .storage()
            .instance()
            .get(&DataKey::Config)
            .ok_or(ContractError::NotInitialized)?;

        let ratings: Vec<RatingEntry> = env
            .storage()
            .persistent()
            .get(&DataKey::Ratings(user_id))
            .unwrap_or_else(|| Vec::new(&env));

        if ratings.is_empty() {
            return Err(ContractError::NoRatings);
        }

        let mut weighted_sum: u64 = 0;
        let mut weight_total: u64 = 0;

        for entry in ratings.iter() {
            let age_secs = current_ledger_time.saturating_sub(entry.created_at);

            let weight_bps = if age_secs < cfg.recent_threshold_secs {
                cfg.recent_weight_bps
            } else if age_secs < cfg.old_threshold_secs {
                cfg.mid_weight_bps
            } else {
                cfg.old_weight_bps
            } as u64;

            weighted_sum  += entry.score as u64 * weight_bps;
            weight_total  += weight_bps;
        }

        if weight_total == 0 {
            return Ok(0);
        }

        Ok((weighted_sum / weight_total) as u32)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Ledger, BytesN, Env};

    const DAY: u64 = 24 * 3600;

    fn setup() -> (Env, ReputationDecayContractClient<'static>) {
        let env = Env::default();
        let id  = env.register(ReputationDecayContract, ());
        let client = ReputationDecayContractClient::new(&env, &id);
        env.as_contract(&id, || { client.initialize(&None).unwrap(); });
        (env, client)
    }

    fn user(env: &Env) -> BytesN<32> { BytesN::from_array(env, &[1u8; 32]) }

    #[test]
    fn test_recent_rating_full_weight() {
        let (env, client) = setup();
        let u = user(&env);
        // Submit rating at t=0, query at t=0 (0 days old → 100% weight)
        env.ledger().set_timestamp(0);
        env.as_contract(&client.address, || {
            ReputationDecayContract::submit_rating(env.clone(), u.clone(), 800).unwrap();
        });
        let score = env.as_contract(&client.address, || {
            ReputationDecayContract::get_decayed_score(env.clone(), u.clone(), 0).unwrap()
        });
        assert_eq!(score, 800);
    }

    #[test]
    fn test_mid_age_rating_70_percent() {
        let (env, client) = setup();
        let u = user(&env);
        // Rating submitted at t=0, queried at t=366 days (mid-age → 70% weight)
        env.ledger().set_timestamp(0);
        env.as_contract(&client.address, || {
            ReputationDecayContract::submit_rating(env.clone(), u.clone(), 1000).unwrap();
        });
        let query_time = 366 * DAY;
        let score = env.as_contract(&client.address, || {
            ReputationDecayContract::get_decayed_score(env.clone(), u.clone(), query_time).unwrap()
        });
        // 1000 * 7000 / 7000 = 1000 (only one rating, weight cancels out)
        assert_eq!(score, 1000);
    }

    #[test]
    fn test_old_rating_40_percent_mixed() {
        let (env, client) = setup();
        let u = user(&env);

        // Two ratings: one recent (score=1000), one old at 731 days (score=500)
        // Recent: 1000 * 10000 = 10_000_000
        // Old:     500 *  4000 =  2_000_000
        // Total weight: 14000  → weighted avg = 12_000_000 / 14000 = 857
        env.ledger().set_timestamp(0);
        env.as_contract(&client.address, || {
            ReputationDecayContract::submit_rating(env.clone(), u.clone(), 500).unwrap();
        });
        let recent_time = 731 * DAY + 1;
        env.ledger().set_timestamp(recent_time);
        env.as_contract(&client.address, || {
            ReputationDecayContract::submit_rating(env.clone(), u.clone(), 1000).unwrap();
        });

        let score = env.as_contract(&client.address, || {
            ReputationDecayContract::get_decayed_score(env.clone(), u.clone(), recent_time).unwrap()
        });
        assert_eq!(score, 857);
    }
}
