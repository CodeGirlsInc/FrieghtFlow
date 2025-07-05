import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

export enum ProofType {
  SIGNATURE = "signature",
  PHOTO = "photo",
  TOKEN = "token",
  QR_CODE = "qr_code",
}

export enum ProofStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  FAILED = "failed",
  BLOCKCHAIN_PENDING = "blockchain_pending",
  BLOCKCHAIN_CONFIRMED = "blockchain_confirmed",
}

@Entity("delivery_proofs")
@Index(["deliveryId", "proofType"])
@Index(["status"])
@Index(["createdAt"])
export class DeliveryProof {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "delivery_id", type: "varchar", length: 255 })
  @Index()
  deliveryId: string

  @Column({
    type: "enum",
    enum: ProofType,
    name: "proof_type",
  })
  proofType: ProofType

  @Column({
    type: "enum",
    enum: ProofStatus,
    default: ProofStatus.PENDING,
  })
  status: ProofStatus

  @Column({ type: "text", nullable: true })
  signature: string

  @Column({ name: "photo_url", type: "varchar", length: 500, nullable: true })
  photoUrl: string

  @Column({ type: "varchar", length: 255, nullable: true })
  token: string

  @Column({ name: "qr_data", type: "text", nullable: true })
  qrData: string

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @Column({ name: "recipient_name", type: "varchar", length: 255, nullable: true })
  recipientName: string

  @Column({ name: "recipient_email", type: "varchar", length: 255, nullable: true })
  recipientEmail: string

  @Column({ type: "decimal", precision: 10, scale: 8, nullable: true })
  latitude: number

  @Column({ type: "decimal", precision: 11, scale: 8, nullable: true })
  longitude: number

  @Column({ name: "device_info", type: "jsonb", nullable: true })
  deviceInfo: Record<string, any>

  @Column({ name: "ip_address", type: "inet", nullable: true })
  ipAddress: string

  @Column({ name: "blockchain_tx_hash", type: "varchar", length: 66, nullable: true })
  blockchainTxHash: string

  @Column({ name: "blockchain_block_number", type: "bigint", nullable: true })
  blockchainBlockNumber: string

  @Column({ name: "verification_attempts", type: "int", default: 0 })
  verificationAttempts: number

  @Column({ name: "last_error", type: "text", nullable: true })
  lastError: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @Column({ name: "expires_at", type: "timestamp", nullable: true })
  expiresAt: Date
}
