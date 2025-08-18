// Access Control Helpers
// Only platform owner
func only_owner() {
    let (caller) = get_caller_address();
    let (owner) = platform_owner.read();
    assert(caller == owner, 'Only platform owner can call this function');
}

// Only payer of a given escrow
func only_payer(escrow_id: felt252) {
    let (caller) = get_caller_address();
    let (details) = escrows.read(escrow_id);
    assert(caller == details.payer, 'Only payer can call this function');
}

// Only payee of a given escrow
func only_payee(escrow_id: felt252) {
    let (caller) = get_caller_address();
    let (details) = escrows.read(escrow_id);
    assert(caller == details.payee, 'Only payee can call this function');
}

// Only dispute resolver for a given escrow
func only_resolver(escrow_id: felt252) {
    let (caller) = get_caller_address();
    let (details) = escrows.read(escrow_id);
    let (is_resolver) = dispute_resolvers.read(caller);
    assert(caller == details.resolver && is_resolver, 'Only assigned dispute resolver can call this function');
}
// SPDX-License-Identifier: MIT
// Starknet Escrow Smart Contract with Milestone-Based Payments
// Cairo 1.0

%lang starknet

from starkware::starknet::contract_address import ContractAddress
from starkware::starknet::event import emit_event
from openzeppelin::token::erc20::interface::IERC20Dispatcher
from starkware::starknet::storage::Storage
from starkware::starknet::syscalls::get_caller_address
from starkware::starknet::syscalls::get_contract_address
from starkware::starknet::syscalls::get_block_timestamp
from starkware::starknet::syscalls::get_block_number
from starkware::starknet::syscalls::get_sequencer_address
from starkware::starknet::syscalls::get_tx_info
from starkware::starknet::syscalls::get_tx_signature
from starkware::starknet::syscalls::get_tx_hash
from starkware::starknet::syscalls::get_tx_nonce
from starkware::starknet::syscalls::get_tx_version
from starkware::starknet::syscalls::get_tx_sender_address
from starkware::starknet::syscalls::get_tx_fee_token_address
from starkware::starknet::syscalls::get_tx_fee
from starkware::starknet::syscalls::get_tx_max_fee
from starkware::starknet::syscalls::get_tx_gas_price
from starkware::starknet::syscalls::get_tx_gas_limit
from starkware::starknet::syscalls::get_tx_gas_used
from starkware::starknet::syscalls::get_tx_gas_refund
from starkware::starknet::syscalls::get_tx_gas_tip
from starkware::starknet::syscalls::get_tx_gas_tip_cap
from starkware::starknet::syscalls::get_tx_gas_fee_cap
from starkware::starknet::syscalls::get_tx_gas_fee
from starkware::starknet::syscalls::get_tx_gas_fee_refund
from starkware::starknet::syscalls::get_tx_gas_fee_tip
from starkware::starknet::syscalls::get_tx_gas_fee_tip_cap
from starkware::starknet::syscalls::get_tx_gas_fee_cap
from starkware::starknet::syscalls::get_tx_gas_fee_used
from starkware::starknet::syscalls::get_tx_gas_fee_limit
from starkware::starknet::syscalls::get_tx_gas_fee_max
from starkware::starknet::syscalls::get_tx_gas_fee_min
from starkware::starknet::syscalls::get_tx_gas_fee_avg
from starkware::starknet::syscalls::get_tx_gas_fee_median
from starkware::starknet::syscalls::get_tx_gas_fee_mode
from starkware::starknet::syscalls::get_tx_gas_fee_percentile
from starkware::starknet::syscalls::get_tx_gas_fee_percentile_50
from starkware::starknet::syscalls::get_tx_gas_fee_percentile_90
from starkware::starknet::syscalls::get_tx_gas_fee_percentile_99
from starkware::starknet::syscalls::get_tx_gas_fee_percentile_100

@contract_interface
namespace IEscrow {
    // Create a new escrow with milestones
    func create_escrow(
        payer: ContractAddress,
        payee: ContractAddress,
        token: ContractAddress,
        milestones: Array<u256>, // milestone amounts
        resolver: ContractAddress
    ) -> (escrow_id: felt252);

    // Deposit funds for an escrow
    func deposit_funds(
        escrow_id: felt252,
        amount: u256
    );

    // Release a specific milestone
    func release_milestone(
        escrow_id: felt252,
        milestone_index: u32
    );

    // Release all remaining funds
    func release_all_funds(
        escrow_id: felt252
    );

    // Initiate a dispute
    func initiate_dispute(
        escrow_id: felt252
    );

    // Resolve a dispute
    func resolve_dispute(
        escrow_id: felt252,
        payee_amount: u256,
        payer_amount: u256
    );

    // Request a refund
    func request_refund(
        escrow_id: felt252
    );

    // Get escrow details
    func get_escrow_details(
        escrow_id: felt252
    ) -> (details: EscrowDetails);

    // Get available balance
    func get_available_balance(
        escrow_id: felt252
    ) -> (balance: u256);
}

// Enums
@enum
namespace EscrowStatus {
    variant Pending;
    variant Funded;
    variant InDispute;
    variant Completed;
    variant Refunded;
}

@enum
namespace DisputeResolution {
    variant None;
    variant Payee;
    variant Payer;
    variant Split;
}

// Structs
struct EscrowMilestone {
    amount: u256,
    released: bool,
}

struct EscrowDetails {
    payer: ContractAddress,
    payee: ContractAddress,
    token: ContractAddress,
    resolver: ContractAddress,
    milestones: Array<EscrowMilestone>,
    status: EscrowStatus,
    total_amount: u256,
    released_amount: u256,
    available_balance: u256,
    dispute: DisputeResolution,
}

// Events
@event
func EscrowCreated(escrow_id: felt252, payer: ContractAddress, payee: ContractAddress, token: ContractAddress, total_amount: u256, resolver: ContractAddress);
@event
func FundsDeposited(escrow_id: felt252, amount: u256);
@event
func MilestoneReleased(escrow_id: felt252, milestone_index: u32, amount: u256);
@event
func DisputeInitiated(escrow_id: felt252);
@event
func DisputeResolved(escrow_id: felt252, payee_amount: u256, payer_amount: u256);
@event
func RefundProcessed(escrow_id: felt252, amount: u256);

// Storage
@storage_var
func escrows(escrow_id: felt252) -> (details: EscrowDetails) {}

@storage_var
func escrow_milestones(escrow_id: felt252, milestone_index: u32) -> (milestone: EscrowMilestone) {}

@storage_var
func escrow_milestones_count(escrow_id: felt252) -> (count: u32) {}

// Role-based access control
@storage_var
func platform_owner() -> (owner: ContractAddress) {}

@storage_var
func dispute_resolvers(resolver: ContractAddress) -> (is_resolver: bool) {}
