import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

@Entity("identity_links")
@Index(["userId", "walletAddress"], { unique: true })
export class IdentityLink {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  @Index()
  userId: string

  @Column({ length: 42 })
  @Index()
  walletAddress: string

  @Column({ length: 64 })
  signatureHash: string

  @Column({ type: "timestamp" })
  linkedAt: Date

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
