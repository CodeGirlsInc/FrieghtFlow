import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm"
import { SLARule } from "./sla-rule.entity"
import { Shipment } from "./shipment.entity"

export enum ViolationStatus {
  DETECTED = "detected",
  PROCESSING = "processing",
  RESOLVED = "resolved",
  ESCALATED = "escalated",
}

@Entity("sla_violations")
@Index(["shipmentId", "ruleId"])
@Index(["status", "detectedAt"])
export class SLAViolation {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  @Index()
  shipmentId: string

  @Column("uuid")
  @Index()
  ruleId: string

  @ManyToOne(() => Shipment)
  @JoinColumn({ name: "shipmentId" })
  shipment: Shipment

  @ManyToOne(() => SLARule)
  @JoinColumn({ name: "ruleId" })
  rule: SLARule

  @Column({
    type: "enum",
    enum: ViolationStatus,
    default: ViolationStatus.DETECTED,
  })
  status: ViolationStatus

  @Column({ type: "int" })
  delayMinutes: number

  @Column({ type: "timestamp" })
  detectedAt: Date

  @Column({ type: "timestamp", nullable: true })
  resolvedAt: Date

  @Column({ type: "jsonb", nullable: true })
  actionsTaken: {
    alertsSent?: string[]
    webhooksCalled?: string[]
    contractsTriggered?: string[]
    penalties?: number[]
  }

  @Column({ type: "text", nullable: true })
  notes: string

  @CreateDateColumn()
  createdAt: Date
}
