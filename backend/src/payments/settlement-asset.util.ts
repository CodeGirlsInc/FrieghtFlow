// MVP settlement-asset decision (issue #1276): TOKEN_CONTRACT_ADDRESS must be
// a USD-pegged SEP-41 asset (e.g. USDC on Stellar), and Shipment.price (fiat
// decimal, e.g. 1234.56) converts to the contract's i128 base units via a
// fixed decimal shift — no live FX. Stellar SAC-wrapped assets and classic
// assets both use 7 decimal places (see contracts/escrow/src/lib.rs test
// AMOUNT: "500_000_000 // 50 XLM in stroops (7 decimals)"), so this assumes
// the configured token also uses 7. Deliberate simplification, documented
// here rather than derived from the token contract at call time.
export const SETTLEMENT_ASSET_DECIMALS = 7;

const BASE_UNITS_PER_ASSET_UNIT = 10 ** SETTLEMENT_ASSET_DECIMALS;

const SUPPORTED_SETTLEMENT_ASSETS: Record<string, number> = {
  USDC: SETTLEMENT_ASSET_DECIMALS,
  XLM: SETTLEMENT_ASSET_DECIMALS,
};

export function resolveSettlementAssetDecimals(assetCode: string): number {
  const decimals = SUPPORTED_SETTLEMENT_ASSETS[assetCode];
  if (decimals === undefined) {
    throw new Error(`Unsupported settlement asset: ${assetCode}`);
  }
  return decimals;
}

export function priceToBaseUnits(price: number, assetCode = 'USDC'): bigint {
  const decimals = resolveSettlementAssetDecimals(assetCode);
  return BigInt(Math.round(price * 10 ** decimals));
}
