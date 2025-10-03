import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { CargoType } from "./freight-quote.entity"

@Entity("pricing_configs")
export class PricingConfig {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: CargoType,
    name: "cargo_type",
  })
  cargoType: CargoType

  @Column("decimal", { precision: 5, scale: 2, name: "base_rate_per_kg" })
  baseRatePerKg: number

  @Column("decimal", { precision: 5, scale: 4, name: "distance_multiplier" })
  distanceMultiplier: number

  @Column("decimal", { precision: 3, scale: 2, name: "cargo_type_multiplier" })
  cargoTypeMultiplier: number

  @Column("decimal", { precision: 10, scale: 2, name: "minimum_charge" })
  minimumCharge: number

  @Column({ default: true, name: "is_active" })
  isActive: boolean

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
