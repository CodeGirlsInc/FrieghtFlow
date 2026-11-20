import { z } from 'zod';
import {
  SUPPORTED_CURRENCIES,
  SUPPORTED_CURRENCIES_HINT,
  SUPPORTED_CURRENCIES_LABEL,
  UNSUPPORTED_CURRENCY_MESSAGE,
  currencySchema,
  isSupportedCurrency,
} from './currency';

describe('SUPPORTED_CURRENCIES', () => {
  it('is a non-empty allow-list of three-letter ISO-4217 codes', () => {
    expect(SUPPORTED_CURRENCIES.length).toBeGreaterThan(0);
    for (const code of SUPPORTED_CURRENCIES) {
      expect(code).toMatch(/^[A-Z]{3}$/);
    }
  });

  it('has no duplicates', () => {
    expect(new Set(SUPPORTED_CURRENCIES).size).toBe(SUPPORTED_CURRENCIES.length);
  });

  it('includes the currencies the platform prices shipments in by default', () => {
    expect(SUPPORTED_CURRENCIES).toContain('USD');
    expect(SUPPORTED_CURRENCIES).toContain('NGN');
  });

  it('is a list of codes Intl.NumberFormat actually accepts', () => {
    for (const code of SUPPORTED_CURRENCIES) {
      expect(() =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: code }),
      ).not.toThrow();
    }
  });
});

describe('isSupportedCurrency', () => {
  it.each([...SUPPORTED_CURRENCIES])('accepts %s', (code) => {
    expect(isSupportedCurrency(code)).toBe(true);
  });

  it('rejects three characters that are not on the list', () => {
    for (const code of ['ZZZ', 'XXX', 'ABC', 'QQQ']) {
      expect(isSupportedCurrency(code)).toBe(false);
    }
  });

  it('rejects wrong casing — ISO-4217 codes are uppercase', () => {
    expect(isSupportedCurrency('usd')).toBe(false);
    expect(isSupportedCurrency('Usd')).toBe(false);
  });

  it('rejects wrong lengths and surrounding whitespace', () => {
    expect(isSupportedCurrency('US')).toBe(false);
    expect(isSupportedCurrency('USDD')).toBe(false);
    expect(isSupportedCurrency(' USD')).toBe(false);
    expect(isSupportedCurrency('USD ')).toBe(false);
  });

  it('rejects non-strings', () => {
    expect(isSupportedCurrency(undefined)).toBe(false);
    expect(isSupportedCurrency(null)).toBe(false);
    expect(isSupportedCurrency(840)).toBe(false);
  });
});

describe('currencySchema', () => {
  const parse = (value: unknown) => currencySchema.safeParse(value);

  it('accepts every allow-listed code', () => {
    for (const code of SUPPORTED_CURRENCIES) {
      expect(parse(code).success).toBe(true);
    }
  });

  it('rejects the three-character codes the old length(3) rule let through', () => {
    // These are the values that made Intl.NumberFormat throw a RangeError.
    for (const code of ['ZZZ', 'XXX', 'ABC']) {
      const result = parse(code);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(UNSUPPORTED_CURRENCY_MESSAGE);
      }
    }
  });

  it('rejects empty, non-string and lowercase values', () => {
    expect(parse('').success).toBe(false);
    expect(parse('usd').success).toBe(false);
    expect(parse(840).success).toBe(false);
    expect(parse(undefined).success).toBe(false);
  });

  it('applies a USD default when composed into an object schema, as the create form does', () => {
    const step3 = z.object({ currency: currencySchema.default('USD') });
    expect(step3.parse({}).currency).toBe('USD');
    expect(step3.parse({ currency: 'NGN' }).currency).toBe('NGN');
    expect(step3.safeParse({ currency: 'ZZZ' }).success).toBe(false);
  });
});

describe('currency copy', () => {
  it('explains the requirement with the full list of supported codes', () => {
    expect(SUPPORTED_CURRENCIES_LABEL).toBe(SUPPORTED_CURRENCIES.join(', '));
    expect(SUPPORTED_CURRENCIES_HINT).toContain('USD');
    for (const code of SUPPORTED_CURRENCIES) {
      expect(SUPPORTED_CURRENCIES_HINT).toContain(code);
    }
  });
});
