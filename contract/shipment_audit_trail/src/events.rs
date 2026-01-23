use soroban_sdk::{Address, BytesN, Env};

use crate::types::{Location, MilestoneType};

pub fn milestone_recorded(
    e: &Env,
    milestone_id: u64,
    shipment_id: &BytesN<32>,
    milestone_type: &MilestoneType,
    location: &Location,
    timestamp: u64,
    recorded_by: &Address,
) {
    e.events().publish(
        ("MilestoneRecorded",),
        (
            milestone_id,
            shipment_id.clone(),
            milestone_type.clone(),
            location.latitude,
            location.longitude,
            timestamp,
            recorded_by.clone(),
        ),
    );
}

pub fn milestone_verified(e: &Env, milestone_id: u64, verifier: &Address, timestamp: u64) {
    e.events().publish(("MilestoneVerified",), (milestone_id, verifier.clone(), timestamp));
}

pub fn exception_reported(
    e: &Env,
    milestone_id: u64,
    shipment_id: &BytesN<32>,
    description: &BytesN<32>,
    timestamp: u64,
) {
    e.events().publish(
        ("ExceptionReported",),
        (milestone_id, shipment_id.clone(), description.clone(), timestamp),
    );
}
