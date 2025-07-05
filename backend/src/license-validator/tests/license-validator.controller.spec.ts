import { Test, type TestingModule } from "@nestjs/testing"
import { BadRequestException, NotFoundException } from "@nestjs/common"
import { LicenseValidatorController } from "../controllers/license-validator.controller"
import { LicenseValidatorService } from "../services/license-validator.service"
import { MockValidationService } from "../services/mock-validation.service"
import { type License, LicenseType, LicenseStatus, ValidationStatus } from "../entities/license.entity"
import { ValidationMethod, ValidationResult } from "../entities/license-validation.entity"
import { jest } from "@jest/globals"

describe("LicenseValidatorController", () => {
  let controller: LicenseValidatorController
  let licenseValidatorService: LicenseValidatorService
  let mockValidationService: MockValidationService

  const mockLicenseValidatorService = {
    createLicense: jest.fn(),
    validateLicense: jest.fn(),
    bulkValidateLicenses: jest.fn(),
    findLicenses: jest.fn(),
    getLicenseById: jest.fn(),
    updateLicense: jest.fn(),
    deleteLicense: jest.fn(),
    getLicenseValidationHistory: jest.fn(),
    getValidationStatistics: jest.fn(),
    getLicenseStatistics: jest.fn(),
    createTestLicenses: jest.fn(),
  }

  const mockMockValidationService = {
    isAvailable: jest.fn(),
    getSupportedLicenseTypes: jest.fn(),
    getSupportedAuthorities: jest.fn(),
    getConfig: jest.fn(),
    setConfig: jest.fn(),
    addExpiredLicense: jest.fn(),
    addInvalidLicense: jest.fn(),
    addSuspendedLicense: jest.fn(),
    clearSimulatedLicenses: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LicenseValidatorController],
      providers: [
        {
          provide: LicenseValidatorService,
          useValue: mockLicenseValidatorService,
        },
        {
          provide: MockValidationService,
          useValue: mockMockValidationService,
        },
      ],
    }).compile()

    controller = module.get<LicenseValidatorController>(LicenseValidatorController)
    licenseValidatorService = module.get<LicenseValidatorService>(LicenseValidatorService)
    mockValidationService = module.get<MockValidationService>(MockValidationService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("createLicense", () => {
    it("should create a license successfully", async () => {
      const createLicenseDto = {
        licenseNumber: "DL123456789",
        licenseType: LicenseType.DRIVER_LICENSE,
        holderId: "driver-001",
        holderName: "John Doe",
        issuingAuthority: "CA",
        issueDate: "2020-01-15",
        expirationDate: "2025-01-15",
      }

      const mockLicense = {
        id: "license-uuid",
        ...createLicenseDto,
        issueDate: new Date(createLicenseDto.issueDate),
        expirationDate: new Date(createLicenseDto.expirationDate),
        licenseStatus: LicenseStatus.ACTIVE,
        validationStatus: ValidationStatus.PENDING,
        isActive: true,
        isExpired: false,
        isValid: false,
        daysUntilExpiration: 365,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as License

      mockLicenseValidatorService.createLicense.mockResolvedValue(mockLicense)

      const result = await controller.createLicense(createLicenseDto)

      expect(mockLicenseValidatorService.createLicense).toHaveBeenCalledWith(createLicenseDto)
      expect(result.id).toBe(mockLicense.id)
      expect(result.licenseNumber).toBe(createLicenseDto.licenseNumber)
    })
  })

  describe("validateLicense", () => {
    it("should validate a license successfully", async () => {
      const validateDto = {
        licenseNumber: "DL123456789",
        licenseType: LicenseType.DRIVER_LICENSE,
        issuingAuthority: "CA",
      }

      const mockValidationResponse = {
        isValid: true,
        validationStatus: ValidationStatus.VALID,
        validationResult: ValidationResult.PASS,
        confidenceScore: 95,
        apiProvider: "MockValidationProvider",
        responseTimeMs: 500,
      }

      const mockLicense = {
        id: "license-uuid",
        licenseNumber: validateDto.licenseNumber,
        licenseType: validateDto.licenseType,
        holderId: "driver-001",
        holderName: "John Doe",
        issuingAuthority: validateDto.issuingAuthority,
        issueDate: new Date("2020-01-15"),
        expirationDate: new Date("2025-01-15"),
        licenseStatus: LicenseStatus.ACTIVE,
        validationStatus: ValidationStatus.VALID,
        isActive: true,
        isExpired: false,
        isValid: true,
        daysUntilExpiration: 365,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as License

      mockLicenseValidatorService.validateLicense.mockResolvedValue(mockValidationResponse)
      mockLicenseValidatorService.findLicenses.mockResolvedValue({
        licenses: [mockLicense],
        total: 1,
      })

      const result = await controller.validateLicense(validateDto)

      expect(mockLicenseValidatorService.validateLicense).toHaveBeenCalledWith(
        validateDto.licenseNumber,
        validateDto.licenseType,
        validateDto.issuingAuthority,
        ValidationMethod.MOCK_VALIDATION,
        false,
      )
      expect(result.isValid).toBe(true)
      expect(result.license.id).toBe(mockLicense.id)
      expect(result.validation.validationStatus).toBe(ValidationStatus.VALID)
    })

    it("should handle validation failure", async () => {
      const validateDto = {
        licenseNumber: "INVALID123",
        licenseType: LicenseType.DRIVER_LICENSE,
        issuingAuthority: "CA",
      }

      const mockValidationResponse = {
        isValid: false,
        validationStatus: ValidationStatus.INVALID,
        validationResult: ValidationResult.FAIL,
        errorMessage: "License not found",
        apiProvider: "MockValidationProvider",
        responseTimeMs: 300,
      }

      const mockLicense = {
        id: "license-uuid",
        licenseNumber: validateDto.licenseNumber,
        licenseType: validateDto.licenseType,
        validationStatus: ValidationStatus.INVALID,
        isValid: false,
      } as License

      mockLicenseValidatorService.validateLicense.mockResolvedValue(mockValidationResponse)
      mockLicenseValidatorService.findLicenses.mockResolvedValue({
        licenses: [mockLicense],
        total: 1,
      })

      const result = await controller.validateLicense(validateDto)

      expect(result.isValid).toBe(false)
      expect(result.message).toBe("License not found")
      expect(result.validation.validationStatus).toBe(ValidationStatus.INVALID)
    })

    it("should throw error if no license found after validation", async () => {
      const validateDto = {
        licenseNumber: "NOTFOUND123",
        licenseType: LicenseType.DRIVER_LICENSE,
        issuingAuthority: "CA",
      }

      mockLicenseValidatorService.validateLicense.mockResolvedValue({
        isValid: false,
        validationStatus: ValidationStatus.ERROR,
        validationResult: ValidationResult.ERROR,
      })
      mockLicenseValidatorService.findLicenses.mockResolvedValue({
        licenses: [],
        total: 0,
      })

      await expect(controller.validateLicense(validateDto)).rejects.toThrow(BadRequestException)
    })
  })

  describe("bulkValidateLicenses", () => {
    it("should validate multiple licenses in bulk", async () => {
      const bulkValidateDto = {
        licenses: [
          {
            licenseNumber: "DL123456789",
            licenseType: LicenseType.DRIVER_LICENSE,
            issuingAuthority: "CA",
          },
          {
            licenseNumber: "CDL987654321",
            licenseType: LicenseType.CDL,
            issuingAuthority: "TX",
          },
        ],
      }

      const mockValidationResponses = [
        {
          isValid: true,
          validationStatus: ValidationStatus.VALID,
          validationResult: ValidationResult.PASS,
        },
        {
          isValid: false,
          validationStatus: ValidationStatus.INVALID,
          validationResult: ValidationResult.FAIL,
        },
      ]

      const mockLicenses = [
        { id: "license-1", licenseNumber: "DL123456789", isValid: true } as License,
        { id: "license-2", licenseNumber: "CDL987654321", isValid: false } as License,
      ]

      mockLicenseValidatorService.bulkValidateLicenses.mockResolvedValue(mockValidationResponses)
      mockLicenseValidatorService.findLicenses
        .mockResolvedValueOnce({ licenses: [mockLicenses[0]], total: 1 })
        .mockResolvedValueOnce({ licenses: [mockLicenses[1]], total: 1 })

      const result = await controller.bulkValidateLicenses(bulkValidateDto)

      expect(result.totalProcessed).toBe(2)
      expect(result.successful).toBe(1)
      expect(result.failed).toBe(1)
      expect(result.results).toHaveLength(2)
    })
  })

  describe("getLicenses", () => {
    it("should get licenses with pagination", async () => {
      const queryDto = {
        licenseType: LicenseType.DRIVER_LICENSE,
        limit: 10,
        offset: 0,
        sortBy: "createdAt",
        sortOrder: "DESC" as const,
      }

      const mockLicenses = [
        { id: "license-1", licenseNumber: "DL123" },
        { id: "license-2", licenseNumber: "DL456" },
      ] as License[]

      mockLicenseValidatorService.findLicenses.mockResolvedValue({
        licenses: mockLicenses,
        total: 25,
      })

      const result = await controller.getLicenses(queryDto)

      expect(result.licenses).toHaveLength(2)
      expect(result.total).toBe(25)
      expect(result.limit).toBe(10)
      expect(result.offset).toBe(0)
      expect(result.hasMore).toBe(true)
    })
  })

  describe("getLicenseById", () => {
    it("should get license by ID", async () => {
      const licenseId = "license-uuid"
      const mockLicense = {
        id: licenseId,
        licenseNumber: "DL123456789",
        licenseType: LicenseType.DRIVER_LICENSE,
      } as License

      mockLicenseValidatorService.getLicenseById.mockResolvedValue(mockLicense)

      const result = await controller.getLicenseById(licenseId)

      expect(mockLicenseValidatorService.getLicenseById).toHaveBeenCalledWith(licenseId)
      expect(result.id).toBe(licenseId)
    })

    it("should throw NotFoundException if license not found", async () => {
      const licenseId = "non-existent-license"
      mockLicenseValidatorService.getLicenseById.mockRejectedValue(new NotFoundException("License not found"))

      await expect(controller.getLicenseById(licenseId)).rejects.toThrow(NotFoundException)
    })
  })

  describe("updateLicense", () => {
    it("should update license successfully", async () => {
      const licenseId = "license-uuid"
      const updateData = {
        holderName: "Jane Doe Updated",
        expirationDate: "2026-01-15",
      }

      const updatedLicense = {
        id: licenseId,
        holderName: "Jane Doe Updated",
        expirationDate: new Date("2026-01-15"),
      } as License

      mockLicenseValidatorService.updateLicense.mockResolvedValue(updatedLicense)

      const result = await controller.updateLicense(licenseId, updateData)

      expect(mockLicenseValidatorService.updateLicense).toHaveBeenCalledWith(licenseId, updateData)
      expect(result.holderName).toBe("Jane Doe Updated")
    })
  })

  describe("deleteLicense", () => {
    it("should delete license successfully", async () => {
      const licenseId = "license-uuid"
      mockLicenseValidatorService.deleteLicense.mockResolvedValue(undefined)

      await controller.deleteLicense(licenseId)

      expect(mockLicenseValidatorService.deleteLicense).toHaveBeenCalledWith(licenseId)
    })
  })

  describe("getLicenseValidationHistory", () => {
    it("should get license validation history", async () => {
      const licenseId = "license-uuid"
      const mockHistory = [
        { id: "validation-1", validationDate: new Date() },
        { id: "validation-2", validationDate: new Date() },
      ]

      mockLicenseValidatorService.getLicenseValidationHistory.mockResolvedValue(mockHistory)

      const result = await controller.getLicenseValidationHistory(licenseId)

      expect(result.licenseId).toBe(licenseId)
      expect(result.validations).toEqual(mockHistory)
      expect(result.totalValidations).toBe(2)
    })
  })

  describe("revalidateLicense", () => {
    it("should force revalidation of a license", async () => {
      const licenseId = "license-uuid"
      const mockLicense = {
        id: licenseId,
        licenseNumber: "DL123456789",
        licenseType: LicenseType.DRIVER_LICENSE,
        issuingAuthority: "CA",
      } as License

      const mockValidationResponse = {
        isValid: true,
        validationStatus: ValidationStatus.VALID,
        validationResult: ValidationResult.PASS,
        apiProvider: "MockValidationProvider",
        responseTimeMs: 400,
      }

      mockLicenseValidatorService.getLicenseById.mockResolvedValue(mockLicense)
      mockLicenseValidatorService.validateLicense.mockResolvedValue(mockValidationResponse)

      const result = await controller.revalidateLicense(licenseId)

      expect(mockLicenseValidatorService.validateLicense).toHaveBeenCalledWith(
        mockLicense.licenseNumber,
        mockLicense.licenseType,
        mockLicense.issuingAuthority,
        ValidationMethod.MOCK_VALIDATION,
        true, // Force revalidation
      )
      expect(result.isValid).toBe(true)
    })
  })

  describe("statistics endpoints", () => {
    it("should get license statistics", async () => {
      const mockStats = {
        totalLicenses: 100,
        activeLicenses: 85,
        expiredLicenses: 10,
        validLicenses: 80,
      }

      mockLicenseValidatorService.getLicenseStatistics.mockResolvedValue(mockStats)

      const result = await controller.getLicenseStatistics()

      expect(result).toEqual(mockStats)
    })

    it("should get validation statistics", async () => {
      const mockStats = {
        totalValidations: 500,
        successfulValidations: 425,
        failedValidations: 75,
        averageResponseTime: 450,
      }

      mockLicenseValidatorService.getValidationStatistics.mockResolvedValue(mockStats)

      const result = await controller.getValidationStatistics()

      expect(result).toEqual(mockStats)
    })
  })

  describe("test endpoints", () => {
    it("should create test licenses", async () => {
      const mockTestLicenses = [
        { id: "test-license-1", licenseNumber: "DL123" },
        { id: "test-license-2", licenseNumber: "CDL456" },
      ] as License[]

      mockLicenseValidatorService.createTestLicenses.mockResolvedValue(mockTestLicenses)

      const result = await controller.createTestLicenses()

      expect(result.message).toBe("Test licenses created successfully")
      expect(result.count).toBe(2)
      expect(result.licenses).toHaveLength(2)
    })

    it("should configure mock validation service", async () => {
      const config = {
        successRate: 90,
        expiredLicenses: ["EXPIRED123"],
        invalidLicenses: ["INVALID123"],
      }

      const mockCurrentConfig = {
        successRate: 90,
        averageResponseTime: 500,
        enableRandomFailures: true,
        simulateExpiredLicenses: ["EXPIRED123"],
        simulateInvalidLicenses: ["INVALID123"],
        simulateSuspendedLicenses: [],
      }

      mockMockValidationService.getConfig.mockReturnValue(mockCurrentConfig)

      const result = await controller.configureMockValidation(config)

      expect(mockMockValidationService.addExpiredLicense).toHaveBeenCalledWith("EXPIRED123")
      expect(mockMockValidationService.addInvalidLicense).toHaveBeenCalledWith("INVALID123")
      expect(result.message).toBe("Mock validation service configured successfully")
    })

    it("should reset mock validation service", async () => {
      const mockResetConfig = {
        successRate: 85,
        averageResponseTime: 500,
        enableRandomFailures: true,
        simulateExpiredLicenses: [],
        simulateInvalidLicenses: [],
        simulateSuspendedLicenses: [],
      }

      mockMockValidationService.getConfig.mockReturnValue(mockResetConfig)

      const result = await controller.resetMockValidation()

      expect(mockMockValidationService.clearSimulatedLicenses).toHaveBeenCalled()
      expect(result.message).toBe("Mock validation service reset successfully")
    })
  })

  describe("healthCheck", () => {
    it("should return health status", async () => {
      const mockStats = {
        totalValidations: 100,
        recentValidations: 5,
        averageResponseTime: 400,
      }

      mockMockValidationService.isAvailable.mockResolvedValue(true)
      mockMockValidationService.getSupportedLicenseTypes.mockReturnValue([LicenseType.DRIVER_LICENSE])
      mockMockValidationService.getSupportedAuthorities.mockReturnValue(["CA", "NY", "TX"])
      mockLicenseValidatorService.getValidationStatistics.mockResolvedValue(mockStats)

      const result = await controller.healthCheck()

      expect(result.status).toBe("healthy")
      expect(result.services.mockValidation.available).toBe(true)
      expect(result.statistics.totalValidations).toBe(100)
    })
  })
})
