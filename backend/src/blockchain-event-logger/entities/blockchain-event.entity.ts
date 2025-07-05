import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm"

export enum EventStatus {
  PENDING = "pending",
  PROCESSED = "processed",
  FAILED = "failed",
  RETRYING = "retrying",
}

export enum EventType {
  DELIVERY_CONFIRMED = "delivery_confirmed",
  ESCROW_RELEASED = "escrow_released",
  ESCROW_CREATED = "escrow_created",
  PAYMENT_PROCESSED = "payment_processed",
  SHIPMENT_CREATED = "shipment_created",
  DISPUTE_RAISED = "dispute_raised",
  DISPUTE_RESOLVED = "dispute_resolved",
  CONTRACT_DEPLOYED = "contract_deployed",
}

@Entity("blockchain_events")
@Index(["contractAddress", "eventType"])
@Index(["blockNumber", "transactionHash"])
@Index(["status", "createdAt"])
export class BlockchainEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 66 })
  @Index()
  transactionHash: string

  @Column({ length: 66 })
  @Index()
  contractAddress: string

  @Column({
    type: "enum",
    enum: EventType,
  })
  eventType: EventType

  @Column({ type: "bigint" })
  @Index()
  blockNumber: bigint

  @Column({ type: "int" })
  logIndex: number

  @Column({ type: "jsonb" })
  eventData: Record<string, any>

  @Column({ type: "jsonb", nullable: true })
  decodedData: Record<string, any>

  @Column({
    type: "enum",
    enum: EventStatus,
    default: EventStatus.PENDING,
  })
  status: EventStatus

  @Column({ type: "int", default: 0 })
  retryCount: number

  @Column({ type: "timestamp", nullable: true })
  lastRetryAt: Date

  @Column({ type: "text", nullable: true })
  errorMessage: string

  @Column({ type: "timestamp" })
  blockTimestamp: Date

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @CreateDateColumn()
  createdAt: Date
}
