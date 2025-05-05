import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { PaymentStatus } from "../interfaces/payment-provider.interface"

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 50 })
  providerName: string

  @Column({ type: "varchar", length: 255 })
  providerPaymentId: string

  @Column({ type: "decimal", precision: 20, scale: 8 })
  amount: number

  @Column({ type: "varchar", length: 10 })
  currency: string

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @Column({ type: "jsonb", nullable: true })
  providerData: Record<string, any>

  @Column({ type: "varchar", length: 255, nullable: true })
  redirectUrl: string

  @Column({ type: "varchar", length: 255, nullable: true })
  customerId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
