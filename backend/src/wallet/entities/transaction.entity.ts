import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Wallet } from "./wallet.entity"
import { TransactionType } from "../enums/transaction-type.enum"
import { TransactionStatus } from "../enums/transaction-status.enum"

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  walletId: string

  @Column({ type: "decimal", precision: 20, scale: 2 })
  amount: number

  @Column({
    type: "enum",
    enum: TransactionType,
  })
  type: TransactionType

  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(
    () => Wallet,
    (wallet) => wallet.transactions,
  )
  @JoinColumn({ name: "walletId" })
  wallet: Wallet
}

