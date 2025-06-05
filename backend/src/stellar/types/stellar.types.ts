export interface StellarAccountInfo {
  accountId: string
  sequence: string
  balances: Array<{
    asset_type: string
    asset_code?: string
    asset_issuer?: string
    balance: string
  }>
  signers: Array<{
    key: string
    weight: number
    type: string
  }>
  thresholds: {
    low_threshold: number
    med_threshold: number
    high_threshold: number
  }
}

export interface PaymentResult {
  transactionHash: string
  successful: boolean
  ledger: number
  createdAt: string
}

export interface EscrowContractData {
  id: string
  sourceAccount: string
  destinationAccount: string
  amount: string
  assetCode?: string
  assetIssuer?: string
  releaseConditions: string[]
  status: EscrowStatus
  createdAt: Date
  expiresAt?: Date
}

export enum EscrowStatus {
  PENDING = "pending",
  RELEASED = "released",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export enum TransactionStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export enum AssetType {
  NATIVE = "native",
  CREDIT_ALPHANUM4 = "credit_alphanum4",
  CREDIT_ALPHANUM12 = "credit_alphanum12",
}
