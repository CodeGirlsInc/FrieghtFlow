import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { StellarAccount } from "./stellar-account.entity"
import { TransactionStatus, AssetType } from "../types/stellar.types"

@Entity("stellar_transactions")
export class StellarTransaction {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  transactionHash: string

  @Column()
  sourceAccountId: string

  @Column()
  destinationAccountId: string

  @Column("decimal", { precision: 20, scale: 7 })
  amount: string

  @Column({
    type: "enum",
    enum: AssetType,
    default: AssetType.NATIVE,
  })
  assetType: AssetType

  @Column({ nullable: true })
  assetCode: string

  @Column({ nullable: true })
  assetIssuer: string

  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus

  @Column({ nullable: true })
  memo: string

  @Column({ nullable: true })
  ledger: number

  @Column("jsonb", { nullable: true })
  stellarResponse: any

  @Column({ nullable: true })
  errorMessage: string

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(
    () => StellarAccount,
    (account) => account.sentTransactions,
  )
  @JoinColumn({ name: "sourceAccountId", referencedColumnName: "publicKey" })
  sourceAccount: StellarAccount

  @ManyToOne(
    () => StellarAccount,
    (account) => account.receivedTransactions,
  )
  @JoinColumn({ name: "destinationAccountId", referencedColumnName: "publicKey" })
  destinationAccount: StellarAccount
}
