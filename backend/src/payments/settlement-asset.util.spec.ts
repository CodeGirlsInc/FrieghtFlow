import { priceToBaseUnits } from './settlement-asset.util';

describe('priceToBaseUnits', () => {
  it('converts a whole-dollar price to 7-decimal base units', () => {
    expect(priceToBaseUnits(50)).toBe(500_000_000n);
  });

  it('converts a fractional-cent price with rounding', () => {
    expect(priceToBaseUnits(1234.56)).toBe(12_345_600_000n);
  });

  it('handles zero', () => {
    expect(priceToBaseUnits(0)).toBe(0n);
  });
});
