import { formatMoney, DEFAULT_CURRENCY } from './currency';

/** What the call sites used to do inline, for the codes `Intl` accepts. */
const legacyFormat = (value: number | string, currency?: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(Number(value));

describe('formatMoney — valid currencies', () => {
  it('produces exactly the output the previous inline Intl.NumberFormat call did', () => {
    expect(formatMoney(3500, 'USD')).toBe(legacyFormat(3500, 'USD'));
    expect(formatMoney('3500.5', 'USD')).toBe(legacyFormat('3500.5', 'USD'));
    expect(formatMoney(1234.5, 'EUR')).toBe(legacyFormat(1234.5, 'EUR'));
    expect(formatMoney(99, 'NGN')).toBe(legacyFormat(99, 'NGN'));
  });

  it('formats the supported currencies the way en-US currency style does', () => {
    expect(formatMoney(3500, 'USD')).toBe('$3,500.00');
    expect(formatMoney(1234.5, 'EUR')).toBe('€1,234.50');
    expect(formatMoney(1000, 'GBP')).toBe('£1,000.00');
    expect(formatMoney(0, 'JPY')).toBe('¥0');
  });

  it('defaults to USD when the currency is absent, blank or nullish', () => {
    expect(formatMoney(10)).toBe(legacyFormat(10, undefined));
    expect(formatMoney(10, undefined)).toBe('$10.00');
    expect(formatMoney(10, null)).toBe('$10.00');
    expect(formatMoney(10, '')).toBe('$10.00');
    expect(formatMoney(10, '   ')).toBe('$10.00');
    expect(DEFAULT_CURRENCY).toBe('USD');
  });

  it('trims a currency that arrived with stray whitespace', () => {
    expect(formatMoney(5, ' USD ')).toBe('$5.00');
  });

  it('accepts valid ISO-4217 codes outside the creation-time allow-list', () => {
    // 'SEK' is a real ISO-4217 code the platform does not sell shipments in,
    // but shipments stored before the allow-list existed must still render.
    expect(formatMoney(500, 'SEK')).toBe(legacyFormat(500, 'SEK'));
  });
});

describe('formatMoney — invalid currencies never throw', () => {
  it('renders an unassigned-but-well-formed code the way Intl already did', () => {
    // Three ASCII letters never throw, so the previous code did not crash on
    // these — the output must not change. (Intl joins with U+00A0, not a space.)
    expect(formatMoney(1234.5, 'ZZZ')).toBe(legacyFormat(1234.5, 'ZZZ'));
    expect(formatMoney(1234.5, 'ABC')).toBe(legacyFormat(1234.5, 'ABC'));
    expect(formatMoney(1234.5, 'XXX')).toBe(legacyFormat(1234.5, 'XXX'));
    expect(formatMoney(1234.5, 'ZZZ')).toBe('ZZZ\u00A01,234.50');
  });

  it('falls back to a plain decimal for codes Intl rejects outright', () => {
    // These are the values that threw a RangeError and crashed the route.
    expect(formatMoney(1234.5, '123')).toBe('123 1,234.50');
    expect(formatMoney(1234.5, 'US')).toBe('US 1,234.50');
    expect(formatMoney(1234.5, 'U$D')).toBe('U$D 1,234.50');
    expect(formatMoney(1234.5, '12A')).toBe('12A 1,234.50');
  });

  it('does not throw for any of the codes that used to crash the render', () => {
    for (const code of ['123', 'US', 'EU', 'ZZ1', 'U$D', '12A', '$1$']) {
      expect(() => formatMoney(10, code)).not.toThrow();
    }
  });

  it('shows a non-alphabetic code exactly as it was stored', () => {
    expect(formatMoney(7, '123')).toBe('123 7.00');
    expect(formatMoney(7, 'u$d')).toBe('u$d 7.00');
  });

  it('still normalises case for well-formed codes, as Intl does', () => {
    expect(formatMoney(1234.5, 'usd')).toBe(legacyFormat(1234.5, 'usd'));
    expect(formatMoney(1234.5, 'zzz')).toBe(legacyFormat(1234.5, 'zzz'));
  });
});

describe('formatMoney — amount coercion', () => {
  it('coerces the numeric strings a Postgres decimal column can arrive as', () => {
    expect(formatMoney('1234.50', 'USD')).toBe('$1,234.50');
    expect(formatMoney('0.00', 'USD')).toBe('$0.00');
    expect(formatMoney('99.999', 'USD')).toBe('$100.00');
  });

  it('formats zero', () => {
    expect(formatMoney(0, 'USD')).toBe('$0.00');
    expect(formatMoney('0', 'USD')).toBe('$0.00');
  });

  it('treats an empty value as zero, matching Number() coercion', () => {
    expect(formatMoney('', 'USD')).toBe('$0.00');
  });

  it('formats large amounts with thousands separators', () => {
    expect(formatMoney(1234567890.12, 'USD')).toBe(legacyFormat(1234567890.12, 'USD'));
    expect(formatMoney('999999999999.99', 'USD')).toBe(legacyFormat('999999999999.99', 'USD'));
  });

  it('formats negative amounts', () => {
    expect(formatMoney(-1234.5, 'USD')).toBe(legacyFormat(-1234.5, 'USD'));
    expect(formatMoney(-1234.5, '123')).toBe('123 -1,234.50');
    expect(formatMoney(-1234.5, 'ZZZ')).toBe(legacyFormat(-1234.5, 'ZZZ'));
  });

  it('does not throw on NaN or Infinity', () => {
    expect(() => formatMoney('not-a-number', 'USD')).not.toThrow();
    expect(() => formatMoney(Number.POSITIVE_INFINITY, 'USD')).not.toThrow();
    expect(() => formatMoney(Number.NaN, '123')).not.toThrow();
  });
});
