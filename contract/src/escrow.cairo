// Reentrancy Guard
@storage_var
func reentrancy_lock() -> (locked: bool) {}

func non_reentrant_enter() {
    let (locked) = reentrancy_lock.read();
    assert(!locked, 'Reentrancy detected');
    reentrancy_lock.write(true);
}

func non_reentrant_exit() {
    reentrancy_lock.write(false);
}
// Main Function Logicc
@external
func create_escrow(
    payer: ContractAddress,
    payee: ContractAddress,
    token: ContractAddress,
    milestones: Array<u256>,
    resolver: ContractAddress
) -> (escrow_id: felt252) {
    // Only payer can create
    let (caller) = get_caller_address();
    assert(caller == payer, 'Only payer can create escrow');

    // Generate escrow_id (simple: hash of (payer, payee, block number, timestamp))
    let (block_num) = get_block_number();
    let (timestamp) = get_block_timestamp();
    let escrow_id = hash2(hash2(payer, payee), hash2(block_num, timestamp));

    // Calculate total amount
    let mut total: u256 = 0;
    let mut i: u32 = 0;
    let milestones_len = milestones.len();
    while i < milestones_len {
        let amount = milestones[i];
        total = total + amount;
        escrow_milestones.write(escrow_id, i, EscrowMilestone(amount, false));
        i += 1;
    }
    escrow_milestones_count.write(escrow_id, milestones_len);

    let details = EscrowDetails(
        payer,
        payee,
        token,
        resolver,
        ArrayTrait::default(), // milestones not stored here, but in storage varr
        EscrowStatus::Pending,
        total,
        0,
        0,
        DisputeResolution::None
    );
    escrows.write(escrow_id, details);
    emit_event EscrowCreated(escrow_id, payer, payee, token, total, resolver);
    return (escrow_id,);
}

@external
func deposit_funds(escrow_id: felt252, amount: u256) {
    only_payer(escrow_id);
    let (details) = escrows.read(escrow_id);
    assert(details.status == EscrowStatus::Pending || details.status == EscrowStatus::Funded, 'Escrow not fundable');
    // Transfer tokens from payer to contract
    IERC20Dispatcher{address=details.token}.transferFrom(details.payer, get_contract_address(), amount);
    // Update available balance
    let new_balance = details.available_balance + amount;
    let new_status = if new_balance >= details.total_amount { EscrowStatus::Funded } else { details.status };
    let updated = EscrowDetails(
        details.payer, details.payee, details.token, details.resolver, ArrayTrait::default(), new_status, details.total_amount, details.released_amount, new_balance, details.dispute
    );
    escrows.write(escrow_id, updated);
    emit_event FundsDeposited(escrow_id, amount);
}

@external
func release_milestone(escrow_id: felt252, milestone_index: u32) {
    non_reentrant_enter();
    only_payer(escrow_id);
    let (details) = escrows.read(escrow_id);
    assert(details.status == EscrowStatus::Funded, 'Escrow not funded');
    let (milestone) = escrow_milestones.read(escrow_id, milestone_index);
    assert(!milestone.released, 'Milestone already released');
    assert(details.available_balance >= milestone.amount, 'Insufficient balance');
    // Transfer to payeee
    IERC20Dispatcher{address=details.token}.transfer(details.payee, milestone.amount);
    // Mark milestone as released
    escrow_milestones.write(escrow_id, milestone_index, EscrowMilestone(milestone.amount, true));
    // Update escroww
    let new_released = details.released_amount + milestone.amount;
    let new_balance = details.available_balance - milestone.amount;
    let updated = EscrowDetails(
        details.payer, details.payee, details.token, details.resolver, ArrayTrait::default(), details.status, details.total_amount, new_released, new_balance, details.dispute
    );
    escrows.write(escrow_id, updated);
    emit_event MilestoneReleased(escrow_id, milestone_index, milestone.amount);
    non_reentrant_exit();
}

@external
func release_all_funds(escrow_id: felt252) {
    non_reentrant_enter();
    only_payer(escrow_id);
    let (details) = escrows.read(escrow_id);
    assert(details.status == EscrowStatus::Funded, 'Escrow not funded');
    let (count) = escrow_milestones_count.read(escrow_id);
    let mut i: u32 = 0;
    while i < count {
        let (milestone) = escrow_milestones.read(escrow_id, i);
        if !milestone.released {
            release_milestone(escrow_id, i);
        }
        i += 1;
    }
    non_reentrant_exit();
}

@external
func initiate_dispute(escrow_id: felt252) {
    let (caller) = get_caller_address();
    let (details) = escrows.read(escrow_id);
    assert(caller == details.payer || caller == details.payee, 'Only payer or payee can dispute');
    let updated = EscrowDetails(
        details.payer, details.payee, details.token, details.resolver, ArrayTrait::default(), EscrowStatus::InDispute, details.total_amount, details.released_amount, details.available_balance, details.dispute
    );
    escrows.write(escrow_id, updated);
    emit_event DisputeInitiated(escrow_id);
}

@external
func resolve_dispute(escrow_id: felt252, payee_amount: u256, payer_amount: u256) {
    only_resolver(escrow_id);
    let (details) = escrows.read(escrow_id);
    assert(details.status == EscrowStatus::InDispute, 'Not in dispute');
    let total = payee_amount + payer_amount;
    assert(total <= details.available_balance, 'Resolution exceeds balance');
    // Payouts
    if payee_amount > 0 {
        IERC20Dispatcher{address=details.token}.transfer(details.payee, payee_amount);
    }
    if payer_amount > 0 {
        IERC20Dispatcher{address=details.token}.transfer(details.payer, payer_amount);
    }
    let updated = EscrowDetails(
        details.payer, details.payee, details.token, details.resolver, ArrayTrait::default(), EscrowStatus::Completed, details.total_amount, details.released_amount + payee_amount, details.available_balance - total, DisputeResolution::Split
    );
    escrows.write(escrow_id, updated);
    emit_event DisputeResolved(escrow_id, payee_amount, payer_amount);
}

@external
func request_refund(escrow_id: felt252) {
    non_reentrant_enter();
    only_payer(escrow_id);
    let (details) = escrows.read(escrow_id);
    assert(details.status == EscrowStatus::Pending || details.status == EscrowStatus::Funded, 'Refund not allowed');
    let refund_amount = details.available_balance;
    assert(refund_amount > 0, 'Nothing to refund');
    IERC20Dispatcher{address=details.token}.transfer(details.payer, refund_amount);
    let updated = EscrowDetails(
        details.payer, details.payee, details.token, details.resolver, ArrayTrait::default(), EscrowStatus::Refunded, details.total_amount, details.released_amount, 0, details.dispute
    );
    escrows.write(escrow_id, updated);
    emit_event RefundProcessed(escrow_id, refund_amount);
    non_reentrant_exit();
}

@view
func get_escrow_details(escrow_id: felt252) -> (details: EscrowDetails) {
    let (details) = escrows.read(escrow_id);
    return (details,);
}

@view
func get_available_balance(escrow_id: felt252) -> (balance: u256) {
    let (details) = escrows.read(escrow_id);
    return (details.available_balance,);
}
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
@external
func resolve_dispute(escrow_id: felt252, payee_amount: u256, payer_amount: u256) {
    non_reentrant_enter();
    only_resolver(escrow_id);
    let (details) = escrows.read(escrow_id);
    assert(details.status == EscrowStatus::InDispute, 'Not in dispute');
    let total = payee_amount + payer_amount;
    assert(total <= details.available_balance, 'Resolution exceeds balance');
    // Payouts
    if payee_amount > 0 {
        IERC20Dispatcher{address=details.token}.transfer(details.payee, payee_amount);
    }
    if payer_amount > 0 {
        IERC20Dispatcher{address=details.token}.transfer(details.payer, payer_amount);
    }
    let updated = EscrowDetails(
        details.payer, details.payee, details.token, details.resolver, ArrayTrait::default(), EscrowStatus::Completed, details.total_amount, details.released_amount + payee_amount, details.available_balance - total, DisputeResolution::Split
    );
    escrows.write(escrow_id, updated);
    emit_event DisputeResolved(escrow_id, payee_amount, payer_amount);
    non_reentrant_exit();
}
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
