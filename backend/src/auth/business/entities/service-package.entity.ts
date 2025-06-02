import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { BusinessServiceSelection } from "./business-service-selection.entity"

@Entity("service_packages")
export class ServicePackage {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 100 })
  name: string

  @Column({ type: "text" })
  description: string

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number

  @Column({ default: true })
  isActive: boolean

  @Column({ type: "json" })
  features: string[]

  @Column({ nullable: true })
  durationMonths: number

  @OneToMany(
    () => BusinessServiceSelection,
    (selection) => selection.servicePackage,
  )
  businessSelections: BusinessServiceSelection[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
