import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm"
import { Transaction, TransactionStatus } from "./transaction.entity"

@Entity("transaction_history")
export class TransactionHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  @Index()
  transactionId: string

  @ManyToOne(
    () => Transaction,
    (transaction) => transaction.history,
  )
  @JoinColumn({ name: "transactionId" })
  transaction: Transaction

  @Column({
    type: "enum",
    enum: TransactionStatus,
  })
  previousStatus: TransactionStatus

  @Column({
    type: "enum",
    enum: TransactionStatus,
  })
  newStatus: TransactionStatus

  @Column({ type: "jsonb" })
  changes: Record<string, any>

  @Column({ type: "varchar", length: 255, nullable: true })
  changedBy: string

  @Column({ type: "varchar", length: 500, nullable: true })
  reason: string

  @CreateDateColumn()
  createdAt: Date
}
