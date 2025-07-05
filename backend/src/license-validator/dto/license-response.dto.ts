import { ApiProperty } from "@nestjs/swagger"
import { LicenseType, LicenseStatus, ValidationStatus } from "../entities/license.entity"
import { ValidationMethod, ValidationResult } from "../entities/license-validation.entity"

export class LicenseResponseDto {
  @ApiProperty({ description: "License ID" })
  id: string

  @ApiProperty({ description: "License number" })
  licenseNumber: string

  @ApiProperty({ enum: LicenseType, description: "License type" })
  licenseType: LicenseType

  @ApiProperty({ description: "Holder ID" })
  holderId: string

  @ApiProperty({ description: "Holder name" })
  holderName: string

  @ApiProperty({ description: "Issuing authority" })
  issuingAuthority: string

  @ApiProperty({ description: "Issue date" })
  issueDate: Date

  @ApiProperty({ description: "Expiration date" })
  expirationDate: Date

  @ApiProperty({ enum: LicenseStatus, description: "License status" })
  licenseStatus: LicenseStatus

  @ApiProperty({ enum: ValidationStatus, description: "Validation status" })
  validationStatus: ValidationStatus

  @ApiProperty({ description: "License details", required: false })
  licenseDetails?: Record<string, any>

  @ApiProperty({ description: "Document URL", required: false })
  documentUrl?: string

  @ApiProperty({ description: "Last validated date", required: false })
  lastValidatedAt?: Date

  @ApiProperty({ description: "Next validation due date", required: false })
  nextValidationDue?: Date

  @ApiProperty({ description: "Validation error", required: false })
  validationError?: string

  @ApiProperty({ description: "Is active" })
  isActive: boolean

  @ApiProperty({ description: "Is expired" })
  isExpired: boolean

  @ApiProperty({ description: "Is valid" })
  isValid: boolean

  @ApiProperty({ description: "Days until expiration" })
  daysUntilExpiration: number

  @ApiProperty({ description: "Creation date" })
  createdAt: Date

  @ApiProperty({ description: "Last update date" })
  updatedAt: Date
}

export class ValidationResponseDto {
  @ApiProperty({ description: "Validation ID" })
  id: string

  @ApiProperty({ description: "License ID" })
  licenseId: string

  @ApiProperty({ enum: ValidationMethod, description: "Validation method" })
  validationMethod: ValidationMethod

  @ApiProperty({ enum: ValidationResult, description: "Validation result" })
  validationResult: ValidationResult

  @ApiProperty({ enum: ValidationStatus, description: "Validation status" })
  validationStatus: ValidationStatus

  @ApiProperty({ description: "API provider used", required: false })
  apiProvider?: string

  @ApiProperty({ description: "Response time in milliseconds", required: false })
  responseTimeMs?: number

  @ApiProperty({ description: "Confidence score", required: false })
  confidenceScore?: number

  @ApiProperty({ description: "Validation notes", required: false })
  validationNotes?: string

  @ApiProperty({ description: "Validated by", required: false })
  validatedBy?: string

  @ApiProperty({ description: "Validation date" })
  validationDate: Date

  @ApiProperty({ description: "Error details", required: false })
  errorDetails?: Record<string, any>
}

export class LicenseValidationResultDto {
  @ApiProperty({ description: "License information" })
  license: LicenseResponseDto

  @ApiProperty({ description: "Validation details" })
  validation: ValidationResponseDto

  @ApiProperty({ description: "Overall validation success" })
  isValid: boolean

  @ApiProperty({ description: "Validation summary message" })
  message: string
}

export class BulkValidationResultDto {
  @ApiProperty({ description: "Total licenses processed" })
  totalProcessed: number

  @ApiProperty({ description: "Number of successful validations" })
  successful: number

  @ApiProperty({ description: "Number of failed validations" })
  failed: number

  @ApiProperty({ description: "Individual validation results", type: [LicenseValidationResultDto] })
  results: LicenseValidationResultDto[]

  @ApiProperty({ description: "Processing time in milliseconds" })
  processingTimeMs: number
}

export class LicenseStatisticsDto {
  @ApiProperty({ description: "Total licenses" })
  totalLicenses: number

  @ApiProperty({ description: "Active licenses" })
  activeLicenses: number

  @ApiProperty({ description: "Expired licenses" })
  expiredLicenses: number

  @ApiProperty({ description: "Licenses expiring soon" })
  expiringSoon: number

  @ApiProperty({ description: "Valid licenses" })
  validLicenses: number

  @ApiProperty({ description: "Invalid licenses" })
  invalidLicenses: number

  @ApiProperty({ description: "Pending validation" })
  pendingValidation: number

  @ApiProperty({ description: "Statistics by license type" })
  byLicenseType: Record<string, number>

  @ApiProperty({ description: "Statistics by issuing authority" })
  byIssuingAuthority: Record<string, number>

  @ApiProperty({ description: "Recent validation activity" })
  recentValidations: number
}
