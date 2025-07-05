import { Injectable, Logger } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import type {
  ILicenseValidationRequest,
  ILicenseValidationResponse,
  IThirdPartyValidationProvider,
  IMockValidationConfig,
} from "../interfaces/license-validator.interface"
import { LicenseType, ValidationStatus } from "../entities/license.entity"
import { ValidationResult } from "../entities/license-validation.entity"

@Injectable()
export class MockValidationService implements IThirdPartyValidationProvider {
  private readonly logger = new Logger(MockValidationService.name)
  public readonly name = "MockValidationProvider"

  private readonly config: IMockValidationConfig

  constructor(private configService: ConfigService) {
    this.config = {
      successRate: this.configService.get<number>("MOCK_VALIDATION_SUCCESS_RATE", 85),
      averageResponseTime: this.configService.get<number>("MOCK_VALIDATION_RESPONSE_TIME", 500),
      enableRandomFailures: this.configService.get<boolean>("MOCK_VALIDATION_RANDOM_FAILURES", true),
      simulateExpiredLicenses: this.configService.get<string>("MOCK_EXPIRED_LICENSES", "").split(",").filter(Boolean),
      simulateInvalidLicenses: this.configService.get<string>("MOCK_INVALID_LICENSES", "").split(",").filter(Boolean),
      simulateSuspendedLicenses: this.configService
        .get<string>("MOCK_SUSPENDED_LICENSES", "")
        .split(",")
        .filter(Boolean),
    }

    this.logger.log(`MockValidationService initialized with config: ${JSON.stringify(this.config)}`)
  }

  async validateLicense(request: ILicenseValidationRequest): Promise<ILicenseValidationResponse> {
    const startTime = Date.now()

    this.logger.log(`Validating license: ${request.licenseNumber} (${request.licenseType})`)

    // Simulate API response time
    await this.simulateDelay()

    try {
      // Check for simulated scenarios
      const simulatedResult = this.checkSimulatedScenarios(request)
      if (simulatedResult) {
        const responseTime = Date.now() - startTime
        this.logger.log(`Simulated validation result for ${request.licenseNumber}: ${simulatedResult.validationStatus}`)
        return {
          ...simulatedResult,
          responseTimeMs: responseTime,
          apiProvider: this.name,
        }
      }

      // Generate random validation result based on success rate
      const isSuccess = this.shouldSucceed()
      const confidenceScore = this.generateConfidenceScore(isSuccess)

      const response: ILicenseValidationResponse = {
        isValid: isSuccess,
        validationStatus: isSuccess ? ValidationStatus.VALID : ValidationStatus.INVALID,
        validationResult: isSuccess ? ValidationResult.PASS : ValidationResult.FAIL,
        confidenceScore,
        responseData: this.generateMockResponseData(request, isSuccess),
        apiProvider: this.name,
        responseTimeMs: Date.now() - startTime,
      }

      if (!isSuccess) {
        response.errorMessage = this.generateRandomErrorMessage()
      }

      this.logger.log(`Mock validation completed for ${request.licenseNumber}: ${response.validationStatus}`)
      return response
    } catch (error) {
      const responseTime = Date.now() - startTime
      this.logger.error(`Mock validation error for ${request.licenseNumber}:`, error)

      return {
        isValid: false,
        validationStatus: ValidationStatus.ERROR,
        validationResult: ValidationResult.ERROR,
        errorMessage: error.message || "Mock validation service error",
        apiProvider: this.name,
        responseTimeMs: responseTime,
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    // Simulate occasional service unavailability
    const availability = Math.random() > 0.05 // 95% availability
    this.logger.log(`Mock validation service availability check: ${availability}`)
    return availability
  }

  getSupportedLicenseTypes(): LicenseType[] {
    return Object.values(LicenseType)
  }

  getSupportedAuthorities(): string[] {
    return [
      "CA",
      "NY",
      "TX",
      "FL",
      "IL",
      "PA",
      "OH",
      "GA",
      "NC",
      "MI",
      "NJ",
      "VA",
      "WA",
      "AZ",
      "MA",
      "TN",
      "IN",
      "MO",
      "MD",
      "WI",
      "CO",
      "MN",
      "SC",
      "AL",
      "LA",
      "KY",
      "OR",
      "OK",
      "CT",
      "UT",
      "DOT",
      "FMCSA",
      "FEDERAL",
    ]
  }

  private async simulateDelay(): Promise<void> {
    const baseDelay = this.config.averageResponseTime
    const variation = baseDelay * 0.3 // 30% variation
    const delay = baseDelay + (Math.random() - 0.5) * variation

    await new Promise((resolve) => setTimeout(resolve, Math.max(100, delay)))
  }

  private checkSimulatedScenarios(request: ILicenseValidationRequest): ILicenseValidationResponse | null {
    const { licenseNumber } = request

    // Check for expired licenses
    if (this.config.simulateExpiredLicenses.includes(licenseNumber)) {
      return {
        isValid: false,
        validationStatus: ValidationStatus.EXPIRED,
        validationResult: ValidationResult.FAIL,
        errorMessage: "License has expired",
        confidenceScore: 95,
        responseData: {
          expirationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          status: "EXPIRED",
        },
      }
    }

    // Check for invalid licenses
    if (this.config.simulateInvalidLicenses.includes(licenseNumber)) {
      return {
        isValid: false,
        validationStatus: ValidationStatus.INVALID,
        validationResult: ValidationResult.FAIL,
        errorMessage: "License number not found in database",
        confidenceScore: 98,
        responseData: {
          status: "NOT_FOUND",
        },
      }
    }

    // Check for suspended licenses
    if (this.config.simulateSuspendedLicenses.includes(licenseNumber)) {
      return {
        isValid: false,
        validationStatus: ValidationStatus.SUSPENDED,
        validationResult: ValidationResult.FAIL,
        errorMessage: "License is currently suspended",
        confidenceScore: 92,
        responseData: {
          status: "SUSPENDED",
          suspensionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          suspensionReason: "Administrative action",
        },
      }
    }

    return null
  }

  private shouldSucceed(): boolean {
    if (!this.config.enableRandomFailures) {
      return true
    }
    return Math.random() * 100 < this.config.successRate
  }

  private generateConfidenceScore(isSuccess: boolean): number {
    if (isSuccess) {
      return Math.floor(Math.random() * 15) + 85 // 85-100 for successful validations
    } else {
      return Math.floor(Math.random() * 30) + 60 // 60-90 for failed validations
    }
  }

  private generateMockResponseData(request: ILicenseValidationRequest, isSuccess: boolean): Record<string, any> {
    const baseData = {
      licenseNumber: request.licenseNumber,
      licenseType: request.licenseType,
      issuingAuthority: request.issuingAuthority,
      validationTimestamp: new Date().toISOString(),
      provider: this.name,
    }

    if (isSuccess) {
      return {
        ...baseData,
        status: "ACTIVE",
        issueDate: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000), // Random date within 5 years
        expirationDate: new Date(Date.now() + Math.random() * 2 * 365 * 24 * 60 * 60 * 1000), // Random date within 2 years
        restrictions: this.generateRandomRestrictions(request.licenseType),
        endorsements: this.generateRandomEndorsements(request.licenseType),
      }
    } else {
      return {
        ...baseData,
        status: "INVALID",
        errorCode: this.generateRandomErrorCode(),
      }
    }
  }

  private generateRandomRestrictions(licenseType: LicenseType): string[] {
    const allRestrictions = [
      "CORRECTIVE_LENSES",
      "DAYLIGHT_ONLY",
      "NO_INTERSTATE",
      "AUTOMATIC_TRANSMISSION",
      "HEARING_AID",
      "OUTSIDE_MIRRORS",
    ]

    if (licenseType === LicenseType.CDL) {
      allRestrictions.push("NO_PASSENGER", "NO_SCHOOL_BUS", "INTRASTATE_ONLY")
    }

    const numRestrictions = Math.floor(Math.random() * 3)
    return allRestrictions.slice(0, numRestrictions)
  }

  private generateRandomEndorsements(licenseType: LicenseType): string[] {
    if (licenseType !== LicenseType.CDL) {
      return []
    }

    const allEndorsements = ["H", "N", "P", "S", "T", "X"]
    const numEndorsements = Math.floor(Math.random() * 4)
    return allEndorsements.slice(0, numEndorsements)
  }

  private generateRandomErrorMessage(): string {
    const errorMessages = [
      "License number format is invalid",
      "Issuing authority not recognized",
      "License has been revoked",
      "Insufficient data for validation",
      "License type mismatch",
      "Validation service temporarily unavailable",
      "License holder information mismatch",
      "Document verification failed",
    ]

    return errorMessages[Math.floor(Math.random() * errorMessages.length)]
  }

  private generateRandomErrorCode(): string {
    const errorCodes = [
      "INVALID_FORMAT",
      "NOT_FOUND",
      "REVOKED",
      "INSUFFICIENT_DATA",
      "TYPE_MISMATCH",
      "SERVICE_UNAVAILABLE",
      "HOLDER_MISMATCH",
      "DOCUMENT_INVALID",
    ]

    return errorCodes[Math.floor(Math.random() * errorCodes.length)]
  }

  // Test helper methods
  public setConfig(config: Partial<IMockValidationConfig>): void {
    Object.assign(this.config, config)
    this.logger.log(`Mock validation config updated: ${JSON.stringify(this.config)}`)
  }

  public getConfig(): IMockValidationConfig {
    return { ...this.config }
  }

  public addExpiredLicense(licenseNumber: string): void {
    if (!this.config.simulateExpiredLicenses.includes(licenseNumber)) {
      this.config.simulateExpiredLicenses.push(licenseNumber)
      this.logger.log(`Added expired license simulation: ${licenseNumber}`)
    }
  }

  public addInvalidLicense(licenseNumber: string): void {
    if (!this.config.simulateInvalidLicenses.includes(licenseNumber)) {
      this.config.simulateInvalidLicenses.push(licenseNumber)
      this.logger.log(`Added invalid license simulation: ${licenseNumber}`)
    }
  }

  public addSuspendedLicense(licenseNumber: string): void {
    if (!this.config.simulateSuspendedLicenses.includes(licenseNumber)) {
      this.config.simulateSuspendedLicenses.push(licenseNumber)
      this.logger.log(`Added suspended license simulation: ${licenseNumber}`)
    }
  }

  public clearSimulatedLicenses(): void {
    this.config.simulateExpiredLicenses = []
    this.config.simulateInvalidLicenses = []
    this.config.simulateSuspendedLicenses = []
    this.logger.log("Cleared all simulated license scenarios")
  }
}
