/**
 * Client-side mirrors of the backend `CreateShipmentDto` bounds (#1839).
 *
 * The zod step schemas in `app/(dashboard)/shipments/new/page.tsx` use these
 * so a violating field blocks on the step it belongs to, instead of
 * surfacing as a generic 400 on the final submit. Keep in sync with
 * backend/src/shipments/dto/create-shipment.dto.ts.
 */

/** origin/destination — `@MaxLength(255)`. */
export const ROUTE_FIELD_MAX_LENGTH = 255;

/** cargoDescription — `@MaxLength(2000)`. */
export const CARGO_DESCRIPTION_MAX_LENGTH = 2000;

/** price — `@Max(1_000_000)`. */
export const PRICE_MAX = 1_000_000;

/** price — `@IsNumber({ maxDecimalPlaces: 2 })`. */
export const PRICE_MAX_DECIMALS = 2;

/** weightKg — `@IsNumber({ maxDecimalPlaces: 2 })`. */
export const WEIGHT_MAX_DECIMALS = 2;

/** volumeCbm — `@IsNumber({ maxDecimalPlaces: 3 })`. */
export const VOLUME_MAX_DECIMALS = 3;

/**
 * Predicate mirroring `@IsNumber({ maxDecimalPlaces })` — the installed
 * zod (4.3.6) has no `maxDecimals` check yet, so the value is compared
 * against itself rounded to the allowed places (with a tolerance for
 * binary float noise such as `0.1 + 0.2`).
 */
export function atMostDecimalPlaces(places: number) {
  return (value: number | string | undefined): boolean => {
    // The volume field is optional: `''` (and the untouched value) stay
    // valid so the "no volume" path is unaffected by the bound.
    if (value === '' || value === undefined) return true;
    const amount = Number(value);
    return (
      Number.isFinite(amount) &&
      Math.abs(amount - Number(amount.toFixed(places))) < 1e-9
    );
  };
}
