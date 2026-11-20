import {
  priceToBaseUnits,
  resolveSettlementAssetDecimals,
} from './settlement-asset.util';

describe('resolveSettlementAssetDecimals', () => {
  it('returns 7 for USDC', () => {
    expect(resolveSettlementAssetDecimals('USDC')).toBe(7);
  });

  it('returns 7 for XLM', () => {
    expect(resolveSettlementAssetDecimals('XLM')).toBe(7);
  });

  it('throws for an unsupported asset code', () => {
    expect(() => resolveSettlementAssetDecimals('USDT')).toThrow(
      'Unsupported settlement asset: USDT',
    );
  });

  it('throws for a typo asset code', () => {
    expect(() => resolveSettlementAssetDecimals('USCC')).toThrow(
      'Unsupported settlement asset: USCC',
    );
  });
});

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

  it('converts using XLM decimals when assetCode is XLM', () => {
    expect(priceToBaseUnits(50, 'XLM')).toBe(500_000_000n);
  });

  it('throws for an unsupported asset code', () => {
    expect(() => priceToBaseUnits(50, 'USDT')).toThrow(
      'Unsupported settlement asset: USDT',
    );
  });
});
