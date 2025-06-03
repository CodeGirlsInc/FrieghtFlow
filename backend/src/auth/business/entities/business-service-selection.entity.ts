import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { Business } from "./business.entity"
import { ServicePackage } from "./service-package.entity"

@Entity("business_service_selections")
export class BusinessServiceSelection {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(
    () => Business,
    (business) => business.serviceSelections,
  )
  @JoinColumn()
  business: Business

  @ManyToOne(
    () => ServicePackage,
    (servicePackage) => servicePackage.businessSelections,
  )
  @JoinColumn()
  servicePackage: ServicePackage

  @Column({ default: "active" })
  status: "active" | "inactive" | "pending" | "expired"

  @Column({ type: "timestamp", nullable: true })
  startDate: Date

  @Column({ type: "timestamp", nullable: true })
  endDate: Date

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  customPrice: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
