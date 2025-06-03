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
import { Department } from "./department.entity"
import { Shipment } from "./shipment.entity"

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  STAFF = "staff",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.STAFF,
  })
  role: UserRole

  @Column({ default: true })
  isActive: boolean

  @ManyToOne(
    () => Organization,
    (organization) => organization.users,
  )
  @JoinColumn({ name: "organizationId" })
  organization: Organization

  @Column()
  organizationId: string

  @ManyToOne(
    () => Department,
    (department) => department.users,
    { nullable: true },
  )
  @JoinColumn({ name: "departmentId" })
  department: Department

  @Column({ nullable: true })
  departmentId: string

  @OneToMany(
    () => Shipment,
    (shipment) => shipment.assignedUser,
  )
  assignedShipments: Shipment[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
