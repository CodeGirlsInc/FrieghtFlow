import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiParam } from "@nestjs/swagger"
import type { LicenseValidatorService } from "../services/license-validator.service"
import type { MockValidationService } from "../services/mock-validation.service"
import type { CreateLicenseDto } from "../dto/create-license.dto"
import type { ValidateLicenseDto, BulkValidateLicensesDto } from "../dto/validate-license.dto"
import type { QueryLicensesDto } from "../dto/query-licenses.dto"
import {
  LicenseResponseDto,
  LicenseValidationResultDto,
  BulkValidationResultDto,
  LicenseStatisticsDto,
} from "../dto/license-response.dto"
import type { License } from "../entities/license.entity"
import { ValidationMethod } from "../entities/license-validation.entity"
import type { Express } from "express"

@ApiTags("License Validator")
@Controller("license-validator")
export class LicenseValidatorController {
  constructor(
    private readonly licenseValidatorService: LicenseValidatorService,
    private readonly mockValidationService: MockValidationService,
  ) {}

  @Post("licenses")
  @ApiOperation({ summary: "Create a new license record" })
  @ApiResponse({ status: 201, description: "License created successfully", type: LicenseResponseDto })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 409, description: "License already exists" })
  async createLicense(createLicenseDto: CreateLicenseDto): Promise<LicenseResponseDto> {
    const license = await this.licenseValidatorService.createLicense(createLicenseDto)
    return this.mapLicenseToResponse(license)
  }

  @Post("licenses/upload")
  @ApiOperation({ summary: "Upload and create license with document" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 201, description: "License uploaded and created successfully" })
  @UseInterceptors(FileInterceptor("document"))
  async uploadLicense(createLicenseDto: CreateLicenseDto, file: Express.Multer.File): Promise<LicenseResponseDto> {
    if (file) {
      // In a real implementation, you would upload the file to cloud storage
      // and store the URL in the license record
      createLicenseDto.documentUrl = `uploads/licenses/${Date.now()}-${file.originalname}`
    }

    const license = await this.licenseValidatorService.createLicense(createLicenseDto)
    return this.mapLicenseToResponse(license)
  }

  @Post("validate")
  @ApiOperation({ summary: "Validate a single license" })
  @ApiResponse({ status: 200, description: "License validation completed", type: LicenseValidationResultDto })
  @ApiResponse({ status: 400, description: "Invalid validation request" })
  async validateLicense(validateDto: ValidateLicenseDto): Promise<LicenseValidationResultDto> {
    const startTime = Date.now()

    const validationResponse = await this.licenseValidatorService.validateLicense(
      validateDto.licenseNumber,
      validateDto.licenseType,
      validateDto.issuingAuthority,
      validateDto.validationMethod || ValidationMethod.MOCK_VALIDATION,
      validateDto.forceRevalidation || false,
    )

    // Get the license record (might be newly created during validation)
    const licenses = await this.licenseValidatorService.findLicenses({
      licenseNumber: validateDto.licenseNumber,
      licenseType: validateDto.licenseType,
      limit: 1,
      offset: 0,
    })

    if (licenses.licenses.length === 0) {
      throw new BadRequestException("License validation failed - no license record found")
    }

    const license = licenses.licenses[0]
    const processingTime = Date.now() - startTime

    return {
      license: this.mapLicenseToResponse(license),
      validation: {
        id: "temp-validation-id", // In real implementation, get from validation record
        licenseId: license.id,
        validationMethod: validateDto.validationMethod || ValidationMethod.MOCK_VALIDATION,
        validationResult: validationResponse.validationResult,
        validationStatus: validationResponse.validationStatus,
        apiProvider: validationResponse.apiProvider,
        responseTimeMs: validationResponse.responseTimeMs,
        confidenceScore: validationResponse.confidenceScore,
        validationDate: new Date(),
        errorDetails: validationResponse.errorMessage ? { error: validationResponse.errorMessage } : undefined,
      },
      isValid: validationResponse.isValid,
      message: validationResponse.isValid
        ? "License validation successful"
        : validationResponse.errorMessage || "License validation failed",
    }
  }

  @Post("validate/bulk")
  @ApiOperation({ summary: "Validate multiple licenses in bulk" })
  @ApiResponse({ status: 200, description: "Bulk validation completed", type: BulkValidationResultDto })
  @ApiResponse({ status: 400, description: "Invalid bulk validation request" })
  async bulkValidateLicenses(bulkValidateDto: BulkValidateLicensesDto): Promise<BulkValidationResultDto> {
    const startTime = Date.now()

    const requests = bulkValidateDto.licenses.map((license) => ({
      licenseNumber: license.licenseNumber,
      licenseType: license.licenseType,
      issuingAuthority: license.issuingAuthority,
      holderName: undefined,
    }))

    const validationResponses = await this.licenseValidatorService.bulkValidateLicenses(requests)

    const results: LicenseValidationResultDto[] = []
    let successful = 0
    let failed = 0

    for (let i = 0; i < validationResponses.length; i++) {
      const response = validationResponses[i]
      const request = bulkValidateDto.licenses[i]

      // Get license record
      const licenses = await this.licenseValidatorService.findLicenses({
        licenseNumber: request.licenseNumber,
        licenseType: request.licenseType,
        limit: 1,
        offset: 0,
      })

      if (licenses.licenses.length > 0) {
        const license = licenses.licenses[0]

        results.push({
          license: this.mapLicenseToResponse(license),
          validation: {
            id: "temp-validation-id",
            licenseId: license.id,
            validationMethod: request.validationMethod || ValidationMethod.MOCK_VALIDATION,
            validationResult: response.validationResult,
            validationStatus: response.validationStatus,
            apiProvider: response.apiProvider,
            responseTimeMs: response.responseTimeMs,
            confidenceScore: response.confidenceScore,
            validationDate: new Date(),
            errorDetails: response.errorMessage ? { error: response.errorMessage } : undefined,
          },
          isValid: response.isValid,
          message: response.isValid
            ? "License validation successful"
            : response.errorMessage || "License validation failed",
        })

        if (response.isValid) {
          successful++
        } else {
          failed++
        }
      } else {
        failed++
        results.push({
          license: null as any, // License not found
          validation: null as any,
          isValid: false,
          message: "License not found",
        })
      }
    }

    const processingTime = Date.now() - startTime

    return {
      totalProcessed: bulkValidateDto.licenses.length,
      successful,
      failed,
      results,
      processingTimeMs: processingTime,
    }
  }

  @Get("licenses")
  @ApiOperation({ summary: "Get licenses with filtering and pagination" })
  @ApiResponse({ status: 200, description: "Licenses retrieved successfully" })
  async getLicenses(queryDto: QueryLicensesDto) {
    const { licenses, total } = await this.licenseValidatorService.findLicenses(queryDto)

    return {
      licenses: licenses.map((license) => this.mapLicenseToResponse(license)),
      total,
      limit: queryDto.limit,
      offset: queryDto.offset,
      hasMore: queryDto.offset + queryDto.limit < total,
    }
  }

  @Get("licenses/:id")
  @ApiOperation({ summary: "Get license by ID" })
  @ApiParam({ name: "id", description: "License ID" })
  @ApiResponse({ status: 200, description: "License found", type: LicenseResponseDto })
  @ApiResponse({ status: 404, description: "License not found" })
  async getLicenseById(id: string): Promise<LicenseResponseDto> {
    const license = await this.licenseValidatorService.getLicenseById(id)
    return this.mapLicenseToResponse(license)
  }

  @Put("licenses/:id")
  @ApiOperation({ summary: "Update license information" })
  @ApiParam({ name: "id", description: "License ID" })
  @ApiResponse({ status: 200, description: "License updated successfully", type: LicenseResponseDto })
  @ApiResponse({ status: 404, description: "License not found" })
  async updateLicense(id: string, updateData: Partial<CreateLicenseDto>): Promise<LicenseResponseDto> {
    const updatedLicense = await this.licenseValidatorService.updateLicense(id, updateData)
    return this.mapLicenseToResponse(updatedLicense)
  }

  @Delete("licenses/:id")
  @ApiOperation({ summary: "Delete license" })
  @ApiParam({ name: "id", description: "License ID" })
  @ApiResponse({ status: 204, description: "License deleted successfully" })
  @ApiResponse({ status: 404, description: "License not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLicense(id: string): Promise<void> {
    await this.licenseValidatorService.deleteLicense(id)
  }

  @Get("licenses/:id/validation-history")
  @ApiOperation({ summary: "Get license validation history" })
  @ApiParam({ name: "id", description: "License ID" })
  @ApiResponse({ status: 200, description: "Validation history retrieved" })
  async getLicenseValidationHistory(id: string) {
    const history = await this.licenseValidatorService.getLicenseValidationHistory(id)
    return {
      licenseId: id,
      validations: history,
      totalValidations: history.length,
    }
  }

  @Post("licenses/:id/revalidate")
  @ApiOperation({ summary: "Force revalidation of a license" })
  @ApiParam({ name: "id", description: "License ID" })
  @ApiResponse({ status: 200, description: "License revalidated successfully" })
  async revalidateLicense(id: string): Promise<LicenseValidationResultDto> {
    const license = await this.licenseValidatorService.getLicenseById(id)

    const validationResponse = await this.licenseValidatorService.validateLicense(
      license.licenseNumber,
      license.licenseType,
      license.issuingAuthority,
      ValidationMethod.MOCK_VALIDATION,
      true, // Force revalidation
    )

    // Get updated license
    const updatedLicense = await this.licenseValidatorService.getLicenseById(id)

    return {
      license: this.mapLicenseToResponse(updatedLicense),
      validation: {
        id: "temp-validation-id",
        licenseId: license.id,
        validationMethod: ValidationMethod.MOCK_VALIDATION,
        validationResult: validationResponse.validationResult,
        validationStatus: validationResponse.validationStatus,
        apiProvider: validationResponse.apiProvider,
        responseTimeMs: validationResponse.responseTimeMs,
        confidenceScore: validationResponse.confidenceScore,
        validationDate: new Date(),
        errorDetails: validationResponse.errorMessage ? { error: validationResponse.errorMessage } : undefined,
      },
      isValid: validationResponse.isValid,
      message: validationResponse.isValid
        ? "License revalidation successful"
        : validationResponse.errorMessage || "License revalidation failed",
    }
  }

  @Get("statistics/licenses")
  @ApiOperation({ summary: "Get license statistics" })
  @ApiResponse({ status: 200, description: "License statistics", type: LicenseStatisticsDto })
  async getLicenseStatistics(): Promise<LicenseStatisticsDto> {
    return this.licenseValidatorService.getLicenseStatistics()
  }

  @Get("statistics/validations")
  @ApiOperation({ summary: "Get validation statistics" })
  @ApiResponse({ status: 200, description: "Validation statistics" })
  async getValidationStatistics() {
    return this.licenseValidatorService.getValidationStatistics()
  }

  @Post("test/create-test-licenses")
  @ApiOperation({ summary: "Create test licenses for development/testing" })
  @ApiResponse({ status: 201, description: "Test licenses created successfully" })
  async createTestLicenses() {
    const testLicenses = await this.licenseValidatorService.createTestLicenses()
    return {
      message: "Test licenses created successfully",
      licenses: testLicenses.map((license) => this.mapLicenseToResponse(license)),
      count: testLicenses.length,
    }
  }

  @Post("test/configure-mock-validation")
  @ApiOperation({ summary: "Configure mock validation service for testing" })
  @ApiResponse({ status: 200, description: "Mock validation configured successfully" })
  async configureMockValidation(config: {
    successRate?: number
    averageResponseTime?: number
    enableRandomFailures?: boolean
    expiredLicenses?: string[]
    invalidLicenses?: string[]
    suspendedLicenses?: string[]
  }) {
    if (config.expiredLicenses) {
      config.expiredLicenses.forEach((license) => this.mockValidationService.addExpiredLicense(license))
    }

    if (config.invalidLicenses) {
      config.invalidLicenses.forEach((license) => this.mockValidationService.addInvalidLicense(license))
    }

    if (config.suspendedLicenses) {
      config.suspendedLicenses.forEach((license) => this.mockValidationService.addSuspendedLicense(license))
    }

    const currentConfig = this.mockValidationService.getConfig()
    this.mockValidationService.setConfig({
      ...currentConfig,
      ...config,
    })

    return {
      message: "Mock validation service configured successfully",
      config: this.mockValidationService.getConfig(),
    }
  }

  @Post("test/reset-mock-validation")
  @ApiOperation({ summary: "Reset mock validation service to defaults" })
  @ApiResponse({ status: 200, description: "Mock validation reset successfully" })
  async resetMockValidation() {
    this.mockValidationService.clearSimulatedLicenses()
    this.mockValidationService.setConfig({
      successRate: 85,
      averageResponseTime: 500,
      enableRandomFailures: true,
      simulateExpiredLicenses: [],
      simulateInvalidLicenses: [],
      simulateSuspendedLicenses: [],
    })

    return {
      message: "Mock validation service reset successfully",
      config: this.mockValidationService.getConfig(),
    }
  }

  @Get("health")
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({ status: 200, description: "Service health status" })
  async healthCheck() {
    const mockServiceAvailable = await this.mockValidationService.isAvailable()
    const stats = await this.licenseValidatorService.getValidationStatistics()

    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        mockValidation: {
          available: mockServiceAvailable,
          supportedTypes: this.mockValidationService.getSupportedLicenseTypes(),
          supportedAuthorities: this.mockValidationService.getSupportedAuthorities(),
        },
      },
      statistics: {
        totalValidations: stats.totalValidations,
        recentValidations: stats.recentValidations,
        averageResponseTime: stats.averageResponseTime,
      },
    }
  }

  private mapLicenseToResponse(license: License): LicenseResponseDto {
    return {
      id: license.id,
      licenseNumber: license.licenseNumber,
      licenseType: license.licenseType,
      holderId: license.holderId,
      holderName: license.holderName,
      issuingAuthority: license.issuingAuthority,
      issueDate: license.issueDate,
      expirationDate: license.expirationDate,
      licenseStatus: license.licenseStatus,
      validationStatus: license.validationStatus,
      licenseDetails: license.licenseDetails,
      documentUrl: license.documentUrl,
      lastValidatedAt: license.lastValidatedAt,
      nextValidationDue: license.nextValidationDue,
      validationError: license.validationError,
      isActive: license.isActive,
      isExpired: license.isExpired,
      isValid: license.isValid,
      daysUntilExpiration: license.daysUntilExpiration,
      createdAt: license.createdAt,
      updatedAt: license.updatedAt,
    }
  }
}
