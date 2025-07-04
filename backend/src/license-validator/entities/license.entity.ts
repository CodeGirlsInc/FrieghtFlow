import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"

export enum LicenseType {
  DRIVER_LICENSE = "driver_license",
  CDL = "cdl", // Commercial Driver's License
  VEHICLE_REGISTRATION = "vehicle_registration",
  VEHICLE_INSPECTION = "vehicle_inspection",
  INSURANCE = "insurance",
  DOT_PERMIT = "dot_permit",
  HAZMAT = "hazmat",
}

export enum LicenseStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  SUSPENDED = "suspended",
  REVOKED = "revoked",
  PENDING = "pending",
  INVALID = "invalid",
}

export enum ValidationStatus {
  PENDING = "pending",
  VALID = "valid",
  INVALID = "invalid",
  EXPIRED = "expired",
  SUSPENDED = "suspended",
  ERROR = "error",
}

@Entity("licenses")
@Index(["licenseNumber", "licenseType"], { unique: true })
@Index(["holderId"])
@Index(["expirationDate"])
@Index(["validationStatus"])
export class License {
  @ApiProperty({ description: "Unique identifier for the license" })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ description: "License number or identifier" })
  @Column({ name: "license_number", length: 100 })
  @Index()
  licenseNumber: string

  @ApiProperty({ enum: LicenseType, description: "Type of license" })
  @Column({
    name: "license_type",
    type: "enum",
    enum: LicenseType,
  })
  licenseType: LicenseType

  @ApiProperty({ description: "ID of the license holder (driver, vehicle, etc.)" })
  @Column({ name: "holder_id", length: 100 })
  holderId: string

  @ApiProperty({ description: "Name of the license holder" })
  @Column({ name: "holder_name", length: 200 })
  holderName: string

  @ApiProperty({ description: "Issuing authority (state, country, etc.)" })
  @Column({ name: "issuing_authority", length: 100 })
  issuingAuthority: string

  @ApiProperty({ description: "Date when license was issued" })
  @Column({ name: "issue_date", type: "timestamp" })
  issueDate: Date

  @ApiProperty({ description: "Date when license expires" })
  @Column({ name: "expiration_date", type: "timestamp" })
  expirationDate: Date

  @ApiProperty({ enum: LicenseStatus, description: "Current status of the license" })
  @Column({
    name: "license_status",
    type: "enum",
    enum: LicenseStatus,
    default: LicenseStatus.ACTIVE,
  })
  licenseStatus: LicenseStatus

  @ApiProperty({ enum: ValidationStatus, description: "Validation status" })
  @Column({
    name: "validation_status",
    type: "enum",
    enum: ValidationStatus,
    default: ValidationStatus.PENDING,
  })
  validationStatus: ValidationStatus

  @ApiProperty({ description: "Additional license details and restrictions" })
  @Column({ name: "license_details", type: "jsonb", nullable: true })
  licenseDetails: Record<string, any>

  @ApiProperty({ description: "URL or path to license document/image" })
  @Column({ name: "document_url", length: 500, nullable: true })
  documentUrl: string

  @ApiProperty({ description: "Last validation date" })
  @Column({ name: "last_validated_at", type: "timestamp", nullable: true })
  lastValidatedAt: Date

  @ApiProperty({ description: "Next validation due date" })
  @Column({ name: "next_validation_due", type: "timestamp", nullable: true })
  nextValidationDue: Date

  @ApiProperty({ description: "Validation error message if any" })
  @Column({ name: "validation_error", type: "text", nullable: true })
  validationError: string

  @ApiProperty({ description: "Additional metadata" })
  @Column({ name: "metadata", type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @ApiProperty({ description: "Whether the license is currently active" })
  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  // Computed properties
  get isExpired(): boolean {
    return new Date() > this.expirationDate
  }

  get isValid(): boolean {
    return (
      this.isActive &&
      this.validationStatus === ValidationStatus.VALID &&
      !this.isExpired &&
      this.licenseStatus === LicenseStatus.ACTIVE
    )
  }

  get daysUntilExpiration(): number {
    const now = new Date()
    const expiration = new Date(this.expirationDate)
    const diffTime = expiration.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
}
