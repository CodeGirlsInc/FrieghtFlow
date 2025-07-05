import { Controller, Post, Get, Param, Query, HttpCode, HttpStatus, Patch } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from "@nestjs/swagger"
import type { QRGeneratorService } from "../services/qr-generator.service"
import type { QRAnalyticsService } from "../services/qr-analytics.service"
import type { GenerateQRRequestDto } from "../dto/generate-qr-request.dto"
import type { ScanQRRequestDto } from "../dto/scan-qr-request.dto"
import { QRCodeResponseDto } from "../dto/qr-code-response.dto"
import { ScanResultDto } from "../dto/scan-result.dto"

@ApiTags("QR Code Generator")
@Controller("qr-codes")
export class QRGeneratorController {
  constructor(
    private readonly qrGeneratorService: QRGeneratorService,
    private readonly qrAnalyticsService: QRAnalyticsService,
  ) {}

  @Post("generate")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Generate a new QR code" })
  @ApiResponse({
    status: 201,
    description: "QR code generated successfully",
    type: QRCodeResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  async generateQRCode(request: GenerateQRRequestDto): Promise<QRCodeResponseDto> {
    const { qrCode, qrCodeImage } = await this.qrGeneratorService.generateQRCode({
      type: request.type,
      referenceId: request.referenceId,
      description: request.description,
      expirationHours: request.expirationHours,
      maxScans: request.maxScans,
      customExpirationDate: request.customExpirationDate ? new Date(request.customExpirationDate) : undefined,
      metadata: request.metadata,
      createdBy: request.createdBy,
    })

    return {
      id: qrCode.id,
      code: qrCode.code,
      type: qrCode.type,
      status: qrCode.status,
      referenceId: qrCode.referenceId,
      description: qrCode.description,
      expiresAt: qrCode.expiresAt,
      scanCount: qrCode.scanCount,
      maxScans: qrCode.maxScans,
      createdAt: qrCode.createdAt,
      qrCodeImage,
    }
  }

  @Post("scan")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Scan and validate a QR code" })
  @ApiResponse({
    status: 200,
    description: "QR code scan result",
    type: ScanResultDto,
  })
  @ApiResponse({ status: 400, description: "Invalid scan request" })
  async scanQRCode(request: ScanQRRequestDto): Promise<ScanResultDto> {
    const { result, qrCode, message } = await this.qrGeneratorService.scanQRCode(request.code, {
      scannedBy: request.scannedBy,
      scannedLocation: request.scannedLocation,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
    })

    return {
      result,
      success: result === "SUCCESS",
      message,
      qrCode: qrCode
        ? {
            id: qrCode.id,
            type: qrCode.type,
            referenceId: qrCode.referenceId,
            description: qrCode.description,
            scanCount: qrCode.scanCount,
            maxScans: qrCode.maxScans,
            metadata: qrCode.metadata,
          }
        : undefined,
      scannedAt: new Date(),
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get QR code details by ID" })
  @ApiParam({ name: "id", description: "QR code ID" })
  @ApiResponse({ status: 200, description: "QR code details retrieved successfully" })
  @ApiResponse({ status: 404, description: "QR code not found" })
  async getQRCode(@Param("id") id: string) {
    return this.qrGeneratorService.getQRCode(id)
  }

  @Get("code/:code")
  @ApiOperation({ summary: "Get QR code details by code" })
  @ApiParam({ name: "code", description: "QR code string" })
  @ApiResponse({ status: 200, description: "QR code details retrieved successfully" })
  @ApiResponse({ status: 404, description: "QR code not found" })
  async getQRCodeByCode(@Param("code") code: string) {
    return this.qrGeneratorService.getQRCodeByCode(code)
  }

  @Get("reference/:referenceId")
  @ApiOperation({ summary: "Get QR codes by reference ID" })
  @ApiParam({ name: "referenceId", description: "Reference ID" })
  @ApiResponse({ status: 200, description: "QR codes retrieved successfully" })
  async getQRCodesByReference(@Param("referenceId") referenceId: string) {
    return this.qrGeneratorService.getQRCodesByReference(referenceId)
  }

  @Patch(":id/revoke")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Revoke a QR code" })
  @ApiParam({ name: "id", description: "QR code ID" })
  @ApiBody({ schema: { type: "object", properties: { reason: { type: "string" } } } })
  @ApiResponse({ status: 200, description: "QR code revoked successfully" })
  @ApiResponse({ status: 400, description: "Cannot revoke QR code" })
  async revokeQRCode(@Param("id") id: string, body: { reason?: string }) {
    return this.qrGeneratorService.revokeQRCode(id, body.reason)
  }

  @Patch(":id/extend")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Extend QR code expiration" })
  @ApiParam({ name: "id", description: "QR code ID" })
  @ApiBody({
    schema: { type: "object", properties: { additionalHours: { type: "number" } }, required: ["additionalHours"] },
  })
  @ApiResponse({ status: 200, description: "QR code expiration extended successfully" })
  @ApiResponse({ status: 400, description: "Cannot extend expiration" })
  async extendExpiration(@Param("id") id: string, body: { additionalHours: number }) {
    return this.qrGeneratorService.extendExpiration(id, body.additionalHours)
  }

  @Get(":id/scans")
  @ApiOperation({ summary: "Get scan history for a QR code" })
  @ApiParam({ name: "id", description: "QR code ID" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of scan records to return" })
  @ApiResponse({ status: 200, description: "Scan history retrieved successfully" })
  async getScanHistory(@Param("id") id: string, @Query("limit") limit?: number) {
    return this.qrGeneratorService.getScanHistory(id, limit)
  }

  @Get(":id/regenerate-image")
  @ApiOperation({ summary: "Regenerate QR code image" })
  @ApiParam({ name: "id", description: "QR code ID" })
  @ApiQuery({ name: "size", required: false, type: Number, description: "Image size in pixels" })
  @ApiResponse({ status: 200, description: "QR code image regenerated successfully" })
  async regenerateImage(@Param("id") id: string, @Query("size") size?: number) {
    const qrCodeImage = await this.qrGeneratorService.regenerateQRCodeImage(id, { size })
    return { qrCodeImage }
  }

  @Post("cleanup-expired")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cleanup expired QR codes" })
  @ApiResponse({ status: 200, description: "Expired QR codes cleaned up successfully" })
  async cleanupExpired() {
    const count = await this.qrGeneratorService.cleanupExpiredQRCodes()
    return { message: `${count} expired QR codes cleaned up` }
  }

  @Get("analytics/statistics")
  @ApiOperation({ summary: "Get overall QR code statistics" })
  @ApiResponse({ status: 200, description: "Statistics retrieved successfully" })
  async getStatistics() {
    return this.qrAnalyticsService.getOverallStatistics()
  }

  @Get("analytics/usage-report")
  @ApiOperation({ summary: "Get QR code usage report" })
  @ApiQuery({ name: "startDate", required: true, type: String, description: "Start date (ISO string)" })
  @ApiQuery({ name: "endDate", required: true, type: String, description: "End date (ISO string)" })
  @ApiResponse({ status: 200, description: "Usage report retrieved successfully" })
  async getUsageReport(@Query("startDate") startDate: string, @Query("endDate") endDate: string) {
    return this.qrAnalyticsService.getQRCodeUsageReport(new Date(startDate), new Date(endDate))
  }

  @Get("analytics/performance")
  @ApiOperation({ summary: "Get QR code performance metrics" })
  @ApiResponse({ status: 200, description: "Performance metrics retrieved successfully" })
  async getPerformanceMetrics() {
    return this.qrAnalyticsService.getQRCodePerformanceMetrics()
  }

  @Get("analytics/expiration")
  @ApiOperation({ summary: "Get expiration analysis" })
  @ApiResponse({ status: 200, description: "Expiration analysis retrieved successfully" })
  async getExpirationAnalysis() {
    return this.qrAnalyticsService.getExpirationAnalysis()
  }

  @Get("analytics/locations")
  @ApiOperation({ summary: "Get scan location analysis" })
  @ApiResponse({ status: 200, description: "Location analysis retrieved successfully" })
  async getLocationAnalysis() {
    return this.qrAnalyticsService.getScanLocationAnalysis()
  }

  @Get("analytics/scanners")
  @ApiOperation({ summary: "Get scanner analysis" })
  @ApiResponse({ status: 200, description: "Scanner analysis retrieved successfully" })
  async getScannerAnalysis() {
    return this.qrAnalyticsService.getScannerAnalysis()
  }
}
