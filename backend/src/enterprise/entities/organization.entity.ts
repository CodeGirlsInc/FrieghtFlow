import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { User } from "./user.entity"
import { Department } from "./department.entity"
import { LogisticsRoute } from "./logistics-route.entity"

@Entity("organizations")
export class Organization {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  name: string

  @Column({ nullable: true })
  description: string

  @Column()
  address: string

  @Column()
  phone: string

  @Column()
  email: string

  @Column({ default: true })
  isActive: boolean

  @OneToMany(
    () => User,
    (user) => user.organization,
  )
  users: User[]

  @OneToMany(
    () => Department,
    (department) => department.organization,
  )
  departments: Department[]

  @OneToMany(
    () => LogisticsRoute,
    (route) => route.organization,
  )
  logisticsRoutes: LogisticsRoute[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
