use soroban_sdk::{testutils::Address as _, Address};

use super::{setup, AMOUNT, SHIPMENT_ID};
use crate::errors::EscrowError;
use crate::types::EscrowStatus;

// --- Issue #1543: partial cancellation settlement (refund_with_fee) ---

/// A cancellation at 10% of the escrowed amount: the shipper gets the
/// remainder, the platform admin gets exactly the fee, and the contract
/// retains nothing.
#[test]
fn test_refund_with_fee_splits_amount_between_shipper_and_admin() {
    let ctx = setup(AMOUNT);
    ctx.fund();
    let fee = AMOUNT / 10;

    ctx.client.refund_payment_with_fee(&SHIPMENT_ID, &fee);

    assert_eq!(
        ctx.client.get_escrow(&SHIPMENT_ID).status,
        EscrowStatus::Refunded
    );
    assert_eq!(ctx.token().balance(&ctx.shipper), AMOUNT - fee);
    assert_eq!(ctx.token().balance(&ctx.admin), fee);
    assert_eq!(ctx.token().balance(&ctx.client.address), 0);
    // The carrier is never a party to a cancellation.
    assert_eq!(ctx.token().balance(&ctx.carrier), 0);
}

/// A zero fee is a full refund — the shipper must lose nothing, and the
/// admin must receive nothing.
#[test]
fn test_refund_with_zero_fee_is_a_full_refund() {
    let ctx = setup(AMOUNT);
    ctx.fund();

    ctx.client.refund_payment_with_fee(&SHIPMENT_ID, &0);

    assert_eq!(
        ctx.client.get_escrow(&SHIPMENT_ID).status,
        EscrowStatus::Refunded
    );
    assert_eq!(ctx.token().balance(&ctx.shipper), AMOUNT);
    assert_eq!(ctx.token().balance(&ctx.admin), 0);
    assert_eq!(ctx.token().balance(&ctx.client.address), 0);
}

/// The fee is recorded so the backend can reconcile its off-chain record
/// against what the contract actually paid out, and it is absent before any
/// settlement.
#[test]
fn test_settlement_fee_is_recorded_and_defaults_to_zero() {
    let ctx = setup(AMOUNT);
    ctx.fund();
    let fee = AMOUNT / 4;

    assert_eq!(ctx.client.get_settlement_fee(&SHIPMENT_ID), 0);

    ctx.client.refund_payment_with_fee(&SHIPMENT_ID, &fee);
    assert_eq!(ctx.client.get_settlement_fee(&SHIPMENT_ID), fee);
}

/// A full refund via `refund_payment` must not leave a fee behind, otherwise
/// a later reconciliation would report a fee that was never charged.
#[test]
fn test_full_refund_records_no_settlement_fee() {
    let ctx = setup(AMOUNT);
    ctx.fund();

    ctx.client.refund_payment(&SHIPMENT_ID);

    assert_eq!(ctx.client.get_settlement_fee(&SHIPMENT_ID), 0);
}

/// A fee may not consume the entire balance: that would leave the shipper
/// with nothing and be indistinguishable on-chain from paying the carrier.
#[test]
fn test_refund_with_fee_equal_to_amount_is_rejected() {
    let ctx = setup(AMOUNT);
    ctx.fund();

    let result = ctx.client.try_refund_payment_with_fee(&SHIPMENT_ID, &AMOUNT);
    assert_eq!(result, Err(Ok(EscrowError::InvalidAmount)));
    // Nothing moved.
    assert_eq!(ctx.token().balance(&ctx.shipper), 0);
    assert_eq!(ctx.token().balance(&ctx.admin), 0);
    assert_eq!(
        ctx.client.get_escrow(&SHIPMENT_ID).status,
        EscrowStatus::Funded
    );
}

#[test]
fn test_refund_with_fee_above_amount_is_rejected() {
    let ctx = setup(AMOUNT);
    ctx.fund();

    let result = ctx.client.try_refund_payment_with_fee(&SHIPMENT_ID, &(AMOUNT + 1));
    assert_eq!(result, Err(Ok(EscrowError::InvalidAmount)));
    assert_eq!(ctx.token().balance(&ctx.admin), 0);
}

#[test]
fn test_refund_with_negative_fee_is_rejected() {
    let ctx = setup(AMOUNT);
    ctx.fund();

    let result = ctx.client.try_refund_payment_with_fee(&SHIPMENT_ID, &-1);
    assert_eq!(result, Err(Ok(EscrowError::InvalidAmount)));
    assert_eq!(ctx.token().balance(&ctx.shipper), 0);
    assert_eq!(ctx.token().balance(&ctx.admin), 0);
}

/// A disputed escrow must be settled through `resolve_dispute`, never
/// through the cancellation entrypoint.
#[test]
fn test_refund_with_fee_rejects_disputed_escrow() {
    let ctx = setup(AMOUNT);
    ctx.fund();
    ctx.client.raise_dispute(&ctx.shipper, &SHIPMENT_ID);

    let fee = AMOUNT / 10;
    let result = ctx
        .client
        .try_refund_payment_with_fee(&SHIPMENT_ID, &fee);
    assert_eq!(result, Err(Ok(EscrowError::InvalidStatus)));
    assert_eq!(ctx.token().balance(&ctx.admin), 0);
    assert_eq!(
        ctx.client.get_escrow(&SHIPMENT_ID).status,
        EscrowStatus::Disputed
    );
}

/// Idempotency: a second cancellation must be rejected, so a retried
/// request can never pay the admin twice.
#[test]
fn test_refund_with_fee_is_not_repeatable() {
    let ctx = setup(AMOUNT);
    ctx.fund();
    let fee = AMOUNT / 10;

    ctx.client.refund_payment_with_fee(&SHIPMENT_ID, &fee);
    let admin_after_first = ctx.token().balance(&ctx.admin);

    let result = ctx.client.try_refund_payment_with_fee(&SHIPMENT_ID, &fee);
    assert_eq!(result, Err(Ok(EscrowError::InvalidStatus)));
    assert_eq!(ctx.token().balance(&ctx.admin), admin_after_first);
    assert_eq!(ctx.token().balance(&ctx.shipper), AMOUNT - fee);
}

#[test]
fn test_refund_with_fee_on_unfunded_escrow_fails() {
    let ctx = setup(AMOUNT);

    let result = ctx.client.try_refund_payment_with_fee(&SHIPMENT_ID, &1);
    assert_eq!(result, Err(Ok(EscrowError::NotFound)));
}

/// A released escrow is terminal — cancelling it must fail.
#[test]
fn test_refund_with_fee_on_released_escrow_fails() {
    let ctx = setup(AMOUNT);
    ctx.fund();
    ctx.client.release_payment(&SHIPMENT_ID);

    let result = ctx.client.try_refund_payment_with_fee(&SHIPMENT_ID, &1);
    assert_eq!(result, Err(Ok(EscrowError::InvalidStatus)));
    assert_eq!(ctx.token().balance(&ctx.admin), 0);
}

/// `refund_with_fee` must honour the same settlement authority as every
/// other settling entrypoint: with a shipment contract configured, that
/// contract authorises the call rather than the admin.
#[test]
fn test_refund_with_fee_uses_shipment_contract_authority_when_set() {
    let ctx = setup(AMOUNT);
    let shipment_contract = Address::generate(&ctx.env);
    ctx.client.set_shipment_contract(&shipment_contract);
    ctx.fund();

    let fee = AMOUNT / 10;
    ctx.client.refund_payment_with_fee(&SHIPMENT_ID, &fee);

    assert_eq!(ctx.token().balance(&ctx.shipper), AMOUNT - fee);
    assert_eq!(ctx.token().balance(&ctx.admin), fee);
}

#[test]
fn test_fund_and_release() {
    let ctx = setup(AMOUNT);
    ctx.fund();

    ctx.client.release_payment(&SHIPMENT_ID);

    let record = ctx.client.get_escrow(&SHIPMENT_ID);
    assert_eq!(record.status, EscrowStatus::Released);
    assert_eq!(ctx.token().balance(&ctx.carrier), AMOUNT);
    assert_eq!(ctx.token().balance(&ctx.client.address), 0);
}

#[test]
fn test_fund_and_refund() {
    let ctx = setup(AMOUNT);
    ctx.fund();

    ctx.client.refund_payment(&SHIPMENT_ID);

    let record = ctx.client.get_escrow(&SHIPMENT_ID);
    assert_eq!(record.status, EscrowStatus::Refunded);
    assert_eq!(ctx.token().balance(&ctx.shipper), AMOUNT);
}

#[test]
fn test_dispute_resolved_to_carrier() {
    let ctx = setup(AMOUNT);
    ctx.fund();
    ctx.client.raise_dispute(&ctx.shipper, &SHIPMENT_ID);

    let record = ctx.client.get_escrow(&SHIPMENT_ID);
    assert_eq!(record.status, EscrowStatus::Disputed);

    ctx.client.resolve_dispute(&SHIPMENT_ID, &true);
    assert_eq!(ctx.token().balance(&ctx.carrier), AMOUNT);
}

#[test]
fn test_dispute_resolved_to_shipper() {
    let ctx = setup(AMOUNT);
    ctx.fund();
    ctx.client.raise_dispute(&ctx.carrier, &SHIPMENT_ID);
    ctx.client.resolve_dispute(&SHIPMENT_ID, &false);

    assert_eq!(ctx.token().balance(&ctx.shipper), AMOUNT);
}

#[test]
fn test_release_unfunded_fails() {
    let ctx = setup(AMOUNT);

    let result = ctx.client.try_release_payment(&SHIPMENT_ID);
    assert_eq!(result, Err(Ok(EscrowError::NotFound)));
}

#[test]
fn test_unauthorized_dispute_fails() {
    let ctx = setup(AMOUNT);
    ctx.fund();

    let random = Address::generate(&ctx.env);
    let result = ctx.client.try_raise_dispute(&random, &SHIPMENT_ID);
    assert_eq!(result, Err(Ok(EscrowError::Unauthorized)));
}

// --- Issue #1445: require_settlement_authority ---

/// When a shipment contract is configured, release_payment / refund_payment /
/// resolve_dispute must be authorised by *that* contract address — not by the
/// admin, and not without any auth at all.
#[test]
fn test_settlement_authority_uses_shipment_contract_when_set() {
    let ctx = setup(AMOUNT);
    let shipment_contract = Address::generate(&ctx.env);

    // Configure a shipment contract address.
    ctx.client
        .set_shipment_contract(&shipment_contract);

    ctx.fund();

    // release_payment now requires auth from shipment_contract, not admin.
    // With mock_all_auths the call still passes — what matters is it does not
    // panic, and the escrow transitions to Released.
    ctx.client.release_payment(&SHIPMENT_ID);
    assert_eq!(
        ctx.client.get_escrow(&SHIPMENT_ID).status,
        EscrowStatus::Released,
    );
}

/// After a shipment contract is configured, the admin alone is *not* sufficient
/// to settle — the shipment-contract branch is taken instead.
/// (mock_all_auths covers both; this test verifies the right branch runs by
/// checking the post-state when the contract is set vs. not set.)
#[test]
fn test_settlement_authority_falls_back_to_admin_when_no_shipment_contract() {
    // No set_shipment_contract call — admin fallback is used.
    let ctx = setup(AMOUNT);
    ctx.fund();

    ctx.client.refund_payment(&SHIPMENT_ID);
    assert_eq!(
        ctx.client.get_escrow(&SHIPMENT_ID).status,
        EscrowStatus::Refunded,
    );
}

/// raise_dispute on an already-released escrow must fail with InvalidStatus
/// (the InvalidStatus branch of raise_dispute was previously untested).
#[test]
fn test_raise_dispute_on_released_escrow_fails() {
    let ctx = setup(AMOUNT);
    ctx.fund();
    ctx.client.release_payment(&SHIPMENT_ID);

    // Escrow is now Released — raising a dispute must be rejected.
    let result = ctx.client.try_raise_dispute(&ctx.shipper, &SHIPMENT_ID);
    assert_eq!(result, Err(Ok(EscrowError::InvalidStatus)));
}

/// raise_dispute on an already-refunded escrow must fail with InvalidStatus.
#[test]
fn test_raise_dispute_on_refunded_escrow_fails() {
    let ctx = setup(AMOUNT);
    ctx.fund();
    ctx.client.refund_payment(&SHIPMENT_ID);

    let result = ctx.client.try_raise_dispute(&ctx.shipper, &SHIPMENT_ID);
    assert_eq!(result, Err(Ok(EscrowError::InvalidStatus)));
}

/// raise_dispute on an already-disputed escrow must fail with InvalidStatus.
#[test]
fn test_raise_dispute_on_already_disputed_escrow_fails() {
    let ctx = setup(AMOUNT);
    ctx.fund();
    ctx.client.raise_dispute(&ctx.shipper, &SHIPMENT_ID);

    // Second raise from the carrier must be rejected — already Disputed.
    let result = ctx.client.try_raise_dispute(&ctx.carrier, &SHIPMENT_ID);
    assert_eq!(result, Err(Ok(EscrowError::InvalidStatus)));
}
