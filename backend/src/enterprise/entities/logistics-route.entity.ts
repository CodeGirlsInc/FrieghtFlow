import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm"
import { Organization } from "./organization.entity"
import { Shipment } from "./shipment.entity"

export enum RouteStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
}

@Entity("logistics_routes")
export class LogisticsRoute {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column()
  origin: string

  @Column()
  destination: string

  @Column("decimal", { precision: 10, scale: 2 })
  distance: number

  @Column("decimal", { precision: 10, scale: 2 })
  estimatedDuration: number // in hours

  @Column("decimal", { precision: 10, scale: 2 })
  cost: number

  @Column({
    type: "enum",
    enum: RouteStatus,
    default: RouteStatus.ACTIVE,
  })
  status: RouteStatus

  @Column("json", { nullable: true })
  waypoints: string[]

  @ManyToOne(
    () => Organization,
    (organization) => organization.logisticsRoutes,
  )
  @JoinColumn({ name: "organizationId" })
  organization: Organization

  @Column()
  organizationId: string

  @OneToMany(
    () => Shipment,
    (shipment) => shipment.route,
  )
  shipments: Shipment[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
