import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { QRCode, QRCodeStatus } from "../entities/qr-code.entity"
import { type QRScanLog, ScanResult } from "../entities/qr-scan-log.entity"
import type { QRHashService } from "./qr-hash.service"
import type { QRImageService } from "./qr-image.service"
import type {
  QRCodeGenerationOptions,
  QRCodeScanOptions,
  QRCodeValidationResult,
  QRCodeImageOptions,
} from "../interfaces/qr-generator.interface"

@Injectable()
export class QRGeneratorService {
  private readonly logger = new Logger(QRGeneratorService.name)

  constructor(
    private qrCodeRepository: Repository<QRCode>,
    private scanLogRepository: Repository<QRScanLog>,
    private qrHashService: QRHashService,
    private qrImageService: QRImageService,
  ) {}

  async generateQRCode(options: QRCodeGenerationOptions): Promise<{
    qrCode: QRCode
    qrCodeImage: string
  }> {
    this.logger.log(`Generating QR code of type: ${options.type}`)

    // Generate unique code
    const code = this.qrHashService.generateUniqueCode()

    // Ensure uniqueness in database
    const existingCode = await this.qrCodeRepository.findOne({ where: { code } })
    if (existingCode) {
      // Retry with new code if collision occurs
      return this.generateQRCode(options)
    }

    // Calculate expiration date
    const expiresAt = this.calculateExpirationDate(options.expirationHours, options.customExpirationDate)

    // Generate secure hash for verification
    const hash = this.qrHashService.generateSecureHash(`${code}-${options.type}-${expiresAt.getTime()}`)

    // Create QR code entity
    const qrCode = this.qrCodeRepository.create({
      code,
      hash,
      type: options.type,
      referenceId: options.referenceId,
      description: options.description,
      expiresAt,
      maxScans: options.maxScans || 1,
      metadata: options.metadata,
      createdBy: options.createdBy,
    })

    const savedQRCode = await this.qrCodeRepository.save(qrCode)

    // Generate QR code image
    const qrCodeImage = await this.qrImageService.generateQRCodeImage(code)

    this.logger.log(`QR code generated successfully: ${code}`)

    return {
      qrCode: savedQRCode,
      qrCodeImage,
    }
  }

  async scanQRCode(
    code: string,
    options: QRCodeScanOptions = {},
  ): Promise<{
    result: ScanResult
    qrCode?: QRCode
    message: string
  }> {
    this.logger.log(`Scanning QR code: ${code}`)

    // Validate code format
    if (!this.qrHashService.validateCodeFormat(code)) {
      await this.logScan(null, code, ScanResult.INVALID, options, "Invalid QR code format")
      return {
        result: ScanResult.INVALID,
        message: "Invalid QR code format",
      }
    }

    // Find QR code in database
    const qrCode = await this.qrCodeRepository.findOne({ where: { code } })

    if (!qrCode) {
      await this.logScan(null, code, ScanResult.INVALID, options, "QR code not found")
      return {
        result: ScanResult.INVALID,
        message: "QR code not found",
      }
    }

    // Validate QR code
    const validation = await this.validateQRCode(qrCode)

    if (!validation.isValid) {
      await this.logScan(qrCode.id, code, validation.scanResult, options, validation.reason)
      return {
        result: validation.scanResult,
        message: validation.reason || "QR code validation failed",
      }
    }

    // Update QR code scan information
    qrCode.scanCount += 1
    qrCode.scannedAt = new Date()
    qrCode.scannedBy = options.scannedBy || qrCode.scannedBy
    qrCode.scannedLocation = options.scannedLocation || qrCode.scannedLocation

    // Mark as used if max scans reached
    if (qrCode.scanCount >= qrCode.maxScans) {
      qrCode.status = QRCodeStatus.USED
    }

    await this.qrCodeRepository.save(qrCode)

    // Log successful scan
    await this.logScan(qrCode.id, code, ScanResult.SUCCESS, options)

    this.logger.log(`QR code scanned successfully: ${code}`)

    return {
      result: ScanResult.SUCCESS,
      qrCode,
      message: "QR code scanned successfully",
    }
  }

  async getQRCode(id: string): Promise<QRCode> {
    const qrCode = await this.qrCodeRepository.findOne({ where: { id } })

    if (!qrCode) {
      throw new NotFoundException(`QR code not found: ${id}`)
    }

    return qrCode
  }

  async getQRCodeByCode(code: string): Promise<QRCode> {
    const qrCode = await this.qrCodeRepository.findOne({ where: { code } })

    if (!qrCode) {
      throw new NotFoundException(`QR code not found: ${code}`)
    }

    return qrCode
  }

  async revokeQRCode(id: string, reason?: string): Promise<QRCode> {
    const qrCode = await this.getQRCode(id)

    if (qrCode.status === QRCodeStatus.REVOKED) {
      throw new BadRequestException("QR code is already revoked")
    }

    qrCode.status = QRCodeStatus.REVOKED
    qrCode.metadata = {
      ...qrCode.metadata,
      revokedAt: new Date(),
      revokeReason: reason,
    }

    return this.qrCodeRepository.save(qrCode)
  }

  async extendExpiration(id: string, additionalHours: number): Promise<QRCode> {
    const qrCode = await this.getQRCode(id)

    if (qrCode.status !== QRCodeStatus.ACTIVE) {
      throw new BadRequestException("Can only extend expiration for active QR codes")
    }

    const newExpirationDate = new Date(qrCode.expiresAt)
    newExpirationDate.setHours(newExpirationDate.getHours() + additionalHours)

    qrCode.expiresAt = newExpirationDate
    qrCode.metadata = {
      ...qrCode.metadata,
      extensionHistory: [
        ...(qrCode.metadata?.extensionHistory || []),
        {
          extendedAt: new Date(),
          additionalHours,
          previousExpiration: qrCode.expiresAt,
        },
      ],
    }

    return this.qrCodeRepository.save(qrCode)
  }

  async getQRCodesByReference(referenceId: string): Promise<QRCode[]> {
    return this.qrCodeRepository.find({
      where: { referenceId },
      order: { createdAt: "DESC" },
    })
  }

  async getScanHistory(qrCodeId: string, limit = 50): Promise<QRScanLog[]> {
    return this.scanLogRepository.find({
      where: { qrCodeId },
      order: { createdAt: "DESC" },
      take: limit,
    })
  }

  async cleanupExpiredQRCodes(): Promise<number> {
    const now = new Date()

    const expiredCodes = await this.qrCodeRepository
      .createQueryBuilder()
      .update(QRCode)
      .set({ status: QRCodeStatus.EXPIRED })
      .where("expiresAt < :now", { now })
      .andWhere("status = :status", { status: QRCodeStatus.ACTIVE })
      .execute()

    this.logger.log(`Marked ${expiredCodes.affected} QR codes as expired`)
    return expiredCodes.affected || 0
  }

  async regenerateQRCodeImage(id: string, options: QRCodeImageOptions = {}): Promise<string> {
    const qrCode = await this.getQRCode(id)
    return this.qrImageService.generateQRCodeImage(qrCode.code, options)
  }

  private async validateQRCode(qrCode: QRCode): Promise<QRCodeValidationResult> {
    // Check if revoked
    if (qrCode.status === QRCodeStatus.REVOKED) {
      return {
        isValid: false,
        scanResult: ScanResult.REVOKED,
        reason: "QR code has been revoked",
      }
    }

    // Check if expired
    if (qrCode.expiresAt < new Date()) {
      return {
        isValid: false,
        scanResult: ScanResult.EXPIRED,
        reason: "QR code has expired",
      }
    }

    // Check if already used (max scans reached)
    if (qrCode.scanCount >= qrCode.maxScans) {
      return {
        isValid: false,
        scanResult: ScanResult.ALREADY_USED,
        reason: "QR code has reached maximum scan limit",
      }
    }

    // Check if max scans would be exceeded
    if (qrCode.scanCount + 1 > qrCode.maxScans) {
      return {
        isValid: false,
        scanResult: ScanResult.MAX_SCANS_EXCEEDED,
        reason: "Scanning would exceed maximum scan limit",
      }
    }

    return {
      isValid: true,
      qrCode,
      scanResult: ScanResult.SUCCESS,
    }
  }

  private calculateExpirationDate(expirationHours?: number, customExpirationDate?: Date): Date {
    if (customExpirationDate) {
      return customExpirationDate
    }

    const hours = expirationHours || 24 // Default 24 hours
    const expirationDate = new Date()
    expirationDate.setHours(expirationDate.getHours() + hours)

    return expirationDate
  }

  private async logScan(
    qrCodeId: string | null,
    code: string,
    result: ScanResult,
    options: QRCodeScanOptions,
    errorMessage?: string,
  ): Promise<void> {
    try {
      const scanLog = this.scanLogRepository.create({
        qrCodeId,
        code,
        scanResult: result,
        scannedBy: options.scannedBy,
        scannedLocation: options.scannedLocation,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        metadata: options.metadata,
        errorMessage,
      })

      await this.scanLogRepository.save(scanLog)
    } catch (error) {
      this.logger.error(`Failed to log scan: ${error.message}`)
    }
  }
}
