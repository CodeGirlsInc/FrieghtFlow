import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

export enum QRCodeType {
  SHIPMENT_TRACKING = "SHIPMENT_TRACKING",
  DELIVERY_VALIDATION = "DELIVERY_VALIDATION",
  PICKUP_CONFIRMATION = "PICKUP_CONFIRMATION",
  WAREHOUSE_SCAN = "WAREHOUSE_SCAN",
  CUSTOMS_CLEARANCE = "CUSTOMS_CLEARANCE",
  GENERAL = "GENERAL",
}

export enum QRCodeStatus {
  ACTIVE = "ACTIVE",
  USED = "USED",
  EXPIRED = "EXPIRED",
  REVOKED = "REVOKED",
}

@Entity("qr_codes")
@Index(["code"])
@Index(["referenceId"])
@Index(["status", "expiresAt"])
export class QRCode {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255, unique: true })
  @Index()
  code: string

  @Column({ type: "varchar", length: 255 })
  hash: string

  @Column({ type: "enum", enum: QRCodeType })
  type: QRCodeType

  @Column({ type: "enum", enum: QRCodeStatus, default: QRCodeStatus.ACTIVE })
  status: QRCodeStatus

  @Column({ type: "varchar", length: 255, nullable: true })
  @Index()
  referenceId: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "timestamp" })
  @Index()
  expiresAt: Date

  @Column({ type: "timestamp", nullable: true })
  scannedAt: Date

  @Column({ type: "varchar", length: 255, nullable: true })
  scannedBy: string

  @Column({ type: "varchar", length: 255, nullable: true })
  scannedLocation: string

  @Column({ type: "integer", default: 0 })
  scanCount: number

  @Column({ type: "integer", default: 1 })
  maxScans: number

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>

  @Column({ type: "varchar", length: 255, nullable: true })
  createdBy: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
