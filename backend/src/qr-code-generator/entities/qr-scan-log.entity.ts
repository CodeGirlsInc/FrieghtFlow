import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm"

export enum ScanResult {
  SUCCESS = "SUCCESS",
  EXPIRED = "EXPIRED",
  ALREADY_USED = "ALREADY_USED",
  INVALID = "INVALID",
  REVOKED = "REVOKED",
  MAX_SCANS_EXCEEDED = "MAX_SCANS_EXCEEDED",
}

@Entity("qr_scan_logs")
@Index(["qrCodeId", "createdAt"])
@Index(["scanResult"])
@Index(["scannedBy"])
export class QRScanLog {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  @Index()
  qrCodeId: string

  @Column({ type: "varchar", length: 255 })
  code: string

  @Column({ type: "enum", enum: ScanResult })
  scanResult: ScanResult

  @Column({ type: "varchar", length: 255, nullable: true })
  scannedBy: string

  @Column({ type: "varchar", length: 255, nullable: true })
  scannedLocation: string

  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress: string

  @Column({ type: "text", nullable: true })
  userAgent: string

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>

  @Column({ type: "text", nullable: true })
  errorMessage: string

  @CreateDateColumn()
  createdAt: Date
}
