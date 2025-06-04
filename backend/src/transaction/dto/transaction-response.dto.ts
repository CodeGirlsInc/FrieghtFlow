import type { TransactionStatus, TransactionGateway } from "../entities/transaction.entity"

export class TransactionResponseDto {
  id: string
  transactionId: string
  userId: string
  amount: number
  currency: string
  status: TransactionStatus
  gateway: TransactionGateway
  gatewayTransactionId?: string
  metadata: Record<string, any>
  description?: string
  reference?: string
  processedAt?: Date
  failedAt?: Date
  refundedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export class TransactionHistoryResponseDto {
  id: string
  transactionId: string
  previousStatus: TransactionStatus
  newStatus: TransactionStatus
  changes: Record<string, any>
  changedBy?: string
  reason?: string
  createdAt: Date
}

export class PaginatedTransactionsResponseDto {
  data: TransactionResponseDto[]
  total: number
  limit: number
  offset: number
}
