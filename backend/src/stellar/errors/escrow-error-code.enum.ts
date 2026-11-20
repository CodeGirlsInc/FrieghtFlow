/**
 * Mirrors `EscrowError` in contracts/escrow/src/lib.rs exactly (same
 * variant names, same discriminant numbers). Soroban surfaces contract
 * errors as `Error(Contract, #N)` where N is this discriminant — this
 * enum is how we map that number back to something callers can branch on.
 */
export enum EscrowErrorCode {
  NotInitialized = 1,
  AlreadyInitialized = 2,
  NotFound = 3,
  AlreadyFunded = 4,
  NotFunded = 5,
  InvalidStatus = 6,
  Unauthorized = 7,
  InvalidAmount = 8,
  InsufficientBalance = 9,
}

export function escrowErrorCodeName(code: number): string {
  return EscrowErrorCode[code] ?? `Unknown(${code})`;
}
