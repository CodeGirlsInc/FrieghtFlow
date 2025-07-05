import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity("prediction_logs")
export class PredictionLog {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  origin: string

  @Column({ type: "varchar", length: 255 })
  destination: string

  @Column({ type: "varchar", length: 100 })
  carrier: string

  @Column({ type: "date" })
  shipmentDate: Date

  @Column({ type: "decimal", precision: 5, scale: 4 })
  delayLikelihood: number

  @Column({ type: "varchar", length: 50 })
  riskLevel: string

  @Column({ type: "integer" })
  estimatedDelayDays: number

  @Column({ type: "json" })
  factors: Record<string, any>

  @CreateDateColumn()
  createdAt: Date
}
