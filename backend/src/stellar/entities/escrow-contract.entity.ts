import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { StellarAccount } from "./stellar-account.entity"
import { EscrowStatus, AssetType } from "../types/stellar.types"

@Entity("escrow_contracts")
export class EscrowContract {
  @PrimaryGeneratedColumn("uuid")
  id: string

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
    enum: EscrowStatus,
    default: EscrowStatus.PENDING,
  })
  status: EscrowStatus

  @Column("text", { array: true })
  releaseConditions: string[]

  @Column({ nullable: true })
  escrowAccountId: string // The intermediate escrow account

  @Column({ nullable: true })
  transactionHash: string

  @Column({ nullable: true })
  releaseTransactionHash: string

  @Column({ nullable: true })
  memo: string

  @Column({ nullable: true })
  expiresAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(
    () => StellarAccount,
    (account) => account.sourceEscrows,
  )
  @JoinColumn({ name: "sourceAccountId", referencedColumnName: "publicKey" })
  sourceAccount: StellarAccount

  @ManyToOne(
    () => StellarAccount,
    (account) => account.destinationEscrows,
  )
  @JoinColumn({ name: "destinationAccountId", referencedColumnName: "publicKey" })
  destinationAccount: StellarAccount
}
