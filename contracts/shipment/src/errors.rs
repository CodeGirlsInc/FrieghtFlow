use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ShipmentError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    NotFound = 3,
    Unauthorized = 4,
    InvalidStatus = 5,
    InvalidInput = 6,
    NotCarrier = 7,
    NotShipper = 8,
    Paused = 9,
    /// The caller would act as both parties to the shipment — a shipper
    /// accepting their own posting, or an escrow funded with the same address
    /// as shipper and carrier.
    ///
    /// Self-dealing here is not a harmless no-op: it lets one address carry a
    /// shipment from `Created` through to delivery on its own, which
    /// manufactures completed jobs out of nothing and pollutes the reputation
    /// signals derived from them. Rejected up front instead.
    SelfDealing = 10,
}
