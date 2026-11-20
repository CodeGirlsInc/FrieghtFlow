/**
 * Insurance premium calculation utility.
 *
 * Issue BE-266: The 1.5% insurance premium rate was hard-coded in three
 * places (ShipmentsService.create, ShipmentsService.batchCreate, and
 * BidsService.acceptBid).  Centralising the calculation here means the rate
 * can be changed in one place and tested independently.
 *
 * Usage:
 *   import { calculateInsurancePremium } from './insurance-premium.util';
 *   const premium = calculateInsurancePremium(price, isInsured);
 */

/** Default platform rate: 1.5 % of the shipment price. */
export const DEFAULT_INSURANCE_RATE = 0.015;

/**
 * Returns the insurance premium rounded to 2 decimal places, or null when
 * the shipment is not insured.
 *
 * @param price       Shipment/bid price as a number.
 * @param isInsured   Whether the shipment is insured.
 * @param rate        Override rate (defaults to DEFAULT_INSURANCE_RATE).
 */
export function calculateInsurancePremium(
  price: number,
  isInsured: boolean,
  rate = DEFAULT_INSURANCE_RATE,
): number | null {
  if (!isInsured) return null;
  return Math.round(price * rate * 100) / 100;
}
