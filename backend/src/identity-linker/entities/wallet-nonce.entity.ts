import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm"

@Entity("wallet_nonces")
export class WalletNonce {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 42 })
  @Index({ unique: true })
  walletAddress: string

  @Column({ length: 64 })
  nonce: string

  @Column({ type: "timestamp" })
  expiresAt: Date

  @Column({ default: false })
  isUsed: boolean

  @CreateDateColumn()
  createdAt: Date
}
