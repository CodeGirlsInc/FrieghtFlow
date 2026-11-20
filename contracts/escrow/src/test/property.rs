//! Property-based tests for the escrow contract's core invariants.
//!
//! These drive randomised sequences of escrow operations against an
//! independent reference model and verify two invariants on every on-chain
//! state reached:
//!
//! 1. **Funds conservation** — the sum of funds released + refunded across any
//!    sequence of operations never exceeds the total funds deposited. This is
//!    checked directly against the token balance held by the contract after
//!    every operation.
//! 2. **Status transitions** — a shipment's escrow status never skips a
//!    required intermediate state. The reference model encodes the intended
//!    transition machine below, the contract must agree with it on every
//!    operation, and the on-chain status is compared with the model after
//!    every operation.
//!
//! ```text
//! (absent) --fund--> Funded --release/refund--> Released|Refunded
//!                          \--dispute--> Disputed --resolve--> Released|Refunded
//! ```

use proptest::prelude::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{Client as TokenClient, StellarAssetClient},
    Address, Env,
};

use crate::contract::{EscrowContract, EscrowContractClient};
use crate::types::EscrowStatus;

const SHIPMENT_ID: u64 = 1;

/// One escrow operation drawn from the randomised input sequence.
#[derive(Clone, Debug)]
enum Op {
    Fund(i128),
    Release,
    Refund,
    Dispute,
    Resolve(bool),
}

/// Strategy for a single operation. Fund amounts are positive and bounded so
/// the sequence can never exhaust the shipper's balance or overflow `i128`.
fn op_strategy() -> impl Strategy<Value = Op> {
    prop_oneof![
        any::<i128>().prop_map(|n| Op::Fund(n.rem_euclid(100_000) + 1)),
        Just(Op::Release),
        Just(Op::Refund),
        Just(Op::Dispute),
        any::<bool>().prop_map(Op::Resolve),
    ]
}

/// An independent reference model of the escrow's expected state.
///
/// It encodes the documented status machine and the token flows it implies:
/// `deposited` grows by every successful `fund`, `paid_out` grows by every
/// successful release/refund/resolve, and the contract's held balance must
/// always equal `deposited - paid_out >= 0`.
#[derive(Clone, Debug, Default)]
struct Model {
    status: Option<EscrowStatus>,
    amount: i128,
    deposited: i128,
    paid_out: i128,
}

impl Model {
    /// Returns `Ok(())` when the operation is valid (mutating the model), or
    /// `Err(())` when the contract is expected to reject it.
    fn apply(&mut self, op: &Op) -> Result<(), ()> {
        match op {
            Op::Fund(amount) => {
                if self.status.is_some() {
                    return Err(());
                }
                self.status = Some(EscrowStatus::Funded);
                self.amount = *amount;
                self.deposited += *amount;
                Ok(())
            }
            Op::Release => self.settle(EscrowStatus::Released),
            Op::Refund => self.settle(EscrowStatus::Refunded),
            Op::Dispute => {
                if self.status != Some(EscrowStatus::Funded) {
                    return Err(());
                }
                self.status = Some(EscrowStatus::Disputed);
                Ok(())
            }
            Op::Resolve(to_carrier) => {
                if self.status != Some(EscrowStatus::Disputed) {
                    return Err(());
                }
                self.status = Some(if *to_carrier {
                    EscrowStatus::Released
                } else {
                    EscrowStatus::Refunded
                });
                self.paid_out += self.amount;
                Ok(())
            }
        }
    }

    fn settle(&mut self, target: EscrowStatus) -> Result<(), ()> {
        if self.status != Some(EscrowStatus::Funded) {
            return Err(());
        }
        self.status = Some(target);
        self.paid_out += self.amount;
        Ok(())
    }
}

proptest! {
    #![proptest_config(ProptestConfig::with_cases(128))]

    /// Funds released + refunded never exceed funds deposited, the escrow's
    /// status never skips an intermediate state, and the contract agrees with
    /// the reference model on the validity of every operation.
    #[test]
    fn funds_and_status_invariants(ops in prop::collection::vec(op_strategy(), 1..=64)) {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let shipper = Address::generate(&env);
        let carrier = Address::generate(&env);

        // Generous shipper balance so funding can never fail for liquidity.
        let shipper_balance: i128 = 1_000_000_000_000;
        let token_address = env
            .register_stellar_asset_contract_v2(admin.clone())
            .address();
        let sac = StellarAssetClient::new(&env, &token_address);
        sac.mint(&shipper, &shipper_balance);

        let contract_id = env.register(EscrowContract {}, ());
        let client = EscrowContractClient::new(&env, &contract_id);
        client.initialize(&admin, &token_address);

        let token = TokenClient::new(&env, &token_address);
        token.approve(
            &shipper,
            &client.address,
            &shipper_balance,
            &(env.ledger().sequence() + 1_000_000),
        );

        let mut model = Model::default();

        for op in ops {
            let expected = model.apply(&op);

            let outcome = match &op {
                Op::Fund(amount) => {
                    client.try_fund_escrow(&shipper, &carrier, &SHIPMENT_ID, amount)
                }
                Op::Release => client.try_release_payment(&SHIPMENT_ID),
                Op::Refund => client.try_refund_payment(&SHIPMENT_ID),
                Op::Dispute => client.try_raise_dispute(&shipper, &SHIPMENT_ID),
                Op::Resolve(to_carrier) => client.try_resolve_dispute(&SHIPMENT_ID, to_carrier),
            };

            // The contract must agree with the reference model on validity:
            // `try_*` returns Ok(_) on success and Err(_) on any error.
            prop_assert_eq!(outcome.is_ok(), expected.is_ok(), "op {:?}", op);

            // On-chain status must match the model after every operation.
            match model.status {
                Some(status) => {
                    let record = client.try_get_escrow(&SHIPMENT_ID).unwrap().unwrap();
                    prop_assert_eq!(record.status, status);
                }
                None => {
                    prop_assert!(client.try_get_escrow(&SHIPMENT_ID).is_err());
                }
            }

            // Funds conservation: the contract never holds a negative token
            // balance, and payouts never exceed deposits.
            let balance = client.try_get_balance().unwrap().unwrap();
            prop_assert!(balance >= 0, "balance went negative: {}", balance);
            prop_assert_eq!(balance, model.deposited - model.paid_out);
            prop_assert!(
                model.paid_out <= model.deposited,
                "paid out {} but only {} was deposited",
                model.paid_out,
                model.deposited
            );
        }
    }
}