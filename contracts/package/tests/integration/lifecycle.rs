use soroban_sdk::{
    testutils::{Address as _, Ledger, LedgerInfo},
    Address, Env, IntoVal,
};

// Import the generated clients from each contract crate.
use escrow::EscrowContractClient;
use shipment::ShipmentContractClient;

/// Minimal SEP-41-compatible mock token used across all flows.
mod mock_token {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/soroban_token_contract.wasm"
    );
}

struct TestFixture<'a> {
    env:      Env,
    shipment: ShipmentContractClient<'a>,
    escrow:   EscrowContractClient<'a>,
    token:    mock_token::Client<'a>,
    shipper:  Address,
    carrier:  Address,
    admin:    Address,
}

impl<'a> TestFixture<'a> {
    fn setup() -> Self {
        let env = Env::default();
        env.mock_all_auths();

        let admin   = Address::generate(&env);
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);

        // Deploy mock token
        let token_id = env.register_contract_wasm(None, mock_token::WASM);
        let token    = mock_token::Client::new(&env, &token_id);
        token.initialize(&admin, &7u32, &"MockToken".into_val(&env), &"MTK".into_val(&env));
        // Fund the shipper
        token.mint(&shipper, &1_000_000i128);

        // Deploy contracts
        let shipment_id = env.register_contract(None, shipment::ShipmentContract);
        let escrow_id   = env.register_contract(None, escrow::EscrowContract);

        let shipment = ShipmentContractClient::new(&env, &shipment_id);
        let escrow   = EscrowContractClient::new(&env, &escrow_id);

        shipment.initialize(&admin);
        escrow.initialize(&admin, &token_id);

        Self { env, shipment, escrow, token, shipper, carrier, admin }
    }
}

/// create → fund escrow → accept → in_transit → deliver → release → carrier balance increases
#[test]
fn test_happy_path() {
    let f = TestFixture::setup();
    let amount: i128 = 500_000;

    // 1. Create shipment
    let shipment_id = f.shipment.create_shipment(&f.shipper, &f.carrier, &amount);

    // 2. Fund escrow
    f.escrow.fund(&f.shipper, &shipment_id, &amount);
    assert_eq!(f.token.balance(&f.escrow.address), amount);

    // 3. Carrier accepts
    f.shipment.accept_shipment(&f.carrier, &shipment_id);

    // 4. Mark in-transit
    f.shipment.mark_in_transit(&f.carrier, &shipment_id);

    // 5. Deliver
    f.shipment.mark_delivered(&f.carrier, &shipment_id);

    // 6. Release escrow to carrier
    let carrier_balance_before = f.token.balance(&f.carrier);
    f.escrow.release(&f.admin, &shipment_id);

    assert_eq!(
        f.token.balance(&f.carrier),
        carrier_balance_before + amount,
        "carrier balance should increase by the escrowed amount"
    );
    assert_eq!(f.token.balance(&f.escrow.address), 0);
}

/// create → fund → deliver → dispute → admin refunds → shipper balance restored
#[test]
fn test_dispute_path() {
    let f = TestFixture::setup();
    let amount: i128 = 300_000;

    let shipment_id = f.shipment.create_shipment(&f.shipper, &f.carrier, &amount);
    f.escrow.fund(&f.shipper, &shipment_id, &amount);
    f.shipment.accept_shipment(&f.carrier, &shipment_id);
    f.shipment.mark_in_transit(&f.carrier, &shipment_id);
    f.shipment.mark_delivered(&f.carrier, &shipment_id);

    // Open dispute
    f.shipment.open_dispute(&f.shipper, &shipment_id);

    // Admin resolves with a refund to the shipper
    let shipper_balance_before = f.token.balance(&f.shipper);
    f.escrow.refund(&f.admin, &shipment_id);

    assert_eq!(
        f.token.balance(&f.shipper),
        shipper_balance_before + amount,
        "shipper balance should be restored after dispute refund"
    );
    assert_eq!(f.token.balance(&f.escrow.address), 0);
}

/// create → fund → cancel → refund → shipper balance restored
#[test]
fn test_cancellation_path() {
    let f = TestFixture::setup();
    let amount: i128 = 200_000;

    let shipment_id = f.shipment.create_shipment(&f.shipper, &f.carrier, &amount);
    f.escrow.fund(&f.shipper, &shipment_id, &amount);

    let shipper_balance_before = f.token.balance(&f.shipper);

    // Cancel before acceptance
    f.shipment.cancel_shipment(&f.shipper, &shipment_id);
    f.escrow.refund(&f.admin, &shipment_id);

    assert_eq!(
        f.token.balance(&f.shipper),
        shipper_balance_before + amount,
        "shipper balance should be restored after cancellation"
    );
    assert_eq!(f.token.balance(&f.escrow.address), 0);
}