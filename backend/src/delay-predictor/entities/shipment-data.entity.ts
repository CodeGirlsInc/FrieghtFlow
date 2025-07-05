import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("shipment_data")
export class ShipmentData {
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

  @Column({ type: "date", nullable: true })
  expectedDeliveryDate: Date

  @Column({ type: "date", nullable: true })
  actualDeliveryDate: Date

  @Column({ type: "integer", default: 0 })
  delayDays: number

  @Column({ type: "boolean", default: false })
  wasDelayed: boolean

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  distance: number

  @Column({ type: "varchar", length: 50, nullable: true })
  weatherCondition: string

  @Column({ type: "varchar", length: 50, nullable: true })
  season: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
