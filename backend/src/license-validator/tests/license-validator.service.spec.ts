import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { ConfigService } from "@nestjs/config"
import { LicenseValidatorService } from "../services/license-validator.service"
import { MockValidationService } from "../services/mock-validation.service"
import { License, LicenseType, LicenseStatus, ValidationStatus } from "../entities/license.entity"
import { LicenseValidation, ValidationMethod, ValidationResult } from "../entities/license-validation.entity"
import { jest } from "@jest/globals" // Import jest to declare it

describe("LicenseValidatorService", () => {
  let service: LicenseValidatorService
  let licenseRepository: Repository<License>
  let validationRepository: Repository<LicenseValidation>
  let mockValidationService: MockValidationService

  const mockLicenseRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockValidationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LicenseValidatorService,
        MockValidationService,
        {
          provide: getRepositoryToken(License),
          useValue: mockLicenseRepository,
        },
        {
          provide: getRepositoryToken(LicenseValidation),
          useValue: mockValidationRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<LicenseValidatorService>(LicenseValidatorService)
    licenseRepository = module.get<Repository<License>>(getRepositoryToken(License))
    validationRepository = module.get<Repository<LicenseValidation>>(getRepositoryToken(LicenseValidation))
    mockValidationService = module.get<MockValidationService>(MockValidationService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("createLicense", () => {
    it("should create a new license successfully", async () => {
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
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockLicenseRepository.findOne.mockResolvedValue(null)
      mockLicenseRepository.create.mockReturnValue(mockLicense)
      mockLicenseRepository.save.mockResolvedValue(mockLicense)

      const result = await service.createLicense(createLicenseDto)

      expect(mockLicenseRepository.findOne).toHaveBeenCalledWith({
        where: {
          licenseNumber: createLicenseDto.licenseNumber,
          licenseType: createLicenseDto.licenseType,
        },
      })
      expect(mockLicenseRepository.create).toHaveBeenCalled()
      expect(mockLicenseRepository.save).toHaveBeenCalled()
      expect(result).toEqual(mockLicense)
    })

    it("should throw error if license already exists", async () => {
      const createLicenseDto = {
        licenseNumber: "DL123456789",
        licenseType: LicenseType.DRIVER_LICENSE,
        holderId: "driver-001",
        holderName: "John Doe",
        issuingAuthority: "CA",
        issueDate: "2020-01-15",
        expirationDate: "2025-01-15",
      }

      const existingLicense = { id: "existing-license" }
      mockLicenseRepository.findOne.mockResolvedValue(existingLicense)

      await expect(service.createLicense(createLicenseDto)).rejects.toThrow(
        "License DL123456789 of type driver_license already exists",
      )
    })
  })

  describe("validateLicense", () => {
    it("should validate a license successfully", async () => {
      const licenseNumber = "DL123456789"
      const licenseType = LicenseType.DRIVER_LICENSE
      const issuingAuthority = "CA"

      const mockLicense = {
        id: "license-uuid",
        licenseNumber,
        licenseType,
        holderId: "driver-001",
        holderName: "John Doe",
        issuingAuthority,
        issueDate: new Date("2020-01-15"),
        expirationDate: new Date("2025-01-15"),
        licenseStatus: LicenseStatus.ACTIVE,
        validationStatus: ValidationStatus.PENDING,
        lastValidatedAt: null,
        isActive: true,
      }

      const mockValidationResponse = {
        isValid: true,
        validationStatus: ValidationStatus.VALID,
        validationResult: ValidationResult.PASS,
        confidenceScore: 95,
        apiProvider: "MockValidationProvider",
        responseTimeMs: 500,
      }

      const mockValidation = {
        id: "validation-uuid",
        licenseId: mockLicense.id,
        validationMethod: ValidationMethod.MOCK_VALIDATION,
        validationResult: ValidationResult.PASS,
        validationStatus: ValidationStatus.VALID,
      }

      mockLicenseRepository.findOne.mockResolvedValue(mockLicense)
      mockLicenseRepository.save.mockResolvedValue({
        ...mockLicense,
        validationStatus: ValidationStatus.VALID,
        lastValidatedAt: new Date(),
      })
      mockValidationRepository.create.mockReturnValue(mockValidation)
      mockValidationRepository.save.mockResolvedValue(mockValidation)

      jest.spyOn(mockValidationService, "validateLicense").mockResolvedValue(mockValidationResponse)

      const result = await service.validateLicense(licenseNumber, licenseType, issuingAuthority)

      expect(mockLicenseRepository.findOne).toHaveBeenCalledWith({
        where: { licenseNumber, licenseType },
      })
      expect(mockValidationService.validateLicense).toHaveBeenCalled()
      expect(mockLicenseRepository.save).toHaveBeenCalled()
      expect(mockValidationRepository.create).toHaveBeenCalled()
      expect(mockValidationRepository.save).toHaveBeenCalled()
      expect(result).toEqual(mockValidationResponse)
    })

    it("should return cached result if recently validated", async () => {
      const licenseNumber = "DL123456789"
      const licenseType = LicenseType.DRIVER_LICENSE
      const issuingAuthority = "CA"

      const mockLicense = {
        id: "license-uuid",
        licenseNumber,
        licenseType,
        holderId: "driver-001",
        holderName: "John Doe",
        issuingAuthority,
        issueDate: new Date("2020-01-15"),
        expirationDate: new Date("2025-01-15"),
        licenseStatus: LicenseStatus.ACTIVE,
        validationStatus: ValidationStatus.VALID,
        lastValidatedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        isActive: true,
        isValid: true,
      }

      mockLicenseRepository.findOne.mockResolvedValue(mockLicense)

      const result = await service.validateLicense(licenseNumber, licenseType, issuingAuthority)

      expect(result.apiProvider).toBe("cached")
      expect(result.responseTimeMs).toBe(0)
      expect(result.isValid).toBe(true)
    })

    it("should handle validation errors gracefully", async () => {
      const licenseNumber = "INVALID123"
      const licenseType = LicenseType.DRIVER_LICENSE
      const issuingAuthority = "CA"

      const mockLicense = {
        id: "license-uuid",
        licenseNumber,
        licenseType,
        holderId: "driver-001",
        holderName: "John Doe",
        issuingAuthority,
        issueDate: new Date("2020-01-15"),
        expirationDate: new Date("2025-01-15"),
        licenseStatus: LicenseStatus.ACTIVE,
        validationStatus: ValidationStatus.PENDING,
        lastValidatedAt: null,
        isActive: true,
      }

      const validationError = new Error("Validation service unavailable")

      mockLicenseRepository.findOne.mockResolvedValue(mockLicense)
      mockLicenseRepository.save.mockResolvedValue(mockLicense)
      mockValidationRepository.create.mockReturnValue({})
      mockValidationRepository.save.mockResolvedValue({})

      jest.spyOn(mockValidationService, "validateLicense").mockRejectedValue(validationError)

      const result = await service.validateLicense(licenseNumber, licenseType, issuingAuthority)

      expect(result.isValid).toBe(false)
      expect(result.validationStatus).toBe(ValidationStatus.ERROR)
      expect(result.validationResult).toBe(ValidationResult.ERROR)
      expect(result.errorMessage).toBe("Validation service unavailable")
    })
  })

  describe("bulkValidateLicenses", () => {
    it("should validate multiple licenses in bulk", async () => {
      const requests = [
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
      ]

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

      jest
        .spyOn(service, "validateLicense")
        .mockResolvedValueOnce(mockValidationResponses[0])
        .mockResolvedValueOnce(mockValidationResponses[1])

      const results = await service.bulkValidateLicenses(requests)

      expect(results).toHaveLength(2)
      expect(results[0].isValid).toBe(true)
      expect(results[1].isValid).toBe(false)
    })
  })

  describe("checkLicenseExpiration", () => {
    it("should return true for expired license", async () => {
      const licenseId = "license-uuid"
      const mockLicense = {
        id: licenseId,
        expirationDate: new Date("2020-01-01"), // Expired
        isExpired: true,
      }

      mockLicenseRepository.findOne.mockResolvedValue(mockLicense)

      const result = await service.checkLicenseExpiration(licenseId)

      expect(result).toBe(true)
    })

    it("should return false for valid license", async () => {
      const licenseId = "license-uuid"
      const mockLicense = {
        id: licenseId,
        expirationDate: new Date("2025-01-01"), // Valid
        isExpired: false,
      }

      mockLicenseRepository.findOne.mockResolvedValue(mockLicense)

      const result = await service.checkLicenseExpiration(licenseId)

      expect(result).toBe(false)
    })

    it("should throw error if license not found", async () => {
      const licenseId = "non-existent-license"
      mockLicenseRepository.findOne.mockResolvedValue(null)

      await expect(service.checkLicenseExpiration(licenseId)).rejects.toThrow(
        "License with ID non-existent-license not found",
      )
    })
  })

  describe("findLicenses", () => {
    it("should find licenses with filters", async () => {
      const queryDto = {
        licenseType: LicenseType.DRIVER_LICENSE,
        issuingAuthority: "CA",
        limit: 10,
        offset: 0,
        sortBy: "createdAt",
        sortOrder: "DESC" as const,
      }

      const mockLicenses = [
        { id: "license-1", licenseNumber: "DL123" },
        { id: "license-2", licenseNumber: "DL456" },
      ]

      mockLicenseRepository.findAndCount.mockResolvedValue([mockLicenses, 2])

      const result = await service.findLicenses(queryDto)

      expect(result.licenses).toEqual(mockLicenses)
      expect(result.total).toBe(2)
      expect(mockLicenseRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          licenseType: LicenseType.DRIVER_LICENSE,
          issuingAuthority: "CA",
        },
        order: { createdAt: "DESC" },
        take: 10,
        skip: 0,
      })
    })
  })

  describe("getValidationStatistics", () => {
    it("should return validation statistics", async () => {
      const mockStats = {
        totalValidations: 100,
        successfulValidations: 85,
        failedValidations: 15,
        averageResponseTime: 500,
        recentValidations: 10,
      }

      mockValidationRepository.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(85) // successful
        .mockResolvedValueOnce(15) // failed
        .mockResolvedValueOnce(10) // recent

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avg: "500" }),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      }

      mockValidationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      const result = await service.getValidationStatistics()

      expect(result.totalValidations).toBe(100)
      expect(result.successfulValidations).toBe(85)
      expect(result.failedValidations).toBe(15)
      expect(result.averageResponseTime).toBe(500)
      expect(result.recentValidations).toBe(10)
    })
  })
})
