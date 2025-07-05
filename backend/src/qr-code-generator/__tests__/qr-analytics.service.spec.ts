import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { QRAnalyticsService } from "../services/qr-analytics.service"
import { QRCode, QRCodeType } from "../entities/qr-code.entity"
import { QRScanLog, ScanResult } from "../entities/qr-scan-log.entity"
import { jest } from "@jest/globals"

describe("QRAnalyticsService", () => {
  let service: QRAnalyticsService
  let qrCodeRepository: Repository<QRCode>
  let scanLogRepository: Repository<QRScanLog>

  const mockQRCodeRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockScanLogRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QRAnalyticsService,
        {
          provide: getRepositoryToken(QRCode),
          useValue: mockQRCodeRepository,
        },
        {
          provide: getRepositoryToken(QRScanLog),
          useValue: mockScanLogRepository,
        },
      ],
    }).compile()

    service = module.get<QRAnalyticsService>(QRAnalyticsService)
    qrCodeRepository = module.get<Repository<QRCode>>(getRepositoryToken(QRCode))
    scanLogRepository = module.get<Repository<QRScanLog>>(getRepositoryToken(QRScanLog))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("getOverallStatistics", () => {
    it("should return comprehensive statistics", async () => {
      // Mock basic counts
      mockQRCodeRepository.count
        .mockResolvedValueOnce(100) // totalGenerated
        .mockResolvedValueOnce(60) // activeCount
        .mockResolvedValueOnce(20) // expiredCount
        .mockResolvedValueOnce(15) // usedCount
        .mockResolvedValueOnce(5) // revokedCount

      mockScanLogRepository.count.mockResolvedValue(150) // totalScanned

      // Mock scans by type query
      const mockTypeQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { type: QRCodeType.SHIPMENT_TRACKING, totalScans: "80" },
          { type: QRCodeType.DELIVERY_VALIDATION, totalScans: "70" },
        ]),
      }

      // Mock scans by result query
      const mockResultQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { result: ScanResult.SUCCESS, count: "120" },
          { result: ScanResult.EXPIRED, count: "20" },
          { result: ScanResult.INVALID, count: "10" },
        ]),
      }

      mockQRCodeRepository.createQueryBuilder.mockReturnValue(mockTypeQueryBuilder)
      mockScanLogRepository.createQueryBuilder.mockReturnValue(mockResultQueryBuilder)

      const result = await service.getOverallStatistics()

      expect(result.totalGenerated).toBe(100)
      expect(result.totalScanned).toBe(150)
      expect(result.activeCount).toBe(60)
      expect(result.expiredCount).toBe(20)
      expect(result.usedCount).toBe(15)
      expect(result.revokedCount).toBe(5)
      expect(result.scansByType[QRCodeType.SHIPMENT_TRACKING]).toBe(80)
      expect(result.scansByResult[ScanResult.SUCCESS]).toBe(120)
    })
  })

  describe("getQRCodeUsageReport", () => {
    it("should return usage report for date range", async () => {
      const startDate = new Date("2024-01-01")
      const endDate = new Date("2024-01-31")

      // Mock basic counts for date range
      mockQRCodeRepository.count.mockResolvedValueOnce(50) // generated

      mockScanLogRepository.count
        .mockResolvedValueOnce(75) // scanned
        .mockResolvedValueOnce(60) // successfulScans
        .mockResolvedValueOnce(15) // failedScans

      // Mock top types query
      const mockTopTypesQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { type: QRCodeType.SHIPMENT_TRACKING, count: "30" },
          { type: QRCodeType.DELIVERY_VALIDATION, count: "20" },
        ]),
      }

      // Mock daily activity queries
      const mockDailyGeneratedQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { date: "2024-01-01", count: "10" },
          { date: "2024-01-02", count: "15" },
        ]),
      }

      const mockDailyScannedQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { date: "2024-01-01", count: "8" },
          { date: "2024-01-02", count: "12" },
        ]),
      }

      mockQRCodeRepository.createQueryBuilder
        .mockReturnValueOnce(mockTopTypesQueryBuilder)
        .mockReturnValueOnce(mockDailyGeneratedQueryBuilder)

      mockScanLogRepository.createQueryBuilder.mockReturnValueOnce(mockDailyScannedQueryBuilder)

      const result = await service.getQRCodeUsageReport(startDate, endDate)

      expect(result.period.start).toEqual(startDate)
      expect(result.period.end).toEqual(endDate)
      expect(result.generated).toBe(50)
      expect(result.scanned).toBe(75)
      expect(result.successfulScans).toBe(60)
      expect(result.failedScans).toBe(15)
      expect(result.topTypes).toHaveLength(2)
      expect(result.dailyActivity).toHaveLength(2)
    })
  })

  describe("getQRCodePerformanceMetrics", () => {
    it("should return performance metrics", async () => {
      // Mock average scans query
      const mockAvgScansQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avgScans: "2.5" }),
      }

      // Mock most scanned type query
      const mockMostScannedQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ type: QRCodeType.SHIPMENT_TRACKING }),
      }

      // Mock peak hour query
      const mockPeakHourQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ hour: "14" }),
      }

      // Mock success rate counts
      mockScanLogRepository.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(85) // successful

      // Mock average time to scan query
      const mockAvgTimeQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avgMinutes: "45.5" }),
      }

      mockQRCodeRepository.createQueryBuilder
        .mockReturnValueOnce(mockAvgScansQueryBuilder)
        .mockReturnValueOnce(mockMostScannedQueryBuilder)
        .mockReturnValueOnce(mockAvgTimeQueryBuilder)

      mockScanLogRepository.createQueryBuilder.mockReturnValueOnce(mockPeakHourQueryBuilder)

      const result = await service.getQRCodePerformanceMetrics()

      expect(result.averageScansPerCode).toBe(2.5)
      expect(result.mostScannedType).toBe(QRCodeType.SHIPMENT_TRACKING)
      expect(result.peakScanHour).toBe(14)
      expect(result.scanSuccessRate).toBe(0.85)
      expect(result.averageTimeToFirstScan).toBe(45.5)
    })
  })

  describe("getExpirationAnalysis", () => {
    it("should return expiration analysis", async () => {
      // Mock expiring soon count
      mockQRCodeRepository.count
        .mockResolvedValueOnce(5) // expiringSoon
        .mockResolvedValueOnce(12) // expiredUnused

      // Mock average lifespan query
      const mockAvgLifespanQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avgHours: "48.5" }),
      }

      // Mock expiration patterns query
      const mockPatternsQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { hours: "24.0", count: "50" },
          { hours: "48.0", count: "30" },
          { hours: "72.0", count: "20" },
        ]),
      }

      mockQRCodeRepository.createQueryBuilder
        .mockReturnValueOnce(mockAvgLifespanQueryBuilder)
        .mockReturnValueOnce(mockPatternsQueryBuilder)

      const result = await service.getExpirationAnalysis()

      expect(result.expiringSoon).toBe(5)
      expect(result.expiredUnused).toBe(12)
      expect(result.averageLifespan).toBe(48.5)
      expect(result.expirationPatterns).toHaveLength(3)
      expect(result.expirationPatterns[0]).toEqual({ hours: 24, count: 50 })
    })
  })

  describe("getScanLocationAnalysis", () => {
    it("should return scan location analysis", async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { location: "Warehouse A", count: "45" },
          { location: "Distribution Center B", count: "32" },
          { location: "Retail Store C", count: "28" },
        ]),
      }

      mockScanLogRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      const result = await service.getScanLocationAnalysis()

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ location: "Warehouse A", count: 45 })
      expect(result[1]).toEqual({ location: "Distribution Center B", count: 32 })
    })
  })

  describe("getScannerAnalysis", () => {
    it("should return scanner analysis with success rates", async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { scanner: "scanner-001", totalScans: "100", successfulScans: "95" },
          { scanner: "scanner-002", totalScans: "80", successfulScans: "72" },
          { scanner: "mobile-app", totalScans: "60", successfulScans: "54" },
        ]),
      }

      mockScanLogRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      const result = await service.getScannerAnalysis()

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        scanner: "scanner-001",
        count: 100,
        successRate: 0.95,
      })
      expect(result[1]).toEqual({
        scanner: "scanner-002",
        count: 80,
        successRate: 0.9,
      })
    })
  })
})
