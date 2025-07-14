import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

export enum TransactionType {
  LOCK = "lock",
  RELEASE = "release",
  REFUND = "refund",
}

export enum TransactionStatus {
  PENDING = "pending",
  SUBMITTED = "submitted",
  CONFIRMED = "confirmed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum Currency {
  ETH = "ETH",
  STRK = "STRK",
  USDC = "USDC",
  USDT = "USDT",
}

@Entity("escrow_transactions")
@Index(["transactionId", "type"])
@Index(["status"])
@Index(["createdAt"])
@Index(["starknetTxHash"])
export class EscrowTransaction {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "transaction_id", type: "varchar", length: 255, unique: true })
  @Index()
  transactionId: string

  @Column({
    type: "enum",
    enum: TransactionType,
  })
  type: TransactionType

  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus

  @Column({
    type: "enum",
    enum: Currency,
    default: Currency.ETH,
  })
  currency: Currency

  @Column({ type: "decimal", precision: 36, scale: 18 })
  amount: string

  @Column({ name: "sender_address", type: "varchar", length: 66 })
  senderAddress: string

  @Column({ name: "recipient_address", type: "varchar", length: 66 })
  recipientAddress: string

  @Column({ name: "contract_address", type: "varchar", length: 66 })
  contractAddress: string

  @Column({ name: "starknet_tx_hash", type: "varchar", length: 66, nullable: true })
  starknetTxHash: string

  @Column({ name: "block_number", type: "bigint", nullable: true })
  blockNumber: string

  @Column({ name: "block_hash", type: "varchar", length: 66, nullable: true })
  blockHash: string

  @Column({ name: "gas_consumed", type: "bigint", nullable: true })
  gasConsumed: string

  @Column({ name: "gas_price", type: "decimal", precision: 36, scale: 18, nullable: true })
  gasPrice: string

  @Column({ name: "execution_status", type: "varchar", length: 50, nullable: true })
  executionStatus: string

  @Column({ name: "finality_status", type: "varchar", length: 50, nullable: true })
  finalityStatus: string

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @Column({ name: "retry_count", type: "int", default: 0 })
  retryCount: number

  @Column({ name: "max_retries", type: "int", default: 3 })
  maxRetries: number

  @Column({ name: "last_error", type: "text", nullable: true })
  lastError: string

  @Column({ name: "expires_at", type: "timestamp", nullable: true })
  expiresAt: Date

  @Column({ name: "confirmed_at", type: "timestamp", nullable: true })
  confirmedAt: Date

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  // Computed properties
  get isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false
  }

  get canRetry(): boolean {
    return this.retryCount < this.maxRetries && this.status === TransactionStatus.FAILED
  }

  get totalGasCost(): string {
    if (!this.gasConsumed || !this.gasPrice) return "0"
    return (BigInt(this.gasConsumed) * BigInt(this.gasPrice)).toString()
  }
}
