/**
 * Normalises and validates a public tracking number before the database lookup.
 *
 * Tracking numbers are generated upper-case (e.g. `FF-LX2K9A-3F9A1C`).
 * Customers who type lower-case or receive a lowercased link from their mail
 * client would otherwise get a 404.  Trimming also handles accidental
 * whitespace from copy-paste.
 *
 * The format validation rejects obvious junk early so it never reaches the
 * database.
 */
export function normalizeTrackingNumber(raw: string): string {
  return raw.trim().toUpperCase();
}

const TRACKING_NUMBER_PATTERN = /^FF-[A-Z0-9]+-[A-Z0-9]{6}$/;

export function isValidTrackingNumberFormat(trackingNumber: string): boolean {
  return TRACKING_NUMBER_PATTERN.test(trackingNumber);
}
