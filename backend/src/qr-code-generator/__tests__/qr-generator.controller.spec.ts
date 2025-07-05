import { Test, type TestingModule } from "@nestjs/testing"
import { QRGeneratorController } from "../controllers/qr-generator.controller"
import { QRGeneratorService } from "../services/qr-generator.service"
import { QRAnalyticsService } from "../services/qr-analytics.service"
import { QRCodeType, QRCodeStatus } from "../entities/qr-code.entity"
import { ScanResult } from "../entities/qr-scan-log.entity"
import type { GenerateQRRequestDto } from "../dto/generate-qr-request.dto"
import type { ScanQRRequestDto } from "../dto/scan-qr-request.dto"
import { jest } from "@jest/globals"

describe("QRGeneratorController", () => {
  let controller: QRGeneratorController
  let qrGeneratorService: QRGeneratorService
  let qrAnalyticsService: QRAnalyticsService

  const mockQRGeneratorService = {
    generateQRCode: jest.fn(),
    scanQRCode: jest.fn(),
    getQRCode: jest.fn(),
    getQRCodeByCode: jest.fn(),
    getQRCodesByReference: jest.fn(),
    revokeQRCode: jest.fn(),
    extendExpiration: jest.fn(),
    getScanHistory: jest.fn(),
    regenerateQRCodeImage: jest.fn(),
    cleanupExpiredQRCodes: jest.fn(),
  }

  const mockQRAnalyticsService = {
    getOverallStatistics: jest.fn(),
    getQRCodeUsageReport: jest.fn(),
    getQRCodePerformanceMetrics: jest.fn(),
    getExpirationAnalysis: jest.fn(),
    getScanLocationAnalysis: jest.fn(),
    getScannerAnalysis: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QRGeneratorController],
      providers: [
        {
          provide: QRGeneratorService,
          useValue: mockQRGeneratorService,
        },
        {
          provide: QRAnalyticsService,
          useValue: mockQRAnalyticsService,
        },
      ],
    }).compile()

    controller = module.get<QRGeneratorController>(QRGeneratorController)
    qrGeneratorService = module.get<QRGeneratorService>(QRGeneratorService)
    qrAnalyticsService = module.get<QRAnalyticsService>(QRAnalyticsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  describe("generateQRCode", () => {
    it("should generate QR code successfully", async () => {
      const request: GenerateQRRequestDto = {
        type: QRCodeType.SHIPMENT_TRACKING,
        referenceId: "shipment-123",
        description: "Test QR code",
        expirationHours: 24,
        maxScans: 1,
        metadata: { priority: "high" },
      }

      const mockQRCode = {
        id: "qr-id-123",
        code: "QR_abc123def456",
        type: QRCodeType.SHIPMENT_TRACKING,
        status: QRCodeStatus.ACTIVE,
        referenceId: "shipment-123",
        description: "Test QR code",
        expiresAt: new Date(),
        scanCount: 0,
        maxScans: 1,
        createdAt: new Date(),
      }

      const mockImage = "data:image/png;base64,..."

      mockQRGeneratorService.generateQRCode.mockResolvedValue({
        qrCode: mockQRCode,
        qrCodeImage: mockImage,
      })

      const result = await controller.generateQRCode(request)

      expect(mockQRGeneratorService.generateQRCode).toHaveBeenCalledWith({
        type: request.type,
        referenceId: request.referenceId,
        description: request.description,
        expirationHours: request.expirationHours,
        maxScans: request.maxScans,
        customExpirationDate: undefined,
        metadata: request.metadata,
        createdBy: undefined,
      })

      expect(result).toEqual({
        id: mockQRCode.id,
        code: mockQRCode.code,
        type: mockQRCode.type,
        status: mockQRCode.status,
        referenceId: mockQRCode.referenceId,
        description: mockQRCode.description,
        expiresAt: mockQRCode.expiresAt,
        scanCount: mockQRCode.scanCount,
        maxScans: mockQRCode.maxScans,
        createdAt: mockQRCode.createdAt,
        qrCodeImage: mockImage,
      })
    })

    it("should handle custom expiration date", async () => {
      const customDate = "2024-12-31T23:59:59Z"
      const request: GenerateQRRequestDto = {
        type: QRCodeType.DELIVERY_VALIDATION,
        customExpirationDate: customDate,
      }

      const mockResult = {
        qrCode: {
          id: "qr-id-456",
          code: "QR_custom123",
          type: QRCodeType.DELIVERY_VALIDATION,
          status: QRCodeStatus.ACTIVE,
          expiresAt: new Date(customDate),
          scanCount: 0,
          maxScans: 1,
          createdAt: new Date(),
        },
        qrCodeImage: "data:image/png;base64,...",
      }

      mockQRGeneratorService.generateQRCode.mockResolvedValue(mockResult)

      await controller.generateQRCode(request)

      expect(mockQRGeneratorService.generateQRCode).toHaveBeenCalledWith(
        expect.objectContaining({
          customExpirationDate: new Date(customDate),
        }),
      )
    })
  })

  describe("scanQRCode", () => {
    it("should scan QR code successfully", async () => {
      const request: ScanQRRequestDto = {
        code: "QR_abc123def456",
        scannedBy: "scanner-001",
        scannedLocation: "Warehouse A",
        ipAddress: "192.168.1.100",
        userAgent: "Scanner App",
      }

      const mockQRCode = {
        id: "qr-id-123",
        type: QRCodeType.SHIPMENT_TRACKING,
        referenceId: "shipment-123",
        description: "Test QR code",
        scanCount: 1,
        maxScans: 1,
        metadata: { priority: "high" },
      }

      mockQRGeneratorService.scanQRCode.mockResolvedValue({
        result: ScanResult.SUCCESS,
        qrCode: mockQRCode,
        message: "QR code scanned successfully",
      })

      const result = await controller.scanQRCode(request)

      expect(mockQRGeneratorService.scanQRCode).toHaveBeenCalledWith(request.code, {
        scannedBy: request.scannedBy,
        scannedLocation: request.scannedLocation,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
      })

      expect(result).toEqual({
        result: ScanResult.SUCCESS,
        success: true,
        message: "QR code scanned successfully",
        qrCode: {
          id: mockQRCode.id,
          type: mockQRCode.type,
          referenceId: mockQRCode.referenceId,
          description: mockQRCode.description,
          scanCount: mockQRCode.scanCount,
          maxScans: mockQRCode.maxScans,
          metadata: mockQRCode.metadata,
        },
        scannedAt: expect.any(Date),
      })
    })

    it("should handle failed scan", async () => {
      const request: ScanQRRequestDto = {
        code: "QR_invalid123",
      }

      mockQRGeneratorService.scanQRCode.mockResolvedValue({
        result: ScanResult.INVALID,
        message: "QR code not found",
      })

      const result = await controller.scanQRCode(request)

      expect(result).toEqual({
        result: ScanResult.INVALID,
        success: false,
        message: "QR code not found",
        qrCode: undefined,
        scannedAt: expect.any(Date),
      })
    })
  })

  describe("getQRCode", () => {
    it("should return QR code by ID", async () => {
      const id = "qr-id-123"
      const mockQRCode = {
        id,
        code: "QR_test123",
        type: QRCodeType.GENERAL,
        status: QRCodeStatus.ACTIVE,
      }

      mockQRGeneratorService.getQRCode.mockResolvedValue(mockQRCode)

      const result = await controller.getQRCode(id)

      expect(mockQRGeneratorService.getQRCode).toHaveBeenCalledWith(id)
      expect(result).toEqual(mockQRCode)
    })
  })

  describe("getQRCodeByCode", () => {
    it("should return QR code by code string", async () => {
      const code = "QR_test123"
      const mockQRCode = {
        id: "qr-id-123",
        code,
        type: QRCodeType.GENERAL,
        status: QRCodeStatus.ACTIVE,
      }

      mockQRGeneratorService.getQRCodeByCode.mockResolvedValue(mockQRCode)

      const result = await controller.getQRCodeByCode(code)

      expect(mockQRGeneratorService.getQRCodeByCode).toHaveBeenCalledWith(code)
      expect(result).toEqual(mockQRCode)
    })
  })

  describe("getQRCodesByReference", () => {
    it("should return QR codes by reference ID", async () => {
      const referenceId = "shipment-123"
      const mockQRCodes = [
        { id: "qr-1", referenceId, code: "QR_test1" },
        { id: "qr-2", referenceId, code: "QR_test2" },
      ]

      mockQRGeneratorService.getQRCodesByReference.mockResolvedValue(mockQRCodes)

      const result = await controller.getQRCodesByReference(referenceId)

      expect(mockQRGeneratorService.getQRCodesByReference).toHaveBeenCalledWith(referenceId)
      expect(result).toEqual(mockQRCodes)
    })
  })

  describe("revokeQRCode", () => {
    it("should revoke QR code with reason", async () => {
      const id = "qr-id-123"
      const reason = "Security concern"
      const mockRevokedQR = {
        id,
        status: QRCodeStatus.REVOKED,
        metadata: { revokeReason: reason },
      }

      mockQRGeneratorService.revokeQRCode.mockResolvedValue(mockRevokedQR)

      const result = await controller.revokeQRCode(id, { reason })

      expect(mockQRGeneratorService.revokeQRCode).toHaveBeenCalledWith(id, reason)
      expect(result).toEqual(mockRevokedQR)
    })

    it("should revoke QR code without reason", async () => {
      const id = "qr-id-123"
      const mockRevokedQR = {
        id,
        status: QRCodeStatus.REVOKED,
      }

      mockQRGeneratorService.revokeQRCode.mockResolvedValue(mockRevokedQR)

      const result = await controller.revokeQRCode(id, {})

      expect(mockQRGeneratorService.revokeQRCode).toHaveBeenCalledWith(id, undefined)
      expect(result).toEqual(mockRevokedQR)
    })
  })

  describe("extendExpiration", () => {
    it("should extend QR code expiration", async () => {
      const id = "qr-id-123"
      const additionalHours = 24
      const mockExtendedQR = {
        id,
        expiresAt: new Date(Date.now() + additionalHours * 60 * 60 * 1000),
      }

      mockQRGeneratorService.extendExpiration.mockResolvedValue(mockExtendedQR)

      const result = await controller.extendExpiration(id, { additionalHours })

      expect(mockQRGeneratorService.extendExpiration).toHaveBeenCalledWith(id, additionalHours)
      expect(result).toEqual(mockExtendedQR)
    })
  })

  describe("getScanHistory", () => {
    it("should return scan history", async () => {
      const id = "qr-id-123"
      const limit = 25
      const mockScanHistory = [
        { id: "scan-1", scanResult: ScanResult.SUCCESS },
        { id: "scan-2", scanResult: ScanResult.SUCCESS },
      ]

      mockQRGeneratorService.getScanHistory.mockResolvedValue(mockScanHistory)

      const result = await controller.getScanHistory(id, limit)

      expect(mockQRGeneratorService.getScanHistory).toHaveBeenCalledWith(id, limit)
      expect(result).toEqual(mockScanHistory)
    })

    it("should use default limit when not provided", async () => {
      const id = "qr-id-123"
      const mockScanHistory = []

      mockQRGeneratorService.getScanHistory.mockResolvedValue(mockScanHistory)

      await controller.getScanHistory(id)

      expect(mockQRGeneratorService.getScanHistory).toHaveBeenCalledWith(id, undefined)
    })
  })

  describe("regenerateImage", () => {
    it("should regenerate QR code image", async () => {
      const id = "qr-id-123"
      const size = 512
      const mockImage = "data:image/png;base64,regenerated..."

      mockQRGeneratorService.regenerateQRCodeImage.mockResolvedValue(mockImage)

      const result = await controller.regenerateImage(id, size)

      expect(mockQRGeneratorService.regenerateQRCodeImage).toHaveBeenCalledWith(id, { size })
      expect(result).toEqual({ qrCodeImage: mockImage })
    })

    it("should regenerate image without size parameter", async () => {
      const id = "qr-id-123"
      const mockImage = "data:image/png;base64,regenerated..."

      mockQRGeneratorService.regenerateQRCodeImage.mockResolvedValue(mockImage)

      const result = await controller.regenerateImage(id)

      expect(mockQRGeneratorService.regenerateQRCodeImage).toHaveBeenCalledWith(id, {})
      expect(result).toEqual({ qrCodeImage: mockImage })
    })
  })

  describe("cleanupExpired", () => {
    it("should cleanup expired QR codes", async () => {
      const cleanedCount = 15

      mockQRGeneratorService.cleanupExpiredQRCodes.mockResolvedValue(cleanedCount)

      const result = await controller.cleanupExpired()

      expect(mockQRGeneratorService.cleanupExpiredQRCodes).toHaveBeenCalled()
      expect(result).toEqual({ message: "15 expired QR codes cleaned up" })
    })
  })

  describe("Analytics Endpoints", () => {
    describe("getStatistics", () => {
      it("should return overall statistics", async () => {
        const mockStats = {
          totalGenerated: 100,
          totalScanned: 75,
          activeCount: 60,
          expiredCount: 20,
          usedCount: 15,
          revokedCount: 5,
          scansByType: {},
          scansByResult: {},
        }

        mockQRAnalyticsService.getOverallStatistics.mockResolvedValue(mockStats)

        const result = await controller.getStatistics()

        expect(mockQRAnalyticsService.getOverallStatistics).toHaveBeenCalled()
        expect(result).toEqual(mockStats)
      })
    })

    describe("getUsageReport", () => {
      it("should return usage report for date range", async () => {
        const startDate = "2024-01-01"
        const endDate = "2024-01-31"
        const mockReport = {
          period: { start: new Date(startDate), end: new Date(endDate) },
          generated: 50,
          scanned: 40,
          successfulScans: 35,
          failedScans: 5,
          topTypes: [],
          dailyActivity: [],
        }

        mockQRAnalyticsService.getQRCodeUsageReport.mockResolvedValue(mockReport)

        const result = await controller.getUsageReport(startDate, endDate)

        expect(mockQRAnalyticsService.getQRCodeUsageReport).toHaveBeenCalledWith(new Date(startDate), new Date(endDate))
        expect(result).toEqual(mockReport)
      })
    })

    describe("getPerformanceMetrics", () => {
      it("should return performance metrics", async () => {
        const mockMetrics = {
          averageScansPerCode: 2.5,
          mostScannedType: QRCodeType.SHIPMENT_TRACKING,
          peakScanHour: 14,
          scanSuccessRate: 0.85,
          averageTimeToFirstScan: 45.5,
        }

        mockQRAnalyticsService.getQRCodePerformanceMetrics.mockResolvedValue(mockMetrics)

        const result = await controller.getPerformanceMetrics()

        expect(mockQRAnalyticsService.getQRCodePerformanceMetrics).toHaveBeenCalled()
        expect(result).toEqual(mockMetrics)
      })
    })

    describe("getExpirationAnalysis", () => {
      it("should return expiration analysis", async () => {
        const mockAnalysis = {
          expiringSoon: 5,
          expiredUnused: 12,
          averageLifespan: 48.5,
          expirationPatterns: [],
        }

        mockQRAnalyticsService.getExpirationAnalysis.mockResolvedValue(mockAnalysis)

        const result = await controller.getExpirationAnalysis()

        expect(mockQRAnalyticsService.getExpirationAnalysis).toHaveBeenCalled()
        expect(result).toEqual(mockAnalysis)
      })
    })

    describe("getLocationAnalysis", () => {
      it("should return location analysis", async () => {
        const mockAnalysis = [
          { location: "Warehouse A", count: 45 },
          { location: "Distribution Center B", count: 32 },
        ]

        mockQRAnalyticsService.getScanLocationAnalysis.mockResolvedValue(mockAnalysis)

        const result = await controller.getLocationAnalysis()

        expect(mockQRAnalyticsService.getScanLocationAnalysis).toHaveBeenCalled()
        expect(result).toEqual(mockAnalysis)
      })
    })

    describe("getScannerAnalysis", () => {
      it("should return scanner analysis", async () => {
        const mockAnalysis = [
          { scanner: "scanner-001", count: 100, successRate: 0.95 },
          { scanner: "scanner-002", count: 80, successRate: 0.9 },
        ]

        mockQRAnalyticsService.getScannerAnalysis.mockResolvedValue(mockAnalysis)

        const result = await controller.getScannerAnalysis()

        expect(mockQRAnalyticsService.getScannerAnalysis).toHaveBeenCalled()
        expect(result).toEqual(mockAnalysis)
      })
    })
  })
})
