use soroban_sdk::{contracttype, Address, BytesN, Env, Map, Vec};

use crate::types::{Location, Milestone};

#[contracttype]
pub enum DataKey {
    TotalMilestones, // u64
    Milestones,      // Map<u64, Milestone>
    ShipmentIndex,   // Map<BytesN<32>, Vec<u64>>
    CurrentLocation, // Map<BytesN<32>, Location>
    ShipmentCarrier, // Map<BytesN<32>, Address>
    Verifiers,       // Map<Address, bool>
    ShipmentCompleted, // Map<BytesN<32>, bool>
}

pub fn get_total_milestones(e: &Env) -> u64 {
    e.storage()
        .persistent()
        .get(&DataKey::TotalMilestones)
        .unwrap_or(0u64)
}

pub fn set_total_milestones(e: &Env, value: u64) {
    e.storage().persistent().set(&DataKey::TotalMilestones, &value);
}

pub fn milestones_map(e: &Env) -> Map<u64, Milestone> {
    e.storage()
        .persistent()
        .get(&DataKey::Milestones)
        .unwrap_or(Map::new(e))
}

pub fn set_milestones_map(e: &Env, map: &Map<u64, Milestone>) {
    e.storage().persistent().set(&DataKey::Milestones, map);
}

pub fn shipment_index_map(e: &Env) -> Map<BytesN<32>, Vec<u64>> {
    e.storage()
        .persistent()
        .get(&DataKey::ShipmentIndex)
        .unwrap_or(Map::new(e))
}

pub fn set_shipment_index_map(e: &Env, map: &Map<BytesN<32>, Vec<u64>>) {
    e.storage().persistent().set(&DataKey::ShipmentIndex, map);
}

pub fn current_location_map(e: &Env) -> Map<BytesN<32>, Location> {
    e.storage()
        .persistent()
        .get(&DataKey::CurrentLocation)
        .unwrap_or(Map::new(e))
}

pub fn set_current_location_map(e: &Env, map: &Map<BytesN<32>, Location>) {
    e.storage().persistent().set(&DataKey::CurrentLocation, map);
}

pub fn shipment_carrier_map(e: &Env) -> Map<BytesN<32>, Address> {
    e.storage()
        .persistent()
        .get(&DataKey::ShipmentCarrier)
        .unwrap_or(Map::new(e))
}

pub fn set_shipment_carrier_map(e: &Env, map: &Map<BytesN<32>, Address>) {
    e.storage().persistent().set(&DataKey::ShipmentCarrier, map);
}

pub fn verifiers_map(e: &Env) -> Map<Address, bool> {
    e.storage()
        .persistent()
        .get(&DataKey::Verifiers)
        .unwrap_or(Map::new(e))
}

pub fn set_verifiers_map(e: &Env, map: &Map<Address, bool>) {
    e.storage().persistent().set(&DataKey::Verifiers, map);
}

pub fn shipment_completed_map(e: &Env) -> Map<BytesN<32>, bool> {
    e.storage()
        .persistent()
        .get(&DataKey::ShipmentCompleted)
        .unwrap_or(Map::new(e))
}

pub fn set_shipment_completed_map(e: &Env, map: &Map<BytesN<32>, bool>) {
    e.storage().persistent().set(&DataKey::ShipmentCompleted, map);
}
