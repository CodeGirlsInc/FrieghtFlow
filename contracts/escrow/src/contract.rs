//! The contract's ABI surface.
//!
//! Every entrypoint is declared here in one `#[contractimpl]` block so the
//! externally callable interface can be read in one place; the logic behind
//! each one lives in [`crate::funding`] or [`crate::settlement`].

use soroban_sdk::{contract, contractimpl, Address, Env};

use crate::errors::EscrowError;
use crate::types::{DataKey, EscrowRecord};
use crate::{funding, settlement, storage};

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
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
        env.storage().instance().set(&DataKey::Paused, &false);
        env.storage()
            .instance()
            .set(&DataKey::TokenContract, &token_contract);
        Ok(())
    }

    /// Transfer admin rights to a new address. Callable only by the current admin.
    pub fn rotate_admin(
        env: Env,
        current_admin: Address,
        new_admin: Address,
    ) -> Result<(), EscrowError> {
        current_admin.require_auth();
        if current_admin != storage::admin(&env)? {
            return Err(EscrowError::Unauthorized);
        }
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        Ok(())
    }

    /// Admin-only: pause all state-mutating entrypoints.
    pub fn pause(env: Env, admin: Address) -> Result<(), EscrowError> {
        admin.require_auth();
        if admin != storage::admin(&env)? {
            return Err(EscrowError::Unauthorized);
        }
        env.storage().instance().set(&DataKey::Paused, &true);
        Ok(())
    }

    /// Admin-only: resume state-mutating entrypoints.
    pub fn unpause(env: Env, admin: Address) -> Result<(), EscrowError> {
        admin.require_auth();
        if admin != storage::admin(&env)? {
            return Err(EscrowError::Unauthorized);
        }
        env.storage().instance().set(&DataKey::Paused, &false);
        Ok(())
    }

    /// Configure the shipment contract allowed to settle escrow atomically.
    /// The platform admin remains supported for custody-model compatibility.
    pub fn set_shipment_contract(env: Env, shipment_contract: Address) -> Result<(), EscrowError> {
        storage::admin(&env)?.require_auth();
        storage::require_not_paused(&env)?;
        env.storage()
            .instance()
            .set(&DataKey::ShipmentContract, &shipment_contract);
        Ok(())
    }

    /// Shipper locks funds for a shipment. See [`funding::fund`].
    pub fn fund_escrow(
        env: Env,
        shipper: Address,
        carrier: Address,
        shipment_id: u64,
        amount: i128,
    ) -> Result<(), EscrowError> {
        funding::fund(&env, shipper, carrier, shipment_id, amount)
    }

    /// Pay the carrier. See [`settlement::release`].
    pub fn release_payment(env: Env, shipment_id: u64) -> Result<(), EscrowError> {
        settlement::release(&env, shipment_id)
    }

    /// Return the funds to the shipper. See [`settlement::refund`].
    pub fn refund_payment(env: Env, shipment_id: u64) -> Result<(), EscrowError> {
        settlement::refund(&env, shipment_id)
    }

    /// Either party disputes the escrow. See [`settlement::raise_dispute`].
    pub fn raise_dispute(env: Env, caller: Address, shipment_id: u64) -> Result<(), EscrowError> {
        settlement::raise_dispute(&env, caller, shipment_id)
    }

    /// Admin resolves a dispute. See [`settlement::resolve_dispute`].
    pub fn resolve_dispute(
        env: Env,
        shipment_id: u64,
        release_to_carrier: bool,
    ) -> Result<(), EscrowError> {
        settlement::resolve_dispute(&env, shipment_id, release_to_carrier)
    }

    pub fn get_escrow(env: Env, shipment_id: u64) -> Result<EscrowRecord, EscrowError> {
        storage::load(&env, shipment_id)
    }

    /// Read the configured admin address.
    ///
    /// Lets external callers (e.g. the backend's Soroban integration layer)
    /// verify their loaded signing keypair actually matches this contract's
    /// admin at startup, instead of discovering a mismatch on first real
    /// admin-gated call.
    pub fn get_admin(env: Env) -> Result<Address, EscrowError> {
        storage::admin(&env)
    }

    pub fn get_balance(env: Env) -> i128 {
        let token = storage::token(&env).unwrap_or_else(|_| panic!());
        token.balance(&env.current_contract_address())
    }
}
