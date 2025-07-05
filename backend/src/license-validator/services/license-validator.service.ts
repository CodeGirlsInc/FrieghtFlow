import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common"
import { type Repository, type FindOptionsWhere, Between, LessThan, MoreThan } from "typeorm"
import { type License, LicenseType, LicenseStatus, ValidationStatus } from "../entities/license.entity"
import { type LicenseValidation, ValidationMethod, ValidationResult } from "../entities/license-validation.entity"
import type { MockValidationService } from "./mock-validation.service"
import type {
  ILicenseValidationRequest,
  ILicenseValidationResponse,
  ILicenseValidatorService,
  IValidationStatistics,
} from "../interfaces/license-validator.interface"
import type { CreateLicenseDto } from "../dto/create-license.dto"
import type { QueryLicensesDto } from "../dto/query-licenses.dto"

@Injectable()
export class LicenseValidatorService implements ILicenseValidatorService {
  private readonly logger = new Logger(LicenseValidatorService.name)

  constructor(
    private licenseRepository: Repository<License>,
    private validationRepository: Repository<LicenseValidation>,
    private mockValidationService: MockValidationService,
  ) {}

  async createLicense(createLicenseDto: CreateLicenseDto): Promise<License> {
    this.logger.log(`Creating license: ${createLicenseDto.licenseNumber}`)

    // Check if license already exists
    const existingLicense = await this.licenseRepository.findOne({
      where: {
        licenseNumber: createLicenseDto.licenseNumber,
        licenseType: createLicenseDto.licenseType,
      },
    })

    if (existingLicense) {
      throw new BadRequestException(
        `License ${createLicenseDto.licenseNumber} of type ${createLicenseDto.licenseType} already exists`,
      )
    }

    const license = this.licenseRepository.create({
      ...createLicenseDto,
      issueDate: new Date(createLicenseDto.issueDate),
      expirationDate: new Date(createLicenseDto.expirationDate),
    })

    const savedLicense = await this.licenseRepository.save(license)
    this.logger.log(`License created successfully: ${savedLicense.id}`)

    return savedLicense
  }

  async validateLicense(
    licenseNumber: string,
    licenseType: LicenseType,
    issuingAuthority: string,
    method: ValidationMethod = ValidationMethod.MOCK_VALIDATION,
    forceRevalidation = false,
  ): Promise<ILicenseValidationResponse> {
    this.logger.log(`Validating license: ${licenseNumber} (${licenseType})`)

    // Find the license in database
    let license = await this.licenseRepository.findOne({
      where: { licenseNumber, licenseType },
    })

    // If license doesn't exist, create a temporary record for validation
    if (!license) {
      this.logger.log(`License not found in database, creating temporary record: ${licenseNumber}`)
      license = this.licenseRepository.create({
        licenseNumber,
        licenseType,
        holderId: "unknown",
        holderName: "Unknown",
        issuingAuthority,
        issueDate: new Date(),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        validationStatus: ValidationStatus.PENDING,
      })
    }

    // Check if recent validation exists and force revalidation is not requested
    if (!forceRevalidation && license.lastValidatedAt) {
      const hoursSinceLastValidation = (Date.now() - license.lastValidatedAt.getTime()) / (1000 * 60 * 60)

      if (hoursSinceLastValidation < 24) {
        // Don't revalidate within 24 hours
        this.logger.log(`Using recent validation result for ${licenseNumber}`)
        return {
          isValid: license.isValid,
          validationStatus: license.validationStatus,
          validationResult: license.isValid ? ValidationResult.PASS : ValidationResult.FAIL,
          responseTimeMs: 0, // Cached result
          apiProvider: "cached",
        }
      }
    }

    // Perform validation using the specified method
    const validationRequest: ILicenseValidationRequest = {
      licenseNumber,
      licenseType,
      issuingAuthority,
      holderName: license.holderName,
    }

    let validationResponse: ILicenseValidationResponse

    try {
      switch (method) {
        case ValidationMethod.MOCK_VALIDATION:
          validationResponse = await this.mockValidationService.validateLicense(validationRequest)
          break
        case ValidationMethod.THIRD_PARTY_API:
          // In a real implementation, this would call actual third-party APIs
          validationResponse = await this.mockValidationService.validateLicense(validationRequest)
          break
        default:
          validationResponse = await this.mockValidationService.validateLicense(validationRequest)
      }

      // Update license with validation results
      license.validationStatus = validationResponse.validationStatus
      license.lastValidatedAt = new Date()
      license.nextValidationDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

      if (validationResponse.errorMessage) {
        license.validationError = validationResponse.errorMessage
      } else {
        license.validationError = null
      }

      // Save license if it's a new record or update existing
      const savedLicense = await this.licenseRepository.save(license)

      // Create validation record
      const validation = this.validationRepository.create({
        licenseId: savedLicense.id,
        validationMethod: method,
        validationResult: validationResponse.validationResult,
        validationStatus: validationResponse.validationStatus,
        requestData: validationRequest,
        responseData: validationResponse.responseData,
        errorDetails: validationResponse.errorMessage ? { error: validationResponse.errorMessage } : null,
        apiProvider: validationResponse.apiProvider,
        responseTimeMs: validationResponse.responseTimeMs,
        confidenceScore: validationResponse.confidenceScore,
      })

      await this.validationRepository.save(validation)

      this.logger.log(`License validation completed: ${licenseNumber} - ${validationResponse.validationStatus}`)
      return validationResponse
    } catch (error) {
      this.logger.error(`License validation failed for ${licenseNumber}:`, error)

      // Create error validation record
      const errorValidation = this.validationRepository.create({
        licenseId: license.id,
        validationMethod: method,
        validationResult: ValidationResult.ERROR,
        validationStatus: ValidationStatus.ERROR,
        requestData: validationRequest,
        errorDetails: { error: error.message, stack: error.stack },
        apiProvider: method,
      })

      await this.validationRepository.save(errorValidation)

      return {
        isValid: false,
        validationStatus: ValidationStatus.ERROR,
        validationResult: ValidationResult.ERROR,
        errorMessage: error.message,
        apiProvider: method,
      }
    }
  }

  async bulkValidateLicenses(requests: ILicenseValidationRequest[]): Promise<ILicenseValidationResponse[]> {
    this.logger.log(`Starting bulk validation of ${requests.length} licenses`)

    const results: ILicenseValidationResponse[] = []
    const batchSize = 10 // Process in batches to avoid overwhelming the system

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize)
      const batchPromises = batch.map((request) =>
        this.validateLicense(
          request.licenseNumber,
          request.licenseType,
          request.issuingAuthority,
          ValidationMethod.MOCK_VALIDATION,
          false,
        ),
      )

      const batchResults = await Promise.allSettled(batchPromises)

      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          results.push(result.value)
        } else {
          this.logger.error(`Bulk validation failed for license ${batch[index].licenseNumber}:`, result.reason)
          results.push({
            isValid: false,
            validationStatus: ValidationStatus.ERROR,
            validationResult: ValidationResult.ERROR,
            errorMessage: result.reason.message || "Unknown error",
          })
        }
      })
    }

    this.logger.log(`Bulk validation completed: ${results.length} licenses processed`)
    return results
  }

  async checkLicenseExpiration(licenseId: string): Promise<boolean> {
    const license = await this.licenseRepository.findOne({ where: { id: licenseId } })
    if (!license) {
      throw new NotFoundException(`License with ID ${licenseId} not found`)
    }

    return license.isExpired
  }

  async getLicenseValidationHistory(licenseId: string): Promise<LicenseValidation[]> {
    return this.validationRepository.find({
      where: { licenseId },
      order: { validationDate: "DESC" },
    })
  }

  async findLicenses(queryDto: QueryLicensesDto): Promise<{ licenses: License[]; total: number }> {
    const where: FindOptionsWhere<License> = {}

    // Build where conditions
    if (queryDto.licenseNumber) {
      where.licenseNumber = queryDto.licenseNumber
    }
    if (queryDto.licenseType) {
      where.licenseType = queryDto.licenseType
    }
    if (queryDto.holderId) {
      where.holderId = queryDto.holderId
    }
    if (queryDto.holderName) {
      where.holderName = queryDto.holderName
    }
    if (queryDto.issuingAuthority) {
      where.issuingAuthority = queryDto.issuingAuthority
    }
    if (queryDto.licenseStatus) {
      where.licenseStatus = queryDto.licenseStatus
    }
    if (queryDto.validationStatus) {
      where.validationStatus = queryDto.validationStatus
    }
    if (queryDto.isActive !== undefined) {
      where.isActive = queryDto.isActive
    }

    // Handle date ranges
    if (queryDto.expirationDateFrom || queryDto.expirationDateTo) {
      const from = queryDto.expirationDateFrom ? new Date(queryDto.expirationDateFrom) : new Date("1900-01-01")
      const to = queryDto.expirationDateTo ? new Date(queryDto.expirationDateTo) : new Date("2100-01-01")
      where.expirationDate = Between(from, to)
    }

    if (queryDto.createdFrom || queryDto.createdTo) {
      const from = queryDto.createdFrom ? new Date(queryDto.createdFrom) : new Date("1900-01-01")
      const to = queryDto.createdTo ? new Date(queryDto.createdTo) : new Date("2100-01-01")
      where.createdAt = Between(from, to)
    }

    // Handle expired only filter
    if (queryDto.expiredOnly) {
      where.expirationDate = LessThan(new Date())
    }

    // Handle expiring soon filter
    if (queryDto.expiringSoonDays) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + queryDto.expiringSoonDays)
      where.expirationDate = Between(new Date(), futureDate)
    }

    const [licenses, total] = await this.licenseRepository.findAndCount({
      where,
      order: { [queryDto.sortBy]: queryDto.sortOrder },
      take: queryDto.limit,
      skip: queryDto.offset,
    })

    return { licenses, total }
  }

  async getLicenseById(id: string): Promise<License> {
    const license = await this.licenseRepository.findOne({ where: { id } })
    if (!license) {
      throw new NotFoundException(`License with ID ${id} not found`)
    }
    return license
  }

  async updateLicense(id: string, updateData: Partial<License>): Promise<License> {
    const license = await this.getLicenseById(id)

    Object.assign(license, updateData)

    return this.licenseRepository.save(license)
  }

  async deleteLicense(id: string): Promise<void> {
    const license = await this.getLicenseById(id)
    await this.licenseRepository.remove(license)
    this.logger.log(`License deleted: ${id}`)
  }

  async getValidationStatistics(): Promise<IValidationStatistics> {
    const totalValidations = await this.validationRepository.count()

    const successfulValidations = await this.validationRepository.count({
      where: { validationResult: ValidationResult.PASS },
    })

    const failedValidations = await this.validationRepository.count({
      where: { validationResult: ValidationResult.FAIL },
    })

    // Get average response time
    const avgResponseTime = await this.validationRepository
      .createQueryBuilder("validation")
      .select("AVG(validation.responseTimeMs)", "avg")
      .getRawOne()

    // Get validations by method
    const validationsByMethod = await this.validationRepository
      .createQueryBuilder("validation")
      .select("validation.validationMethod", "method")
      .addSelect("COUNT(*)", "count")
      .groupBy("validation.validationMethod")
      .getRawMany()

    // Get validations by result
    const validationsByResult = await this.validationRepository
      .createQueryBuilder("validation")
      .select("validation.validationResult", "result")
      .addSelect("COUNT(*)", "count")
      .groupBy("validation.validationResult")
      .getRawMany()

    // Get recent validations (last 24 hours)
    const recentValidations = await this.validationRepository.count({
      where: {
        validationDate: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)),
      },
    })

    return {
      totalValidations,
      successfulValidations,
      failedValidations,
      averageResponseTime: Number.parseFloat(avgResponseTime?.avg || "0"),
      validationsByMethod: validationsByMethod.reduce((acc, item) => {
        acc[item.method] = Number.parseInt(item.count)
        return acc
      }, {}),
      validationsByResult: validationsByResult.reduce((acc, item) => {
        acc[item.result] = Number.parseInt(item.count)
        return acc
      }, {}),
      recentValidations,
    }
  }

  async getLicenseStatistics(): Promise<any> {
    const totalLicenses = await this.licenseRepository.count()
    const activeLicenses = await this.licenseRepository.count({ where: { isActive: true } })
    const expiredLicenses = await this.licenseRepository.count({
      where: { expirationDate: LessThan(new Date()) },
    })

    // Licenses expiring in next 30 days
    const expiringSoon = await this.licenseRepository.count({
      where: {
        expirationDate: Between(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        isActive: true,
      },
    })

    const validLicenses = await this.licenseRepository.count({
      where: { validationStatus: ValidationStatus.VALID },
    })

    const invalidLicenses = await this.licenseRepository.count({
      where: { validationStatus: ValidationStatus.INVALID },
    })

    const pendingValidation = await this.licenseRepository.count({
      where: { validationStatus: ValidationStatus.PENDING },
    })

    // Statistics by license type
    const byLicenseType = await this.licenseRepository
      .createQueryBuilder("license")
      .select("license.licenseType", "type")
      .addSelect("COUNT(*)", "count")
      .groupBy("license.licenseType")
      .getRawMany()

    // Statistics by issuing authority
    const byIssuingAuthority = await this.licenseRepository
      .createQueryBuilder("license")
      .select("license.issuingAuthority", "authority")
      .addSelect("COUNT(*)", "count")
      .groupBy("license.issuingAuthority")
      .getRawMany()

    // Recent validations (last 7 days)
    const recentValidations = await this.validationRepository.count({
      where: {
        validationDate: MoreThan(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
      },
    })

    return {
      totalLicenses,
      activeLicenses,
      expiredLicenses,
      expiringSoon,
      validLicenses,
      invalidLicenses,
      pendingValidation,
      byLicenseType: byLicenseType.reduce((acc, item) => {
        acc[item.type] = Number.parseInt(item.count)
        return acc
      }, {}),
      byIssuingAuthority: byIssuingAuthority.reduce((acc, item) => {
        acc[item.authority] = Number.parseInt(item.count)
        return acc
      }, {}),
      recentValidations,
    }
  }

  // Utility methods for testing
  async createTestLicenses(): Promise<License[]> {
    const testLicenses = [
      {
        licenseNumber: "DL123456789",
        licenseType: LicenseType.DRIVER_LICENSE,
        holderId: "driver-001",
        holderName: "John Doe",
        issuingAuthority: "CA",
        issueDate: new Date("2020-01-15"),
        expirationDate: new Date("2025-01-15"),
        licenseStatus: LicenseStatus.ACTIVE,
      },
      {
        licenseNumber: "CDL987654321",
        licenseType: LicenseType.CDL,
        holderId: "driver-002",
        holderName: "Jane Smith",
        issuingAuthority: "TX",
        issueDate: new Date("2019-06-01"),
        expirationDate: new Date("2024-06-01"),
        licenseStatus: LicenseStatus.ACTIVE,
      },
      {
        licenseNumber: "EXPIRED123",
        licenseType: LicenseType.DRIVER_LICENSE,
        holderId: "driver-003",
        holderName: "Bob Johnson",
        issuingAuthority: "NY",
        issueDate: new Date("2018-03-10"),
        expirationDate: new Date("2023-03-10"), // Expired
        licenseStatus: LicenseStatus.EXPIRED,
      },
    ]

    const createdLicenses = []
    for (const licenseData of testLicenses) {
      try {
        const license = await this.createLicense(licenseData as CreateLicenseDto)
        createdLicenses.push(license)
      } catch (error) {
        // License might already exist, skip
        this.logger.warn(`Test license ${licenseData.licenseNumber} already exists`)
      }
    }

    return createdLicenses
  }
}
