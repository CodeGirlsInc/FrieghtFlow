/**
 * Shipment date validation helpers.
 *
 * Issue BE-269: PATCH /shipments/:id allows setting an estimatedDeliveryDate
 * before pickupDate with no cross-field validation.  These helpers validate
 * the merged dates on update.
 */

/**
 * Returns true if `date` is strictly in the future (UTC).
 */
export function isFutureDate(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Returns true if `delivery` is on or after `pickup`.
 */
export function isDeliveryAfterPickup(pickup: Date, delivery: Date): boolean {
  return delivery.getTime() >= pickup.getTime();
}
