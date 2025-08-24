// SPDX-License-Identifier: MIT
// FreightFlow Payment Processor (Cairo 1 / Starknet)

%lang starknet

use core::option::Option;
use core::bool::*;
use core::result::Result::{self, Ok, Err};
use core::traits::{Into, TryInto};
use core::num::traits::Zero;
use core::array::ArrayTrait;
use core::serde::Serde;
use starknet::contract_address::ContractAddress;
use starknet::class_hash::ClassHash;
use starknet::get_caller_address;
use starknet::info::get_block_timestamp;
use starknet::storage::{StorageMap};
use core::integer::u256::{u256_add, u256_sub, u256_mul, u256_div, U256};

const BPS_DENOM: u128 = 10_000;
const SECONDS_PER_DAY: u64 = 86_400;
const DEFAULT_INSTALLMENT_INTERVAL_SECONDS: u64 = 30_u64 * SECONDS_PER_DAY;

// Prevent overflow in fee multiplication: amount * 10_000 < 2^256
// MAX = floor((2^256 - 1) / 10_000)
const MAX_AMOUNT_FOR_FEE_MATH_HIGH: u128 = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF; // placeholder high part not used
// For simplicity in Cairo 1, we gate with a conservative check at runtime instead of a compile-time huge const.

#[derive(Copy, Drop, Serde, PartialEq, Eq)]
enum PaymentType {
    Immediate: 0,
    Escrow: 1,
    Installment: 2,
    COD: 3,
}

#[derive(Copy, Drop, Serde, PartialEq, Eq)]
enum PaymentStatus {
    Pending: 0,       // e.g., COD before delivery
    Completed: 1,
    InEscrow: 2,
    Failed: 3,
}

#[derive(Copy, Drop, Serde)]
struct PaymentDetails {
    id: u128,
    shipment_id: u128,
    payer: ContractAddress,
    token: ContractAddress,
    amount: U256,
    fee: U256,
    net_amount: U256,
    payment_type: PaymentType,
    status: PaymentStatus,
    timestamp: u64,
}

#[derive(Copy, Drop, Serde)]
struct PaymentPlanMeta {
    id: u128,
    shipment_id: u128,
    payer: ContractAddress,
    token: ContractAddress,
    total_amount: U256,
    num_installments: u32,
    created_at: u64,
    completed: bool,
}

#[derive(Copy, Drop, Serde)]
struct InstallmentInfo {
    amount: U256,
    due_timestamp: u64,
    paid: bool,
    paid_timestamp: u64,
    late_fee_charged: U256,
    principal_paid: U256,
}

#[starknet::interface]
trait IERC20<TContractState> {
    fn transfer_from(ref self: TContractState, sender: ContractAddress, recipient: ContractAddress, amount: U256) -> bool;
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: U256) -> bool;
    fn allowance(self: @TContractState, owner: ContractAddress, spender: ContractAddress) -> U256;
    fn balance_of(self: @TContractState, owner: ContractAddress) -> U256;
    fn decimals(self: @TContractState) -> u8;
    fn symbol(self: @TContractState) -> felt252;
}

#[starknet::interface]
trait IEscrow<TContractState> {
    // Minimal hook to park funds; implement in your escrow contract.
    fn deposit(ref self: TContractState, shipment_id: u128, payer: ContractAddress, token: ContractAddress, amount: U256);
}

#[starknet::interface]
trait IPaymentProcessor<TContractState> {
    // Core API (as requested)
    fn process_payment(
        ref self: TContractState,
        shipment_id: u128,
        payer: ContractAddress,
        amount: U256,
        token_address: ContractAddress,
        payment_type: PaymentType,
    ) -> u128;

    fn create_payment_plan(
        ref self: TContractState,
        shipment_id: u128,
        total_amount: U256,
        installments: u32
    ) -> u128;

    fn process_installment(ref self: TContractState, plan_id: u128, installment_index: u32);

    fn get_payment_details(self: @TContractState, payment_id: u128) -> PaymentDetails;

    fn get_payment_plan(self: @TContractState, plan_id: u128) -> PaymentPlanMeta;

    fn calculate_fees(self: @TContractState, amount: U256, payment_type: PaymentType) -> (U256, U256);
}

#[starknet::contract]
mod FreightFlowPayment {
    use super::*;

    // -----------------------
    // Storage
    // -----------------------
    #[storage]
    struct Storage {
        // Incrementing IDs
        next_payment_id: u128,
        next_plan_id: u128,

        // Payments
        payments: StorageMap<u128, PaymentDetails>,

        // Plans
        plans: StorageMap<u128, PaymentPlanMeta>,
        plan_installment_count: StorageMap<u128, u32>,
        // (plan_id, idx) -> InstallmentInfo
        installment: StorageMap<(u128, u32), InstallmentInfo>,

        // Config
        fee_recipient: ContractAddress,
        merchant_recipient: ContractAddress,
        escrow_contract: ContractAddress,
        default_token: ContractAddress,

        // fee rates (bps) per PaymentType
        fee_bps_immediate: u16,
        fee_bps_escrow: u16,
        fee_bps_installment: u16,
        fee_bps_cod: u16,

        // late fee for installments (bps per day)
        late_fee_bps_per_day: u16,

        // interval between installments (seconds)
        installment_interval_secs: u64,
    }

    // -----------------------
    // Events
    // -----------------------
    #[event]
    #[derive(Drop, Serde)]
    enum Event {
        PaymentProcessed(PaymentProcessed),
        PaymentPlanCreated(PaymentPlanCreated),
        InstallmentPaid(InstallmentPaid),
        PaymentFailed(PaymentFailed),
        LateFeeApplied(LateFeeApplied),
        CodDelivered(CodDelivered),
        ConfigUpdated(ConfigUpdated),
    }

    #[derive(Drop, Serde)]
    struct PaymentProcessed {
        payment_id: u128,
        shipment_id: u128,
        payer: ContractAddress,
        token: ContractAddress,
        amount: U256,
        fee: U256,
        net_amount: U256,
        payment_type: PaymentType,
        status: PaymentStatus,
        timestamp: u64,
    }

    #[derive(Drop, Serde)]
    struct PaymentPlanCreated {
        plan_id: u128,
        shipment_id: u128,
        payer: ContractAddress,
        token: ContractAddress,
        total_amount: U256,
        num_installments: u32,
        created_at: u64,
    }

    #[derive(Drop, Serde)]
    struct InstallmentPaid {
        plan_id: u128,
        installment_index: u32,
        payer: ContractAddress,
        principal: U256,
        fee: U256,
        late_fee: U256,
        timestamp: u64,
    }

    #[derive(Drop, Serde)]
    struct PaymentFailed {
        payment_id: u128,
        reason: felt252,
        timestamp: u64,
    }

    #[derive(Drop, Serde)]
    struct LateFeeApplied {
        plan_id: u128,
        installment_index: u32,
        late_fee: U256,
        days_late: u64,
        timestamp: u64,
    }

    #[derive(Drop, Serde)]
    struct CodDelivered {
        payment_id: u128,
        shipment_id: u128,
        payer: ContractAddress,
        token: ContractAddress,
        amount: U256,
        timestamp: u64,
    }

    #[derive(Drop, Serde)]
    struct ConfigUpdated {
        what: felt252,
        when: u64,
    }

    // -----------------------
    // Constructor & Admin
    // -----------------------
    #[constructor]
    fn constructor(
        ref self: ContractState,
        fee_recipient: ContractAddress,
        merchant_recipient: ContractAddress,
        escrow_contract: ContractAddress,
        default_token: ContractAddress,
        fee_bps_immediate: u16,
        fee_bps_escrow: u16,
        fee_bps_installment: u16,
        fee_bps_cod: u16,
        late_fee_bps_per_day: u16,
        installment_interval_secs: u64,
    ) {
        self.next_payment_id.write(1_u128);
        self.next_plan_id.write(1_u128);

        self.fee_recipient.write(fee_recipient);
        self.merchant_recipient.write(merchant_recipient);
        self.escrow_contract.write(escrow_contract);
        self.default_token.write(default_token);

        self.fee_bps_immediate.write(fee_bps_immediate);
        self.fee_bps_escrow.write(fee_bps_escrow);
        self.fee_bps_installment.write(fee_bps_installment);
        self.fee_bps_cod.write(fee_bps_cod);

        self.late_fee_bps_per_day.write(late_fee_bps_per_day);
        let interval = if installment_interval_secs == 0_u64 {
            DEFAULT_INSTALLMENT_INTERVAL_SECONDS
        } else {
            installment_interval_secs
        };
        self.installment_interval_secs.write(interval);

        self.emit(Event::ConfigUpdated(ConfigUpdated { what: 'initialized', when: get_block_timestamp() }));
    }

    // (Optional) simple admin setters — in a production setting, gate these with Ownable/AccessControl.
    #[external]
    fn set_config(
        ref self: ContractState,
        fee_recipient: Option<ContractAddress>,
        merchant_recipient: Option<ContractAddress>,
        escrow_contract: Option<ContractAddress>,
        default_token: Option<ContractAddress>,
        fee_bps_immediate: Option<u16>,
        fee_bps_escrow: Option<u16>,
        fee_bps_installment: Option<u16>,
        fee_bps_cod: Option<u16>,
        late_fee_bps_per_day: Option<u16>,
        installment_interval_secs: Option<u64>,
    ) {
        match fee_recipient { Option::Some(a) => self.fee_recipient.write(a), Option::None => {} }
        match merchant_recipient { Option::Some(a) => self.merchant_recipient.write(a), Option::None => {} }
        match escrow_contract { Option::Some(a) => self.escrow_contract.write(a), Option::None => {} }
        match default_token { Option::Some(a) => self.default_token.write(a), Option::None => {} }
        match fee_bps_immediate { Option::Some(v) => self.fee_bps_immediate.write(v), Option::None => {} }
        match fee_bps_escrow { Option::Some(v) => self.fee_bps_escrow.write(v), Option::None => {} }
        match fee_bps_installment { Option::Some(v) => self.fee_bps_installment.write(v), Option::None => {} }
        match fee_bps_cod { Option::Some(v) => self.fee_bps_cod.write(v), Option::None => {} }
        match late_fee_bps_per_day { Option::Some(v) => self.late_fee_bps_per_day.write(v), Option::None => {} }
        match installment_interval_secs { Option::Some(v) => self.installment_interval_secs.write(v), Option::None => {} }

        self.emit(Event::ConfigUpdated(ConfigUpdated { what: 'updated', when: get_block_timestamp() }));
    }

    // -----------------------
    // IPaymentProcessor
    // -----------------------
    #[external]
    fn process_payment(
        ref self: ContractState,
        shipment_id: u128,
        payer: ContractAddress,
        amount: U256,
        token_address: ContractAddress,
        payment_type: PaymentType,
    ) -> u128 {
        assert(amount > U256::zero(), 'amount=0');

        let (fee, net) = self._calculate_fees_internal(amount, payment_type);
        let now = get_block_timestamp();
        let id = self._next_payment_id();

        // Default status and token
        let mut status = PaymentStatus::Completed;

        match payment_type {
            PaymentType::Immediate => {
                self._transfer_from(token_address, payer, self.fee_recipient.read(), fee);
                self._transfer_from(token_address, payer, self.merchant_recipient.read(), net);
            },
            PaymentType::Escrow => {
                // fee to fee_recipient; net to escrow
                self._transfer_from(token_address, payer, self.fee_recipient.read(), fee);
                let escrow = self.escrow_contract.read();
                self._transfer_from(token_address, payer, escrow, net);
                // Optional: call escrow.deposit for bookkeeping
                let mut escrow_disp: super::IEscrowDispatcher = escrow.into();
                escrow_disp.deposit(shipment_id, payer, token_address, net);
                status = PaymentStatus::InEscrow;
            },
            PaymentType::Installment => {
                // Guided usage: installments should be handled via create_payment_plan/process_installment.
                // We fail here to avoid ambiguity.
                self.emit(Event::PaymentFailed(PaymentFailed { payment_id: id, reason: 'use_installment_flow', timestamp: now }));
                panic_with_felt('installment_via_plan');
            },
            PaymentType::COD => {
                // No transfer yet; mark pending.
                status = PaymentStatus::Pending;
            },
        }

        let pd = PaymentDetails {
            id: id,
            shipment_id: shipment_id,
            payer: payer,
            token: token_address,
            amount: amount,
            fee: fee,
            net_amount: net,
            payment_type: payment_type,
            status: status,
            timestamp: now,
        };
        self.payments.write(id, pd);

        self.emit(Event::PaymentProcessed(PaymentProcessed {
            payment_id: id,
            shipment_id,
            payer,
            token: token_address,
            amount,
            fee,
            net_amount: net,
            payment_type,
            status,
            timestamp: now,
        }));

        id
    }

    #[external]
    fn create_payment_plan(
        ref self: ContractState,
        shipment_id: u128,
        total_amount: U256,
        installments: u32
    ) -> u128 {
        assert(total_amount > U256::zero(), 'total_amount=0');
        assert(installments > 0_u32, 'installments=0');

        let payer = get_caller_address();
        let token = self.default_token.read();
        let now = get_block_timestamp();
        let plan_id = self._next_plan_id();
        let count = installments;

        // Equal split with remainder to last
        let base = u256_div(total_amount, U256 { low: installments.into(), high: 0 });
        let mut acc = U256::zero();
        let mut i: u32 = 0_u32;
        let interval = self.installment_interval_secs.read();

        // Prewrite plan meta
        let meta = PaymentPlanMeta {
            id: plan_id,
            shipment_id,
            payer,
            token,
            total_amount,
            num_installments: count,
            created_at: now,
            completed: false,
        };
        self.plans.write(plan_id, meta);
        self.plan_installment_count.write(plan_id, count);

        // Write each installment
        loop {
            if i == count { break; }
            let due = now + (interval * (i.into()));
            // last installment gets the remainder
            let principal = if i + 1_u32 == count {
                u256_sub(total_amount, acc)
            } else {
                base
            };
            acc = u256_add(acc, principal);
            let info = InstallmentInfo {
                amount: principal,
                due_timestamp: due,
                paid: false,
                paid_timestamp: 0_u64,
                late_fee_charged: U256::zero(),
                principal_paid: U256::zero(),
            };
            self.installment.write((plan_id, i), info);
            i = i + 1_u32;
        }

        self.emit(Event::PaymentPlanCreated(PaymentPlanCreated {
            plan_id,
            shipment_id,
            payer,
            token,
            total_amount,
            num_installments: count,
            created_at: now,
        }));

        plan_id
    }

    #[external]
    fn process_installment(ref self: ContractState, plan_id: u128, installment_index: u32) {
        let meta = self._get_plan(plan_id);
        let mut inst = self._get_installment(plan_id, installment_index);
        assert(!inst.paid, 'installment_already_paid');

        let payer = meta.payer;
        let token = meta.token;

        // fees
        let (processing_fee, _net_dummy) = self._calculate_fees_internal(inst.amount, PaymentType::Installment);

        // late fee
        let now = get_block_timestamp();
        let mut late_fee = U256::zero();
        if now > inst.due_timestamp {
            let days_late = (now - inst.due_timestamp) / SECONDS_PER_DAY;
            if days_late > 0_u64 {
                let per_day_bps = self.late_fee_bps_per_day.read();
                late_fee = self._mul_bps(inst.amount, per_day_bps.into());
                // multiply by days
                let days_u256 = U256 { low: days_late.into(), high: 0 };
                late_fee = u256_mul(late_fee, days_u256);
                self.emit(Event::LateFeeApplied(LateFeeApplied {
                    plan_id,
                    installment_index,
                    late_fee,
                    days_late,
                    timestamp: now,
                }));
            }
        }

        // transfers: fee -> fee_recipient, principal -> merchant_recipient, late -> fee_recipient (late fee retained by platform)
        let fee_rcpt = self.fee_recipient.read();
        let merch_rcpt = self.merchant_recipient.read();

        self._transfer_from(token, payer, fee_rcpt, processing_fee);
        if late_fee > U256::zero() {
            self._transfer_from(token, payer, fee_rcpt, late_fee);
        }
        self._transfer_from(token, payer, merch_rcpt, inst.amount);

        inst.paid = true;
        inst.paid_timestamp = now;
        inst.late_fee_charged = late_fee;
        inst.principal_paid = inst.amount;
        self.installment.write((plan_id, installment_index), inst);

        // If all paid, flag plan as completed
        let total = self.plan_installment_count.read(plan_id);
        let mut idx: u32 = 0_u32;
        let mut all_paid = true;
        loop {
            if idx == total { break; }
            let it = self.installment.read((plan_id, idx));
            if !it.paid { all_paid = false; break; }
            idx = idx + 1_u32;
        }
        if all_paid {
            let mut m = meta;
            m.completed = true;
            self.plans.write(plan_id, m);
        }

        self.emit(Event::InstallmentPaid(InstallmentPaid {
            plan_id,
            installment_index,
            payer,
            principal: inst.amount,
            fee: processing_fee,
            late_fee,
            timestamp: now,
        }));
    }

    #[view]
    fn get_payment_details(self: @ContractState, payment_id: u128) -> PaymentDetails {
        self.payments.read(payment_id)
    }

    #[view]
    fn get_payment_plan(self: @ContractState, plan_id: u128) -> PaymentPlanMeta {
        self.plans.read(plan_id)
    }

    #[view]
    fn calculate_fees(self: @ContractState, amount: U256, payment_type: PaymentType) -> (U256, U256) {
        self._calculate_fees_internal(amount, payment_type)
    }

    // -----------------------
    // COD completion hook
    // -----------------------
    #[external]
    fn mark_cod_delivered(ref self: ContractState, payment_id: u128) {
        // In practice, gate this with FreightFlow’s delivery oracle or authorized role.
        let mut pd = self.payments.read(payment_id);
        assert(pd.payment_type == PaymentType::COD, 'not_COD');
        assert(pd.status == PaymentStatus::Pending, 'COD_not_pending');

        // Perform transfers now
        self._transfer_from(pd.token, pd.payer, self.fee_recipient.read(), pd.fee);
        self._transfer_from(pd.token, pd.payer, self.merchant_recipient.read(), pd.net_amount);

        pd.status = PaymentStatus::Completed;
        self.payments.write(payment_id, pd);

        self.emit(Event::CodDelivered(CodDelivered {
            payment_id,
            shipment_id: pd.shipment_id,
            payer: pd.payer,
            token: pd.token,
            amount: pd.amount,
            timestamp: get_block_timestamp(),
        }));
    }

    // -----------------------
    // Internal helpers
    // -----------------------
    fn _next_payment_id(ref self: ContractState) -> u128 {
        let id = self.next_payment_id.read();
        self.next_payment_id.write(id + 1_u128);
        id
    }

    fn _next_plan_id(ref self: ContractState) -> u128 {
        let id = self.next_plan_id.read();
        self.next_plan_id.write(id + 1_u128);
        id
    }

    fn _get_plan(self: @ContractState, plan_id: u128) -> PaymentPlanMeta {
        let meta = self.plans.read(plan_id);
        assert(meta.id == plan_id, 'plan_not_found');
        meta
    }

    fn _get_installment(self: @ContractState, plan_id: u128, idx: u32) -> InstallmentInfo {
        let total = self.plan_installment_count.read(plan_id);
        assert(idx < total, 'installment_oob');
        let it = self.installment.read((plan_id, idx));
        it
    }

    fn _calculate_fees_internal(self: @ContractState, amount: U256, payment_type: PaymentType) -> (U256, U256) {
        assert(amount > U256::zero(), 'amount=0');
        // very conservative overflow guard: require amount.low <= (2^128-1)/10000
        // (You can refine this if you want the absolute 256-bit bound.)
        assert(amount.high == 0, 'amount_too_large_for_fee_math');

        let bps: u16 = match payment_type {
            PaymentType::Immediate => self.fee_bps_immediate.read(),
            PaymentType::Escrow => self.fee_bps_escrow.read(),
            PaymentType::Installment => self.fee_bps_installment.read(),
            PaymentType::COD => self.fee_bps_cod.read(),
        };

        let fee = self._mul_bps(amount, bps.into());
        let net = u256_sub(amount, fee);
        (fee, net)
    }

    fn _mul_bps(self: @ContractState, amount: U256, bps: U256) -> U256 {
        // fee = (amount * bps) / 10_000
        let prod = u256_mul(amount, bps);
        let denom = U256 { low: BPS_DENOM.into(), high: 0 };
        u256_div(prod, denom)
    }

    fn _transfer_from(ref self: ContractState, token: ContractAddress, from: ContractAddress, to: ContractAddress, amount: U256) {
        if amount == U256::zero() { return (); }
        let mut erc20: super::IERC20Dispatcher = token.into();
        let ok = erc20.transfer_from(from, to, amount);
        assert(ok, 'ERC20_transfer_from_failed');
    }

    // -------------- Views for config (optional convenience) --------------
    #[view]
    fn get_config(self: @ContractState) -> (
        ContractAddress, ContractAddress, ContractAddress, ContractAddress,
        u16, u16, u16, u16, u16, u64
    ) {
        (
            self.fee_recipient.read(),
            self.merchant_recipient.read(),
            self.escrow_contract.read(),
            self.default_token.read(),
            self.fee_bps_immediate.read(),
            self.fee_bps_escrow.read(),
            self.fee_bps_installment.read(),
            self.fee_bps_cod.read(),
            self.late_fee_bps_per_day.read(),
            self.installment_interval_secs.read(),
        )
    }
}