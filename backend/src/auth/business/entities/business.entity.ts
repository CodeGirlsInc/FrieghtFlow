import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from "typeorm"
import { BusinessProfile } from "./business-profile.entity"
import { BusinessServiceSelection } from "./business-service-selection.entity"
import { VerificationStatus } from "./verification-status.entity"

@Entity("businesses")
export class Business {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 100 })
  name: string

  @Column({ unique: true })
  email: string

  @Column({ nullable: true })
  phone: string

  @Column({ default: false })
  isActive: boolean

  @Column({ default: "pending" })
  status: "pending" | "active" | "suspended" | "inactive"

  @OneToOne(
    () => BusinessProfile,
    (profile) => profile.business,
    {
      cascade: true,
    },
  )
  profile: BusinessProfile

  @OneToOne(
    () => VerificationStatus,
    (verification) => verification.business,
    {
      cascade: true,
    },
  )
  verification: VerificationStatus

  @OneToMany(
    () => BusinessServiceSelection,
    (selection) => selection.business,
    { cascade: true },
  )
  serviceSelections: BusinessServiceSelection[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
