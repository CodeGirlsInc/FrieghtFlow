import { Test, type TestingModule } from "@nestjs/testing"
import { ConfigService } from "@nestjs/config"
import { MockValidationService } from "../services/mock-validation.service"
import { LicenseType, ValidationStatus } from "../entities/license.entity"
import { ValidationResult } from "../entities/license-validation.entity"
import { jest } from "@jest/globals"

describe("MockValidationService", () => {
  let service: MockValidationService

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue: any) => {
      const config = {
        MOCK_VALIDATION_SUCCESS_RATE: 85,
        MOCK_VALIDATION_RESPONSE_TIME: 500,
        MOCK_VALIDATION_RANDOM_FAILURES: true,
        MOCK_EXPIRED_LICENSES: "",
        MOCK_INVALID_LICENSES: "",
        MOCK_SUSPENDED_LICENSES: "",
      }
      return config[key] || defaultValue
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockValidationService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<MockValidationService>(MockValidationService)
  })

  afterEach(() => {
    service.clearSimulatedLicenses()
  })

  describe("validateLicense", () => {
    it("should validate a license successfully", async () => {
      const request = {
        licenseNumber: "DL123456789",
        licenseType: LicenseType.DRIVER_LICENSE,
        issuingAuthority: "CA",
        holderName: "John Doe",
      }

      const result = await service.validateLicense(request)

      expect(result).toHaveProperty("isValid")
      expect(result).toHaveProperty("validationStatus")
      expect(result).toHaveProperty("validationResult")
      expect(result).toHaveProperty("responseTimeMs")
      expect(result).toHaveProperty("apiProvider")
      expect(result.apiProvider).toBe("MockValidationProvider")
      expect(typeof result.responseTimeMs).toBe("number")
      expect(result.responseTimeMs).toBeGreaterThan(0)
    })

    it("should simulate expired license validation", async () => {
      const licenseNumber = "EXPIRED123"
      service.addExpiredLicense(licenseNumber)

      const request = {
        licenseNumber,
        licenseType: LicenseType.DRIVER_LICENSE,
        issuingAuthority: "CA",
      }

      const result = await service.validateLicense(request)

      expect(result.isValid).toBe(false)
      expect(result.validationStatus).toBe(ValidationStatus.EXPIRED)
      expect(result.validationResult).toBe(ValidationResult.FAIL)
      expect(result.errorMessage).toBe("License has expired")
      expect(result.confidenceScore).toBe(95)
    })

    it("should simulate invalid license validation", async () => {
      const licenseNumber = "INVALID123"
      service.addInvalidLicense(licenseNumber)

      const request = {
        licenseNumber,
        licenseType: LicenseType.DRIVER_LICENSE,
        issuingAuthority: "CA",
      }

      const result = await service.validateLicense(request)

      expect(result.isValid).toBe(false)
      expect(result.validationStatus).toBe(ValidationStatus.INVALID)
      expect(result.validationResult).toBe(ValidationResult.FAIL)
      expect(result.errorMessage).toBe("License number not found in database")
      expect(result.confidenceScore).toBe(98)
    })

    it("should simulate suspended license validation", async () => {
      const licenseNumber = "SUSPENDED123"
      service.addSuspendedLicense(licenseNumber)

      const request = {
        licenseNumber,
        licenseType: LicenseType.DRIVER_LICENSE,
        issuingAuthority: "CA",
      }

      const result = await service.validateLicense(request)

      expect(result.isValid).toBe(false)
      expect(result.validationStatus).toBe(ValidationStatus.SUSPENDED)
      expect(result.validationResult).toBe(ValidationResult.FAIL)
      expect(result.errorMessage).toBe("License is currently suspended")
      expect(result.confidenceScore).toBe(92)
    })

    it("should include response data for successful validations", async () => {
      // Set success rate to 100% for this test
      service.setConfig({ successRate: 100, enableRandomFailures: false })

      const request = {
        licenseNumber: "DL123456789",
        licenseType: LicenseType.DRIVER_LICENSE,
        issuingAuthority: "CA",
      }

      const result = await service.validateLicense(request)

      expect(result.isValid).toBe(true)
      expect(result.responseData).toBeDefined()
      expect(result.responseData.status).toBe("ACTIVE")
      expect(result.responseData.licenseNumber).toBe(request.licenseNumber)
      expect(result.responseData.licenseType).toBe(request.licenseType)
      expect(result.responseData.issuingAuthority).toBe(request.issuingAuthority)
    })

    it("should generate CDL-specific endorsements", async () => {
      service.setConfig({ successRate: 100, enableRandomFailures: false })

      const request = {
        licenseNumber: "CDL123456789",
        licenseType: LicenseType.CDL,
        issuingAuthority: "TX",
      }

      const result = await service.validateLicense(request)

      expect(result.isValid).toBe(true)
      expect(result.responseData).toBeDefined()
      expect(result.responseData.endorsements).toBeDefined()
      expect(Array.isArray(result.responseData.endorsements)).toBe(true)
    })
  })

  describe("isAvailable", () => {
    it("should return availability status", async () => {
      const isAvailable = await service.isAvailable()
      expect(typeof isAvailable).toBe("boolean")
    })
  })

  describe("getSupportedLicenseTypes", () => {
    it("should return all license types", () => {
      const supportedTypes = service.getSupportedLicenseTypes()
      expect(supportedTypes).toContain(LicenseType.DRIVER_LICENSE)
      expect(supportedTypes).toContain(LicenseType.CDL)
      expect(supportedTypes).toContain(LicenseType.VEHICLE_REGISTRATION)
    })
  })

  describe("getSupportedAuthorities", () => {
    it("should return supported authorities", () => {
      const authorities = service.getSupportedAuthorities()
      expect(authorities).toContain("CA")
      expect(authorities).toContain("NY")
      expect(authorities).toContain("TX")
      expect(authorities).toContain("DOT")
      expect(authorities).toContain("FMCSA")
    })
  })

  describe("configuration management", () => {
    it("should update configuration", () => {
      const newConfig = {
        successRate: 95,
        averageResponseTime: 300,
        enableRandomFailures: false,
      }

      service.setConfig(newConfig)
      const currentConfig = service.getConfig()

      expect(currentConfig.successRate).toBe(95)
      expect(currentConfig.averageResponseTime).toBe(300)
      expect(currentConfig.enableRandomFailures).toBe(false)
    })

    it("should manage simulated license scenarios", () => {
      const expiredLicense = "EXPIRED001"
      const invalidLicense = "INVALID001"
      const suspendedLicense = "SUSPENDED001"

      service.addExpiredLicense(expiredLicense)
      service.addInvalidLicense(invalidLicense)
      service.addSuspendedLicense(suspendedLicense)

      const config = service.getConfig()
      expect(config.simulateExpiredLicenses).toContain(expiredLicense)
      expect(config.simulateInvalidLicenses).toContain(invalidLicense)
      expect(config.simulateSuspendedLicenses).toContain(suspendedLicense)

      service.clearSimulatedLicenses()
      const clearedConfig = service.getConfig()
      expect(clearedConfig.simulateExpiredLicenses).toHaveLength(0)
      expect(clearedConfig.simulateInvalidLicenses).toHaveLength(0)
      expect(clearedConfig.simulateSuspendedLicenses).toHaveLength(0)
    })
  })

  describe("response time simulation", () => {
    it("should simulate realistic response times", async () => {
      const request = {
        licenseNumber: "DL123456789",
        licenseType: LicenseType.DRIVER_LICENSE,
        issuingAuthority: "CA",
      }

      const startTime = Date.now()
      const result = await service.validateLicense(request)
      const actualTime = Date.now() - startTime

      // Response time should be close to configured average (with some variation)
      expect(result.responseTimeMs).toBeGreaterThan(100)
      expect(result.responseTimeMs).toBeLessThan(1000)
      expect(actualTime).toBeGreaterThanOrEqual(result.responseTimeMs - 50) // Allow some tolerance
    })
  })
})
