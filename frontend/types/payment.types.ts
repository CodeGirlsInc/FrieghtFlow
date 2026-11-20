export enum PaymentStatus {
  PENDING = 'pending',
  FUNDING = 'funding',
  FUNDED = 'funded',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

export interface Payment {
  id: string;
  shipmentId: string;
  onChainShipmentId: number;
  status: PaymentStatus;
  amount: number;
  assetCode: string;
  tokenContractAddress: string | null;
  shipperWalletAddress: string | null;
  carrierWalletAddress: string | null;
  fundedAt: string | null;
  settledAt: string | null;
  stellarTxHash: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}
