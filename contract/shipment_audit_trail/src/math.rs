use crate::types::{Location, COORD_SCALE};

const EARTH_RADIUS_KM: i128 = 6371;

fn to_radians_scaled(deg_scaled: i128) -> i128 {
    // deg_scaled = degrees * 1e6
    // radians = degrees * PI/180
    // We'll approximate PI ≈ 3.141592 (scaled by 1e6)
    let pi_scaled: i128 = 3_141_592;
    // rad_scaled = deg_scaled * pi / 180
    (deg_scaled * pi_scaled) / (180 * COORD_SCALE)
}

/// Very simplified Haversine for on-chain usage.
/// Returns distance in KM (approx integer km).
pub fn haversine_km(a: &Location, b: &Location) -> i128 {
    let lat1 = to_radians_scaled(a.latitude);
    let lat2 = to_radians_scaled(b.latitude);
    let dlat = lat2 - lat1;

    let lon1 = to_radians_scaled(a.longitude);
    let lon2 = to_radians_scaled(b.longitude);
    let dlon = lon2 - lon1;

    // We avoid floating-point by using rough approximation:
    // distance ≈ R * sqrt(dlat^2 + dlon^2) (not perfect but cheap)
    let dlat2 = dlat * dlat;
    let dlon2 = dlon * dlon;
    let approx = isqrt(dlat2 + dlon2);

    // Convert scaled radians to km: R * approx / 1e6
    (EARTH_RADIUS_KM * approx) / COORD_SCALE
}

// integer sqrt
fn isqrt(x: i128) -> i128 {
    if x <= 0 {
        return 0;
    }
    let mut z = x;
    let mut y = (z + 1) / 2;
    while y < z {
        z = y;
        y = (x / y + y) / 2;
    }
    z
}
