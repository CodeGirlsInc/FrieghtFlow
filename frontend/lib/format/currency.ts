/**
 * Money formatting that cannot crash a render (FE-192).
 *
 * Every price on the platform is rendered with
 * `new Intl.NumberFormat('en-US', { style: 'currency', currency })`, and that
 * constructor throws a `RangeError` for a currency code it does not know. A
 * shipment with a bogus three-letter `currency` therefore crashed the whole
 * route — shipment card, detail page, public tracking page and the admin
 * dispute queue all share this one failure mode.
 *
 * `formatMoney` is the single safe entry point: it produces byte-identical
 * output to the previous inline `Intl.NumberFormat` call for every code
 * `Intl` accepts, and falls back to a plain decimal with the raw code shown
 * (`123 1,234.50`) for anything else, so a bad code degrades to ugly text
 * instead of a blank page.
 *
 * On the exact throw boundary: `Intl` only rejects a currency that is not
 * *well-formed* — three ASCII letters, case-insensitive. `'ZZZ'` or `'ABC'`
 * are well-formed and do not throw (`Intl` itself renders them as
 * `'ZZZ 1,234.50'`); `'123'`, `'US'` and `'U$D'` do throw a `RangeError`.
 * Both shapes are covered, and the fallback matches `Intl`'s own
 * unassigned-code rendering so the two paths look the same.
 *
 * Deliberately *not* gated on `lib/validation/currency.ts`'s allow-list: that
 * list is a creation-time policy, whereas this is a read path, and shipments
 * stored before the allow-list existed (or with another valid ISO-4217 code
 * accepted by the backend) must keep rendering exactly as they did.
 *
 * `Shipment.price` is a Postgres `decimal` with no TypeORM transformer, so it
 * can arrive as a string despite the `number` TS type — hence the `Number()`
 * coercion.
 */

/** Used when a shipment has no currency recorded (matches the previous `|| 'USD'`). */
export const DEFAULT_CURRENCY = 'USD';

const DECIMAL_FALLBACK = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a monetary amount for display. Never throws.
 *
 * @param value    The amount. A numeric string is coerced; `NaN`/`Infinity`
 *                 are passed through as-is (`Intl` renders them as "NaN" /
 *                 "∞" rather than throwing).
 * @param currency ISO-4217 code. Blank/absent falls back to `USD`, matching
 *                 the previous `shipment.currency || 'USD'` behaviour.
 */
export function formatMoney(
  value: number | string,
  currency?: string | null,
): string {
  const amount = Number(value);
  const code = (currency ?? '').trim() || DEFAULT_CURRENCY;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
    }).format(amount);
  } catch {
    // RangeError: `code` is not a well-formed currency — `Intl` only accepts
    // three ASCII letters, so '123', 'US' and 'U$D' land here.
    return `${code} ${DECIMAL_FALLBACK.format(amount)}`;
  }
}
