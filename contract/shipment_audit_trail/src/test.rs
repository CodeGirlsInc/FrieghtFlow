#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, BytesN, Env};

    fn shipment_id(e: &Env) -> BytesN<32> {
        BytesN::from_array(e, &[7; 32])
    }

    fn loc(e: &Env, lat: i128, lng: i128) -> Location {
        Location { latitude: lat, longitude: lng, accuracy_m: Some(5) }
    }

    #[test]
    fn record_milestone_valid_shipment_ok() {
        let e = Env::default();
        let carrier = Address::generate(&e);
        let sid = shipment_id(&e);

        ShipmentAuditTrail::assign_carrier(e.clone(), sid.clone(), carrier.clone());

        let id = ShipmentAuditTrail::record_milestone(
            e.clone(),
            sid,
            MilestoneType::PickupScheduled,
            loc(&e, 6_000_000, 3_000_000),
            BytesN::from_array(&e, &[1; 32]),
            None,
            carrier,
        )
        .unwrap();

        assert_eq!(id, 1);
    }

    #[test]
    fn record_milestone_invalid_shipment_should_fail() {
        let e = Env::default();
        let carrier = Address::generate(&e);

        let result = ShipmentAuditTrail::record_milestone(
            e.clone(),
            shipment_id(&e),
            MilestoneType::PickupScheduled,
            loc(&e, 6_000_000, 3_000_000),
            BytesN::from_array(&e, &[1; 32]),
            None,
            carrier,
        );

        assert!(result.is_err());
    }

    #[test]
    fn record_milestone_unauthorized_should_fail() {
        let e = Env::default();
        let carrier = Address::generate(&e);
        let attacker = Address::generate(&e);
        let sid = shipment_id(&e);

        ShipmentAuditTrail::assign_carrier(e.clone(), sid.clone(), carrier);

        let result = ShipmentAuditTrail::record_milestone(
            e.clone(),
            sid,
            MilestoneType::PickupScheduled,
            loc(&e, 6_000_000, 3_000_000),
            BytesN::from_array(&e, &[1; 32]),
            None,
            attacker,
        );

        assert!(result.is_err());
    }

    #[test]
    fn invalid_location_should_fail() {
        let e = Env::default();
        let carrier = Address::generate(&e);
        let sid = shipment_id(&e);

        ShipmentAuditTrail::assign_carrier(e.clone(), sid.clone(), carrier.clone());

        // invalid latitude > 90 degrees
        let result = ShipmentAuditTrail::record_milestone(
            e.clone(),
            sid,
            MilestoneType::PickupScheduled,
            loc(&e, 100_000_000, 3_000_000),
            BytesN::from_array(&e, &[1; 32]),
            None,
            carrier,
        );

        assert!(result.is_err());
    }

    #[test]
    fn milestone_sequence_validation_should_fail() {
        let e = Env::default();
        let carrier = Address::generate(&e);
        let sid = shipment_id(&e);

        ShipmentAuditTrail::assign_carrier(e.clone(), sid.clone(), carrier.clone());

        // wrong first milestone
        let result = ShipmentAuditTrail::record_milestone(
            e.clone(),
            sid,
            MilestoneType::PickupCompleted,
            loc(&e, 6_000_000, 3_000_000),
            BytesN::from_array(&e, &[2; 32]),
            None,
            carrier,
        );

        assert!(result.is_err());
    }

    #[test]
    fn verify_milestone_only_verifier() {
        let e = Env::default();
        let carrier = Address::generate(&e);
        let verifier = Address::generate(&e);
        let sid = shipment_id(&e);

        ShipmentAuditTrail::assign_carrier(e.clone(), sid.clone(), carrier.clone());
        ShipmentAuditTrail::add_verifier(e.clone(), verifier.clone());

        let mid = ShipmentAuditTrail::record_milestone(
            e.clone(),
            sid,
            MilestoneType::PickupScheduled,
            loc(&e, 6_000_000, 3_000_000),
            BytesN::from_array(&e, &[3; 32]),
            None,
            carrier,
        )
        .unwrap();

        let ok = ShipmentAuditTrail::verify_milestone(e.clone(), mid, verifier);
        assert!(ok.is_ok());
    }
}
