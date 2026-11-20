//! A typed shipment outcome for `update_stats`.
//!
//! `update_stats` historically took two independent booleans
//! (`was_on_time`, `was_successful`) even though only one of them is
//! meaningful for any given [`UserType`]: carriers care about punctuality,
//! shippers about completion. The unused boolean was silently discarded, with
//! no documented convention for what callers should pass for it.
//!
//! [`Outcome`] collapses those two booleans into a single value that names
//! exactly one result, so a call can no longer carry a meaningless extra flag.
//! [`Outcome::applies_to`] lets the caller reject an outcome that does not
//! match the user's type instead of quietly ignoring it.

use soroban_sdk::contracttype;

use crate::types::UserType;

/// The result of one completed shipment.
///
/// `OnTime` / `Late` apply to [`UserType::Carrier`];
/// `Success` / `Cancelled` apply to [`UserType::Shipper`].
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Outcome {
    OnTime,
    Late,
    Success,
    Cancelled,
}

impl Outcome {
    /// Whether this outcome is meaningful for `user_type`.
    ///
    /// Callers should treat `false` as [`crate::ReputationError::UserTypeMismatch`]
    /// rather than ignoring the value.
    pub fn applies_to(&self, user_type: &UserType) -> bool {
        matches!(
            (self, user_type),
            (Outcome::OnTime, UserType::Carrier)
                | (Outcome::Late, UserType::Carrier)
                | (Outcome::Success, UserType::Shipper)
                | (Outcome::Cancelled, UserType::Shipper)
        )
    }

    /// Whether this outcome increments the positive counter
    /// (`on_time_count` for carriers, `success_count` for shippers).
    pub fn is_positive(&self) -> bool {
        matches!(self, Outcome::OnTime | Outcome::Success)
    }
}
