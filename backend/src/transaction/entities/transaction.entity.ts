import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  BeforeUpdate,
  AfterUpdate,
} from "typeorm"
import { TransactionHistory } from "./transaction-history.entity"

export enum TransactionStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
  PARTIALLY_REFUNDED = "partially_refunded",
  CANCELLED = "cancelled",
}

export enum TransactionGateway {
  STRIPE = "stripe",
  PAYPAL = "paypal",
  STELLAR = "stellar",
  BANK_TRANSFER = "bank_transfer",
  CRYPTO = "crypto",
  INTERNAL = "internal",
  OTHER = "other",
}

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255, unique: true })
  @Index()
  transactionId: string

  @Column({ type: "uuid" })
  @Index()
  userId: string

  @Column({ type: "decimal", precision: 20, scale: 8 })
  amount: number

  @Column({ type: "varchar", length: 10 })
  currency: string

  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  @Index()
  status: TransactionStatus

  @Column({
    type: "enum",
    enum: TransactionGateway,
    default: TransactionGateway.OTHER,
  })
  @Index()
  gateway: TransactionGateway

  @Column({ type: "varchar", length: 255, nullable: true })
  gatewayTransactionId: string

  @Column({ type: "jsonb", default: {} })
  metadata: Record<string, any>

  @Column({ type: "varchar", length: 500, nullable: true })
  description: string

  @Column({ type: "varchar", length: 255, nullable: true })
  reference: string

  @Column({ type: "timestamp", nullable: true })
  processedAt: Date

  @Column({ type: "timestamp", nullable: true })
  failedAt: Date

  @Column({ type: "timestamp", nullable: true })
  refundedAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(
    () => TransactionHistory,
    (history) => history.transaction,
  )
  history: TransactionHistory[]

  // Track changes for immutability
  @BeforeUpdate()
  beforeUpdate() {
    // This will be used to capture the current state before update
    this.captureCurrentState = { ...this }
  }

  @AfterUpdate()
  afterUpdate() {
    // This would be handled by a subscriber in a real implementation
    // Here we're just showing the concept
  }

  // Not persisted, just for tracking changes
  private captureCurrentState: Partial<Transaction>
}
