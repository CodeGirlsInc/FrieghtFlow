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
