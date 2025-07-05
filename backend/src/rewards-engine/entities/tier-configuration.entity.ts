import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { TierLevel } from "./user-reward.entity"

@Entity("tier_configurations")
export class TierConfiguration {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "enum", enum: TierLevel, unique: true })
  tier: TierLevel

  @Column({ type: "integer" })
  requiredPoints: number

  @Column({ type: "integer", default: 0 })
  requiredShipments: number

  @Column({ type: "decimal", precision: 3, scale: 2, default: 1.0 })
  pointsMultiplier: number

  @Column({ type: "integer", default: 0 })
  welcomeBonus: number

  @Column({ type: "json", nullable: true })
  benefits: Record<string, any>

  @Column({ type: "boolean", default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
