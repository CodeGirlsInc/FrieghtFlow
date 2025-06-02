import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { Business } from "./business.entity"

@Entity("business_profiles")
export class BusinessProfile {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @OneToOne(
    () => Business,
    (business) => business.profile,
  )
  @JoinColumn()
  business: Business

  @Column({ length: 255, nullable: true })
  businessDescription: string

  @Column({ nullable: true })
  yearEstablished: number

  @Column({ nullable: true })
  employeeCount: number

  @Column({ nullable: true })
  website: string

  @Column({ type: "json", nullable: true })
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }

  @Column({ type: "json", nullable: true })
  socialMedia: {
    facebook?: string
    twitter?: string
    linkedin?: string
    instagram?: string
  }

  @Column({ type: "simple-array", nullable: true })
  businessCategories: string[]

  @Column({ nullable: true })
  taxId: string

  @Column({ nullable: true })
  registrationNumber: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
