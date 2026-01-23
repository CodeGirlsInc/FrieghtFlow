use soroban_sdk::{Address, BytesN, Env};

use crate::{errors::AuditError, storage};

pub fn require_carrier_for_shipment(
    e: &Env,
    shipment_id: &BytesN<32>,
    caller: &Address,
) -> Result<(), AuditError> {
    let carriers = storage::shipment_carrier_map(e);
    let assigned = carriers.get(shipment_id.clone()).ok_or(AuditError::ShipmentNotFound)?;

    if &assigned != caller {
        return Err(AuditError::UnauthorizedCarrier);
    }
    Ok(())
}

pub fn require_verifier(e: &Env, caller: &Address) -> Result<(), AuditError> {
    let verifiers = storage::verifiers_map(e);
    let is_ok = verifiers.get(caller.clone()).unwrap_or(false);

    if !is_ok {
        return Err(AuditError::UnauthorizedVerifier);
    }
    Ok(())
}
