import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

@Entity("event_processing_checkpoints")
@Index(["contractAddress"], { unique: true })
export class EventProcessingCheckpoint {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 66 })
  @Index({ unique: true })
  contractAddress: string

  @Column({ type: "bigint" })
  lastProcessedBlock: bigint

  @Column({ type: "timestamp" })
  lastProcessedAt: Date

  @Column({ type: "int", default: 0 })
  totalEventsProcessed: number

  @Column({ type: "int", default: 0 })
  failedEventsCount: number

  @Column({ type: "jsonb", nullable: true })
  processingStats: {
    averageProcessingTime?: number
    lastBatchSize?: number
    errorRate?: number
  }

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
