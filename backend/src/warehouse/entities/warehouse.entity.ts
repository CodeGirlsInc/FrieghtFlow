import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { CargoMovement } from "./cargo-movement.entity"

@Entity("warehouses")
export class Warehouse {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 100 })
  name: string

  @Column({ length: 200 })
  address: string

  @Column("decimal", { precision: 10, scale: 6 })
  latitude: number

  @Column("decimal", { precision: 10, scale: 6 })
  longitude: number

  @Column("int")
  totalCapacity: number

  @Column("int", { default: 0 })
  currentOccupancy: number

  @Column({ length: 50 })
  capacityUnit: string // e.g., 'cubic_meters', 'pallets', 'containers'

  @Column({ length: 20, default: "active" })
  status: string // active, inactive, maintenance

  @Column("json", { nullable: true })
  facilities: {
    hasLoadingDock: boolean
    hasColdStorage: boolean
    hasSecuritySystem: boolean
    operatingHours: {
      open: string
      close: string
      timezone: string
    }
  }

  @OneToMany(
    () => CargoMovement,
    (movement) => movement.warehouse,
  )
  cargoMovements: CargoMovement[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Computed property
  get availableCapacity(): number {
    return this.totalCapacity - this.currentOccupancy
  }

  get occupancyPercentage(): number {
    return (this.currentOccupancy / this.totalCapacity) * 100
  }
}
