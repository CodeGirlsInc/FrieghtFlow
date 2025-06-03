import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Organization } from "./organization.entity"
import { Department } from "./department.entity"
import { User } from "./user.entity"
import { LogisticsRoute } from "./logistics-route.entity"

export enum ShipmentStatus {
  PENDING = "pending",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  DELAYED = "delayed",
}

export enum ShipmentPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

@Entity("shipments")
export class Shipment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  trackingNumber: string

  @Column()
  senderName: string

  @Column()
  senderAddress: string

  @Column()
  recipientName: string

  @Column()
  recipientAddress: string

  @Column("decimal", { precision: 10, scale: 2 })
  weight: number

  @Column("json", { nullable: true })
  dimensions: { length: number; width: number; height: number }

  @Column({
    type: "enum",
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus

  @Column({
    type: "enum",
    enum: ShipmentPriority,
    default: ShipmentPriority.MEDIUM,
  })
  priority: ShipmentPriority

  @Column("decimal", { precision: 10, scale: 2 })
  cost: number

  @Column({ nullable: true })
  estimatedDeliveryDate: Date

  @Column({ nullable: true })
  actualDeliveryDate: Date

  @Column("text", { nullable: true })
  notes: string

  @ManyToOne(() => Organization)
  @JoinColumn({ name: "organizationId" })
  organization: Organization

  @Column()
  organizationId: string

  @ManyToOne(
    () => Department,
    (department) => department.shipments,
  )
  @JoinColumn({ name: "departmentId" })
  department: Department

  @Column()
  departmentId: string

  @ManyToOne(
    () => User,
    (user) => user.assignedShipments,
  )
  @JoinColumn({ name: "assignedUserId" })
  assignedUser: User

  @Column({ nullable: true })
  assignedUserId: string

  @ManyToOne(
    () => LogisticsRoute,
    (route) => route.shipments,
  )
  @JoinColumn({ name: "routeId" })
  route: LogisticsRoute

  @Column({ nullable: true })
  routeId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
