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
import { User } from "./user.entity"
import { Shipment } from "./shipment.entity"

@Entity("departments")
export class Department {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  budget: number

  @ManyToOne(
    () => Organization,
    (organization) => organization.departments,
  )
  @JoinColumn({ name: "organizationId" })
  organization: Organization

  @Column()
  organizationId: string

  @OneToMany(
    () => User,
    (user) => user.department,
  )
  users: User[]

  @OneToMany(
    () => Shipment,
    (shipment) => shipment.department,
  )
  shipments: Shipment[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
