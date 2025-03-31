use soroban_sdk::{contractimpl, Env, Symbol, Address, BytesN, Vec, Map};
use crate::storage_types::{DataKey, EscrowInfo};

pub struct EscrowContract;

#[derive(Clone)]
pub struct EscrowInfo {
    pub sender: Address,
    pub receiver: Address,
    pub amount: i128,
    pub condition: Symbol,
    pub released: bool,
    pub refunded: bool,
}

#[contractimpl]
impl EscrowContract {
    pub fn create(
        env: Env,
        sender: Address,
        receiver: Address,
        amount: i128,
        condition: Symbol,
        token_address: Address,
    ) -> u32 {
        sender.require_auth();
        
        // Verify the sender has sufficient balance
        let token_client = crate::token::Client::new(&env, &token_address);
        let sender_balance = token_client.balance(&sender);
        assert!(sender_balance >= amount, "Insufficient balance");

        // Transfer to escrow
        token_client.transfer(&sender, &env.current_contract_address(), &amount);

        // Generate escrow ID
        let escrow_id = env.storage().get(&DataKey::EscrowCount).unwrap_or(0) + 1;
        env.storage().set(&DataKey::EscrowCount, &escrow_id);

        // Store escrow info
        let escrow_info = EscrowInfo {
            sender,
            receiver,
            amount,
            condition,
            released: false,
            refunded: false,
        };
        env.storage().set(&DataKey::Escrow(escrow_id), &escrow_info);

        escrow_id
    }

    pub fn release(env: Env, escrow_id: u32, token_address: Address) {
        let escrow_info: EscrowInfo = env.storage()
            .get(&DataKey::Escrow(escrow_id))
            .unwrap()
            .unwrap();

        assert!(!escrow_info.released, "Already released");
        assert!(!escrow_info.refunded, "Already refunded");

        // Verify condition (in a real contract, you'd have more complex logic)
        if escrow_info.condition == Symbol::new(&env, "time") {
            // Example condition check
        }

        // Transfer to receiver
        let token_client = crate::token::Client::new(&env, &token_address);
        token_client.transfer(
            &env.current_contract_address(),
            &escrow_info.receiver,
            &escrow_info.amount,
        );

        // Update escrow status
        let mut updated_info = escrow_info;
        updated_info.released = true;
        env.storage().set(&DataKey::Escrow(escrow_id), &updated_info);
    }

    pub fn refund(env: Env, escrow_id: u32, token_address: Address) {
        let escrow_info: EscrowInfo = env.storage()
            .get(&DataKey::Escrow(escrow_id))
            .unwrap()
            .unwrap();

        escrow_info.sender.require_auth();
        assert!(!escrow_info.released, "Already released");
        assert!(!escrow_info.refunded, "Already refunded");

        // Transfer back to sender
        let token_client = crate::token::Client::new(&env, &token_address);
        token_client.transfer(
            &env.current_contract_address(),
            &escrow_info.sender,
            &escrow_info.amount,
        );

        // Update escrow status
        let mut updated_info = escrow_info;
        updated_info.refunded = true;
        env.storage().set(&DataKey::Escrow(escrow_id), &updated_info);
    }

    pub fn get_escrow(env: Env, escrow_id: u32) -> EscrowInfo {
        env.storage()
            .get(&DataKey::Escrow(escrow_id))
            .unwrap()
            .unwrap()
    }
}
