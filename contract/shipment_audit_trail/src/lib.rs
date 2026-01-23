#![no_std]

use soroban_sdk::{contract, contractimpl, Address, BytesN, Env, Vec};

mod access;
mod errors;
mod events;
mod math;
mod storage;
mod types;
mod validators;

use errors::AuditError;
use types::{Location, Milestone, MilestoneType};

#[contract]
pub struct ShipmentAuditTrail;

#[contractimpl]
impl ShipmentAuditTrail {
    // -------------------------------
    // Admin / Setup (minimal)
    // -------------------------------

    /// Assign carrier for a shipment (integration point, can be called by Shipment contract later)
    pub fn assign_carrier(e: Env, shipment_id: BytesN<32>, carrier: Address) {
        let mut carriers = storage::shipment_carrier_map(&e);
        carriers.set(shipment_id, carrier);
        storage::set_shipment_carrier_map(&e, &carriers);
    }

    /// Add verifier (could be customs authority, hub operator, etc.)
    pub fn add_verifier(e: Env, verifier: Address) {
        let mut v = storage::verifiers_map(&e);
        v.set(verifier, true);
        storage::set_verifiers_map(&e, &v);
    }

    // -------------------------------
    // Core: Record Milestone
    // -------------------------------
    pub fn record_milestone(
        e: Env,
        shipment_id: BytesN<32>,
        milestone_type: MilestoneType,
        location: Location,
        description: BytesN<32>,
        photo_hash: Option<BytesN<32>>,
        caller: Address,
    ) -> Result<u64, AuditError> {
        // ✅ shipment existence via assigned carrier storage
        access::require_carrier_for_shipment(&e, &shipment_id, &caller)?;

        // ✅ block if shipment already completed
        let completed = storage::shipment_completed_map(&e)
            .get(shipment_id.clone())
            .unwrap_or(false);

        if completed {
            return Err(AuditError::ShipmentCompleted);
        }

        // ✅ validate location ranges
        validators::validate_location(&e, &location)?;

        // ✅ validate milestone sequence using last recorded milestone
        let shipment_index = storage::shipment_index_map(&e);
        let ids = shipment_index.get(shipment_id.clone()).unwrap_or(Vec::new(&e));

        let prev_type = if ids.len() == 0 {
            None
        } else {
            let all = storage::milestones_map(&e);
            let last_id = ids.get(ids.len() - 1).unwrap();
            let last = all.get(last_id).ok_or(AuditError::MilestoneNotFound)?;
            Some(last.milestone_type)
        };

        validators::validate_sequence(prev_type, &milestone_type)?;

        // ✅ generate milestone_id
        let next_id = storage::get_total_milestones(&e) + 1;
        storage::set_total_milestones(&e, next_id);

        let ts = e.ledger().timestamp();

        let milestone = Milestone {
            milestone_id: next_id,
            shipment_id: shipment_id.clone(),
            milestone_type: milestone_type.clone(),
            location: location.clone(),
            timestamp: ts,
            recorded_by: caller.clone(),
            description: description.clone(),
            photo_hash: photo_hash.clone(),
            is_verified: false,
        };

        // store milestone by id
        let mut milestones = storage::milestones_map(&e);
        milestones.set(next_id, milestone);
        storage::set_milestones_map(&e, &milestones);

        // push into shipment milestone list (chronological)
        let mut idx = storage::shipment_index_map(&e);
        let mut list = idx.get(shipment_id.clone()).unwrap_or(Vec::new(&e));
        list.push_back(next_id);
        idx.set(shipment_id.clone(), list);
        storage::set_shipment_index_map(&e, &idx);

        // update current location
        let mut loc_map = storage::current_location_map(&e);
        loc_map.set(shipment_id.clone(), location.clone());
        storage::set_current_location_map(&e, &loc_map);

        // mark completed shipment if milestone is DeliveryCompleted
        if milestone_type == MilestoneType::DeliveryCompleted {
            let mut done = storage::shipment_completed_map(&e);
            done.set(shipment_id.clone(), true);
            storage::set_shipment_completed_map(&e, &done);
        }

        // events
        events::milestone_recorded(&e, next_id, &shipment_id, &milestone_type, &location, ts, &caller);

        // exception event
        if validators::is_exception(&milestone_type) {
            events::exception_reported(&e, next_id, &shipment_id, &description, ts);
        }

        Ok(next_id)
    }

    // -------------------------------
    // Verify Milestone
    // -------------------------------
    pub fn verify_milestone(e: Env, milestone_id: u64, caller: Address) -> Result<(), AuditError> {
        access::require_verifier(&e, &caller)?;

        let mut milestones = storage::milestones_map(&e);
        let mut milestone = milestones.get(milestone_id).ok_or(AuditError::MilestoneNotFound)?;

        milestone.is_verified = true;
        milestones.set(milestone_id, milestone);
        storage::set_milestones_map(&e, &milestones);

        events::milestone_verified(&e, milestone_id, &caller, e.ledger().timestamp());
        Ok(())
    }

    // -------------------------------
    // Public Read Functions
    // -------------------------------
    pub fn get_milestone(e: Env, milestone_id: u64) -> Result<Milestone, AuditError> {
        let milestones = storage::milestones_map(&e);
        milestones.get(milestone_id).ok_or(AuditError::MilestoneNotFound)
    }

    pub fn get_shipment_milestones(e: Env, shipment_id: BytesN<32>) -> Vec<u64> {
        let idx = storage::shipment_index_map(&e);
        idx.get(shipment_id).unwrap_or(Vec::new(&e))
    }

    pub fn get_current_location(e: Env, shipment_id: BytesN<32>) -> Result<Location, AuditError> {
        let locs = storage::current_location_map(&e);
        locs.get(shipment_id).ok_or(AuditError::ShipmentNotFound)
    }

    pub fn get_milestones_in_range(
        e: Env,
        shipment_id: BytesN<32>,
        start_timestamp: u64,
        end_timestamp: u64,
    ) -> Result<Vec<u64>, AuditError> {
        if start_timestamp > end_timestamp {
            return Err(AuditError::InvalidTimeRange);
        }

        let ids = Self::get_shipment_milestones(e.clone(), shipment_id.clone());
        let milestones = storage::milestones_map(&e);

        let mut result = Vec::new(&e);
        for id in ids.iter() {
            if let Some(m) = milestones.get(id) {
                if m.timestamp >= start_timestamp && m.timestamp <= end_timestamp {
                    result.push_back(id);
                }
            }
        }

        Ok(result)
    }

    pub fn calculate_distance_traveled(e: Env, shipment_id: BytesN<32>) -> Result<i128, AuditError> {
        let ids = Self::get_shipment_milestones(e.clone(), shipment_id.clone());
        if ids.len() < 2 {
            return Ok(0);
        }

        let milestones = storage::milestones_map(&e);

        let mut total_km: i128 = 0;
        let mut prev = milestones
            .get(ids.get(0).unwrap())
            .ok_or(AuditError::MilestoneNotFound)?;

        for i in 1..ids.len() {
            let curr = milestones
                .get(ids.get(i).unwrap())
                .ok_or(AuditError::MilestoneNotFound)?;

            total_km += math::haversine_km(&prev.location, &curr.location);
            prev = curr;
        }

        Ok(total_km)
    }

    pub fn validate_route_progress(e: Env, shipment_id: BytesN<32>) -> Result<bool, AuditError> {
        let ids = Self::get_shipment_milestones(e.clone(), shipment_id.clone());
        let milestones = storage::milestones_map(&e);

        let mut prev: Option<MilestoneType> = None;

        for id in ids.iter() {
            let m = milestones.get(id).ok_or(AuditError::MilestoneNotFound)?;
            if validators::validate_sequence(prev.clone(), &m.milestone_type).is_err() {
                return Ok(false);
            }
            prev = Some(m.milestone_type);
        }

        Ok(true)
    }
}
