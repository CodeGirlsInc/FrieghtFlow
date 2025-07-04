import type { LicenseType, ValidationStatus } from "../entities/license.entity"
import type { ValidationMethod, ValidationResult } from "../entities/license-validation.entity"

export interface ILicenseValidationRequest {
  licenseNumber: string
  licenseType: LicenseType
  issuingAuthority: string
  holderName?: string
  additionalData?: Record<string, any>
}

export interface ILicenseValidationResponse {
  isValid: boolean
  validationStatus: ValidationStatus
  validationResult: ValidationResult
  confidenceScore?: number
  errorMessage?: string
  responseData?: Record<string, any>
  apiProvider?: string
  responseTimeMs?: number
}

export interface IThirdPartyValidationProvider {
  name: string
  validateLicense(request: ILicenseValidationRequest): Promise<ILicenseValidationResponse>
  isAvailable(): Promise<boolean>
  getSupportedLicenseTypes(): LicenseType[]
  getSupportedAuthorities(): string[]
}

export interface ILicenseValidatorService {
  validateLicense(
    licenseNumber: string,
    licenseType: LicenseType,
    issuingAuthority: string,
    method?: ValidationMethod,
    forceRevalidation?: boolean,
  ): Promise<ILicenseValidationResponse>

  bulkValidateLicenses(requests: ILicenseValidationRequest[]): Promise<ILicenseValidationResponse[]>

  checkLicenseExpiration(licenseId: string): Promise<boolean>

  getLicenseValidationHistory(licenseId: string): Promise<any[]>
}

export interface IMockValidationConfig {
  successRate: number // 0-100
  averageResponseTime: number // milliseconds
  enableRandomFailures: boolean
  simulateExpiredLicenses: string[] // license numbers to simulate as expired
  simulateInvalidLicenses: string[] // license numbers to simulate as invalid
  simulateSuspendedLicenses: string[] // license numbers to simulate as suspended
}

export interface ILicenseUploadRequest {
  licenseNumber: string
  licenseType: LicenseType
  holderId: string
  holderName: string
  issuingAuthority: string
  issueDate: Date
  expirationDate: Date
  documentFile?: Buffer
  documentMimeType?: string
}

export interface ILicenseSearchCriteria {
  licenseNumber?: string
  licenseType?: LicenseType
  holderId?: string
  issuingAuthority?: string
  validationStatus?: ValidationStatus
  expiredOnly?: boolean
  expiringSoonDays?: number
  limit?: number
  offset?: number
}

export interface IValidationStatistics {
  totalValidations: number
  successfulValidations: number
  failedValidations: number
  averageResponseTime: number
  validationsByMethod: Record<ValidationMethod, number>
  validationsByResult: Record<ValidationResult, number>
  recentValidations: number
}
