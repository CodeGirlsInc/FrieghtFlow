import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { License, ValidationStatus } from "./license.entity"

export enum ValidationMethod {
  THIRD_PARTY_API = "third_party_api",
  MANUAL_REVIEW = "manual_review",
  DOCUMENT_SCAN = "document_scan",
  DATABASE_LOOKUP = "database_lookup",
  MOCK_VALIDATION = "mock_validation",
}

export enum ValidationResult {
  PASS = "pass",
  FAIL = "fail",
  WARNING = "warning",
  ERROR = "error",
}

@Entity("license_validations")
@Index(["licenseId"])
@Index(["validationDate"])
@Index(["validationResult"])
export class LicenseValidation {
  @ApiProperty({ description: "Unique identifier for the validation record" })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ description: "License being validated" })
  @ManyToOne(() => License, { onDelete: "CASCADE" })
  @JoinColumn({ name: "license_id" })
  license: License

  @ApiProperty({ description: "License ID" })
  @Column({ name: "license_id" })
  licenseId: string

  @ApiProperty({ enum: ValidationMethod, description: "Method used for validation" })
  @Column({
    name: "validation_method",
    type: "enum",
    enum: ValidationMethod,
  })
  validationMethod: ValidationMethod

  @ApiProperty({ enum: ValidationResult, description: "Result of validation" })
  @Column({
    name: "validation_result",
    type: "enum",
    enum: ValidationResult,
  })
  validationResult: ValidationResult

  @ApiProperty({ enum: ValidationStatus, description: "Validation status" })
  @Column({
    name: "validation_status",
    type: "enum",
    enum: ValidationStatus,
  })
  validationStatus: ValidationStatus

  @ApiProperty({ description: "Validation request data" })
  @Column({ name: "request_data", type: "jsonb", nullable: true })
  requestData: Record<string, any>

  @ApiProperty({ description: "Validation response data" })
  @Column({ name: "response_data", type: "jsonb", nullable: true })
  responseData: Record<string, any>

  @ApiProperty({ description: "Validation error details" })
  @Column({ name: "error_details", type: "jsonb", nullable: true })
  errorDetails: Record<string, any>

  @ApiProperty({ description: "Third-party API provider used" })
  @Column({ name: "api_provider", length: 100, nullable: true })
  apiProvider: string

  @ApiProperty({ description: "API response time in milliseconds" })
  @Column({ name: "response_time_ms", type: "integer", nullable: true })
  responseTimeMs: number

  @ApiProperty({ description: "Validation confidence score (0-100)" })
  @Column({ name: "confidence_score", type: "decimal", precision: 5, scale: 2, nullable: true })
  confidenceScore: number

  @ApiProperty({ description: "Validation notes or comments" })
  @Column({ name: "validation_notes", type: "text", nullable: true })
  validationNotes: string

  @ApiProperty({ description: "User or system that initiated validation" })
  @Column({ name: "validated_by", length: 100, nullable: true })
  validatedBy: string

  @ApiProperty({ description: "Validation date and time" })
  @CreateDateColumn({ name: "validation_date" })
  validationDate: Date

  @ApiProperty({ description: "Additional validation metadata" })
  @Column({ name: "metadata", type: "jsonb", nullable: true })
  metadata: Record<string, any>
}
