use soroban_sdk::Env;

use crate::{
    errors::AuditError,
    types::{Location, MilestoneType, COORD_SCALE},
};

pub fn validate_location(_e: &Env, loc: &Location) -> Result<(), AuditError> {
    // latitude must be between -90 and +90
    let lat_min = -90i128 * COORD_SCALE;
    let lat_max = 90i128 * COORD_SCALE;

    // longitude between -180 and +180
    let lng_min = -180i128 * COORD_SCALE;
    let lng_max = 180i128 * COORD_SCALE;

    if loc.latitude < lat_min || loc.latitude > lat_max {
        return Err(AuditError::InvalidLocation);
    }

    if loc.longitude < lng_min || loc.longitude > lng_max {
        return Err(AuditError::InvalidLocation);
    }

    Ok(())
}

/// Enforce logical milestone order:
/// - PickupScheduled must be first
/// - PickupCompleted after PickupScheduled
/// - DeliveryCompleted must be last
/// - No milestone after DeliveryCompleted
pub fn validate_sequence(
    prev: Option<MilestoneType>,
    next: &MilestoneType,
) -> Result<(), AuditError> {
    match prev {
        None => {
            if *next != MilestoneType::PickupScheduled {
                return Err(AuditError::InvalidMilestoneSequence);
            }
        }
        Some(MilestoneType::DeliveryCompleted) => {
            return Err(AuditError::ShipmentCompleted);
        }
        Some(MilestoneType::PickupScheduled) => {
            // cannot jump to DeliveryCompleted immediately
            if *next == MilestoneType::DeliveryCompleted {
                return Err(AuditError::InvalidMilestoneSequence);
            }
        }
        Some(_) => {}
    }

    // PickupCompleted cannot come before PickupScheduled is enforced above
    // DeliveryCompleted must come last is enforced by ShipmentCompleted logic

    Ok(())
}

pub fn is_exception(m: &MilestoneType) -> bool {
    matches!(m, MilestoneType::ExceptionReported)
}
