/**
 * Supported currencies (FE-192).
 *
 * A shipment's `currency` is stored as free text and is later handed to
 * `new Intl.NumberFormat(..., { style: 'currency', currency })` on every page
 * that renders a price. `Intl.NumberFormat` **throws a `RangeError`** for a
 * code it does not recognise, so a shipment saved with a bogus three-letter
 * value ('ZZZ') takes down price rendering everywhere that shipment appears.
 *
 * ISO-4217 has ~180 active codes and there is no dependency-free way to read
 * the canonical registry at runtime, so this is an explicit allow-list of the
 * currencies the platform actually supports — the set of the economies the
 * lanes and settlement rails are built around. It is intentionally narrower
 * than ISO-4217: the backend accepts any valid ISO-4217 code
 * (`@IsISO4217CurrencyCode()` on `CreateShipmentDto`), so this list is the
 * stricter of the two gates, and anything it rejects is also rejected at the
 * API. Adding a currency is a one-line change to the array below.
 *
 * Note the split with `lib/format/currency.ts`: this allow-list is a
 * *creation-time* policy and is deliberately not used to decide how to format
 * an already-stored price. Read paths accept every code `Intl` accepts, so
 * shipments created before this list existed keep rendering exactly as before.
 */
import { z } from 'zod';

export const SUPPORTED_CURRENCIES = [
  'USD', // US Dollar
  'EUR', // Euro
  'GBP', // Pound Sterling
  'NGN', // Nigerian Naira
  'GHS', // Ghanaian Cedi
  'ZAR', // South African Rand
  'KES', // Kenyan Shilling
  'CAD', // Canadian Dollar
  'AUD', // Australian Dollar
  'JPY', // Japanese Yen
  'CHF', // Swiss Franc
  'CNY', // Chinese Yuan
  'INR', // Indian Rupee
  'AED', // UAE Dirham
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

const SUPPORTED_CURRENCY_SET: ReadonlySet<string> = new Set(SUPPORTED_CURRENCIES);

/** Human-readable list for inline help text and validation messages. */
export const SUPPORTED_CURRENCIES_LABEL = SUPPORTED_CURRENCIES.join(', ');

/** True only for an exact, correctly-cased allow-listed currency code. */
export function isSupportedCurrency(value: unknown): value is SupportedCurrency {
  return typeof value === 'string' && SUPPORTED_CURRENCY_SET.has(value);
}

/**
 * Inline validation message. Kept short on purpose — the allowed codes are
 * listed separately in `SUPPORTED_CURRENCIES_HINT`, which renders under the
 * field, rather than cramming 14 codes into a narrow error line.
 */
export const UNSUPPORTED_CURRENCY_MESSAGE = 'Unsupported currency code';

/** Help text under the currency field explaining the requirement. */
export const SUPPORTED_CURRENCIES_HINT =
  `Use one of the supported currency codes: ${SUPPORTED_CURRENCIES_LABEL}.`;

/**
 * The currency field's zod schema — the single source of truth for both the
 * allow-list and the message, so the form and its tests cannot drift apart.
 * Drop it into an object schema with `.default('USD')` if the caller needs the
 * default applied (the create-shipment form does).
 */
export const currencySchema = z
  .string()
  .refine(isSupportedCurrency, { message: UNSUPPORTED_CURRENCY_MESSAGE });
