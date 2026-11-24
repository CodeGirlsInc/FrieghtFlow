/**
 * Analytics date-range helpers.
 *
 * Issue BE-270: When `to` is a date-only string (YYYY-MM-DD), `new Date(to)`
 * produces midnight at the start of that day, silently dropping shipments
 * created during the day.  `resolveToDate` adjusts date-only strings to the
 * start of the following day so the range is inclusive.
 *
 * Issue BE-271: `dailyTrends` only returns days that have at least one
 * shipment.  `fillDailyTrends` merges the sparse SQL result into a dense
 * 30-day series so callers always receive exactly one entry per day.
 */

/**
 * Converts a `to` query parameter to a Date that is **exclusive** of the
 * next day (i.e. inclusive of the named day).
 *
 * - `"2024-01-31"`          → `new Date("2024-02-01T00:00:00.000Z")` (whole day included)
 * - `"2024-01-31T23:59:59Z"` → `new Date("2024-01-31T23:59:59Z")`  (exact timestamp)
 */
export function resolveToDate(to: string): Date {
  // A bare date string has exactly 10 characters (YYYY-MM-DD).
  if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    const d = new Date(`${to}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    return d;
  }
  return new Date(to);
}

export interface DailyTrendPoint {
  date: string; // YYYY-MM-DD
  count: number;
}

/**
 * Merges a sparse set of day-count pairs into a dense 30-day series ending
 * today (UTC).  Days not present in `sparse` are filled with `count: 0`.
 */
export function fillDailyTrends(
  sparse: DailyTrendPoint[],
  windowDays = 30,
): DailyTrendPoint[] {
  const lookup = new Map(sparse.map((p) => [p.date, p.count]));
  const result: DailyTrendPoint[] = [];
  const now = new Date();
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i),
    );
    const date = d.toISOString().slice(0, 10);
    result.push({ date, count: lookup.get(date) ?? 0 });
  }
  return result;
}
