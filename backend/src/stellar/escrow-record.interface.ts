/** Mirrors `EscrowStatus` in contracts/escrow/src/lib.rs. */
export type EscrowStatus =
  | 'Pending'
  | 'Funded'
  | 'Released'
  | 'Refunded'
  | 'Disputed';

/** Mirrors `EscrowRecord` in contracts/escrow/src/lib.rs. */
export interface EscrowRecord {
  shipmentId: bigint;
  shipper: string;
  carrier: string;
  amount: bigint;
  status: EscrowStatus;
  fundedAt: bigint;
  settledAt: bigint;
}

/** Result of a write call that the backend signed and submitted itself. */
export interface ContractCallResult {
  txHash: string;
  status: string;
}

/** Result of a cancellation that retained a platform fee (issue #1543). */
export interface CancellationSettlementResult {
  txHash: string;
  status: string;
  /** Fee retained by the platform, in the token's base unit. */
  feeAmount: bigint;
  /** Amount actually returned to the shipper, in the token's base unit. */
  refundAmount: bigint;
}
