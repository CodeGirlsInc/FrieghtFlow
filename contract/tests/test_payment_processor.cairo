use starknet::testing::{
    deploy_syscall,
    ContractAddress,
};
use starknet::ContractAddress;
use starknet::context::Context;

use payment_processor::IPaymentProcessor;

#[test]
fn test_immediate_payment() {
    // Create a test context
    let mut ctx = Context::new();

    // Deploy the contract
    let contract_address: ContractAddress = deploy_syscall(
        // Path to compiled contract (Scarb will compile it automatically)
        "payment_processor",
        &[],
        &mut ctx
    );

    let processor = IPaymentProcessor { contract_address };

    // Mock values
    let shipment_id: felt252 = 1;
    let payer: ContractAddress = ContractAddress::from_base(0x123);
    let amount: felt252 = 1000;
    let token_address: ContractAddress = ContractAddress::from_base(0x456);
    let payment_type: felt252 = 0; // Immediate

    // Call process_payment
    let payment_id = processor.process_payment(
        shipment_id,
        payer,
        amount,
        token_address,
        payment_type
    );

    assert!(payment_id > 0, "payment_id should be > 0");
}

#[test]
fn test_create_payment_plan() {
    let mut ctx = Context::new();
    let contract_address: ContractAddress = deploy_syscall("payment_processor", &[], &mut ctx);
    let processor = IPaymentProcessor { contract_address };

    let shipment_id: felt252 = 2;
    let total_amount: felt252 = 5000;
    let installments: felt252 = 5;

    let plan_id = processor.create_payment_plan(
        shipment_id,
        total_amount,
        installments
    );

    assert!(plan_id > 0, "plan_id should be > 0");
}