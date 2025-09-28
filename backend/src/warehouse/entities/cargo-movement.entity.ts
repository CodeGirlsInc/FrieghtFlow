import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm"
import { Warehouse } from "./warehouse.entity"

export enum MovementType {
  INBOUND = "inbound",
  OUTBOUND = "outbound",
}

export enum MovementStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

@Entity("cargo_movements")
export class CargoMovement {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: MovementType,
  })
  type: MovementType

  @Column({
    type: "enum",
    enum: MovementStatus,
    default: MovementStatus.SCHEDULED,
  })
  status: MovementStatus

  @Column({ length: 100 })
  cargoDescription: string

  @Column("int")
  quantity: number

  @Column({ length: 50 })
  unit: string // pallets, containers, cubic_meters, etc.

  @Column({ length: 100, nullable: true })
  referenceNumber: string // tracking number, order ID, etc.

  @Column({ length: 100, nullable: true })
  carrier: string

  @Column({ type: "timestamp", nullable: true })
  scheduledDateTime: Date

  @Column({ type: "timestamp", nullable: true })
  actualDateTime: Date

  @Column("text", { nullable: true })
  notes: string

  @ManyToOne(
    () => Warehouse,
    (warehouse) => warehouse.cargoMovements,
  )
  @JoinColumn({ name: "warehouse_id" })
  warehouse: Warehouse

  @Column("uuid")
  warehouse_id: string

  @CreateDateColumn()
  createdAt: Date
}
