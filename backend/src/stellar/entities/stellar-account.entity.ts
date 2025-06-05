import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { StellarTransaction } from "./stellar-transaction.entity"
import { EscrowContract } from "./escrow-contract.entity"

@Entity("stellar_accounts")
export class StellarAccount {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  publicKey: string

  @Column({ nullable: true })
  secretKey: string // Encrypted in production

  @Column({ nullable: true })
  userId: string // Reference to your user system

  @Column({ default: true })
  isActive: boolean

  @Column({ nullable: true })
  sequence: string

  @Column("jsonb", { nullable: true })
  balances: any[]

  @Column("jsonb", { nullable: true })
  signers: any[]

  @Column("jsonb", { nullable: true })
  thresholds: any

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(
    () => StellarTransaction,
    (transaction) => transaction.sourceAccount,
  )
  sentTransactions: StellarTransaction[]

  @OneToMany(
    () => StellarTransaction,
    (transaction) => transaction.destinationAccount,
  )
  receivedTransactions: StellarTransaction[]

  @OneToMany(
    () => EscrowContract,
    (escrow) => escrow.sourceAccount,
  )
  sourceEscrows: EscrowContract[]

  @OneToMany(
    () => EscrowContract,
    (escrow) => escrow.destinationAccount,
  )
  destinationEscrows: EscrowContract[]
}
