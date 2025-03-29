import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Transaction } from "./transaction.entity"

@Entity("wallets")
export class Wallet {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  userId: string

  @Column({ type: "decimal", precision: 20, scale: 2, default: 0 })
  balance: number

  @Column({ length: 3 })
  currency: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(
    () => Transaction,
    (transaction) => transaction.wallet,
  )
  transactions: Transaction[]
}

