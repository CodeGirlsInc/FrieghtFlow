#![no_std]

use soroban_sdk::{contracterror, panic_with_error, Env};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum EscrowError {
    NotInitialized = 1,
    Unauthorized = 2,
    InvalidAmount = 3,
    EscrowExists = 4,
    PaymentNotFound = 5,
    InvalidStatus = 6,
    DisputeWindowExpired = 7,
}

pub fn fail(env: &Env, err: EscrowError) -> ! {
    panic_with_error!(env, err);
}
