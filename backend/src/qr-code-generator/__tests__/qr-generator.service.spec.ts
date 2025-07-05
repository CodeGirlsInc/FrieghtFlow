import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { NotFoundException, BadRequestException } from "@nestjs/common"
import { QRGeneratorService } from "../services/qr-generator.service"
import { QRHashService } from "../services/qr-hash.service"
import { QRImageService } from "../services/qr-image.service"
import { QRCode, QRCodeType, QRCodeStatus } from "../entities/qr-code.entity"
import { QRScanLog, ScanResult } from "../entities/qr-scan-log.entity"
import { jest } from "@jest/globals"

describe("QRGeneratorService", () => {
  let service: QRGeneratorService
  let qrCodeRepository: Repository<QRCode>
  let scanLogRepository: Repository<QRScanLog>
  let qrHashService: QRHashService
  let qrImageService: QRImageService

  const mockQRCodeRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockScanLogRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  }

  const mockQRHashService = {
    generateUniqueCode: jest.fn(),
    generateSecureHash: jest.fn(),
    validateCodeFormat: jest.fn(),
  }

  const mockQRImageService = {
    generateQRCodeImage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QRGeneratorService,
        {
          provide: getRepositoryToken(QRCode),
          useValue: mockQRCodeRepository,
        },
        {
          provide: getRepositoryToken(QRScanLog),
          useValue: mockScanLogRepository,
        },
        {
          provide: QRHashService,
          useValue: mockQRHashService,
        },
        {
          provide: QRImageService,
          useValue: mockQRImageService,
        },
      ],
    }).compile()

    service = module.get<QRGeneratorService>(QRGeneratorService)
    qrCodeRepository = module.get<Repository<QRCode>>(getRepositoryToken(QRCode))
    scanLogRepository = module.get<Repository<QRScanLog>>(getRepositoryToken(QRScanLog))
    qrHashService = module.get<QRHashService>(QRHashService)
    qrImageService = module.get<QRImageService>(QRImageService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("generateQRCode", () => {
    it("should generate QR code successfully", async () => {
      const options = {
        type: QRCodeType.SHIPMENT_TRACKING,
        referenceId: "shipment-123",
        description: "Test QR code",
        expirationHours: 24,
      }

      const mockCode = "QR_abc123def456"
      const mockHash = "hash123"
      const mockQRCode = {
        id: "qr-id-123",
        code: mockCode,
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

      mockQRHashService.generateUniqueCode.mockReturnValue(mockCode)
      mockQRHashService.generateSecureHash.mockReturnValue(mockHash)
      mockQRCodeRepository.findOne.mockResolvedValue(null) // No collision
      mockQRCodeRepository.create.mockReturnValue(mockQRCode)
      mockQRCodeRepository.save.mockResolvedValue(mockQRCode)
      mockQRImageService.generateQRCodeImage.mockResolvedValue(mockImage)

      const result = await service.generateQRCode(options)

      expect(result.qrCode).toEqual(mockQRCode)
      expect(result.qrCodeImage).toBe(mockImage)
      expect(mockQRCodeRepository.save).toHaveBeenCalled()
      expect(mockQRImageService.generateQRCodeImage).toHaveBeenCalledWith(mockCode)
    })

    it("should retry generation on code collision", async () => {
      const options = {
        type: QRCodeType.DELIVERY_VALIDATION,
        referenceId: "delivery-456",
      }

      const mockCode1 = "QR_collision123"
      const mockCode2 = "QR_unique456"
      const mockExistingQR = { id: "existing", code: mockCode1 }
      const mockNewQR = {
        id: "new-id",
        code: mockCode2,
        type: QRCodeType.DELIVERY_VALIDATION,
        status: QRCodeStatus.ACTIVE,
        expiresAt: new Date(),
        scanCount: 0,
        maxScans: 1,
        createdAt: new Date(),
      }

      mockQRHashService.generateUniqueCode.mockReturnValueOnce(mockCode1).mockReturnValueOnce(mockCode2)
      mockQRHashService.generateSecureHash.mockReturnValue("hash123")
      mockQRCodeRepository.findOne
        .mockResolvedValueOnce(mockExistingQR) // Collision
        .mockResolvedValueOnce(null) // No collision
      mockQRCodeRepository.create.mockReturnValue(mockNewQR)
      mockQRCodeRepository.save.mockResolvedValue(mockNewQR)
      mockQRImageService.generateQRCodeImage.mockResolvedValue("image")

      const result = await service.generateQRCode(options)

      expect(result.qrCode.code).toBe(mockCode2)
      expect(mockQRHashService.generateUniqueCode).toHaveBeenCalledTimes(2)
    })
  })

  describe("scanQRCode", () => {
    it("should scan valid QR code successfully", async () => {
      const code = "QR_valid123456"
      const mockQRCode = {
        id: "qr-id-123",
        code,
        type: QRCodeType.SHIPMENT_TRACKING,
        status: QRCodeStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        scanCount: 0,
        maxScans: 1,
        scannedAt: null,
        scannedBy: null,
        scannedLocation: null,
      }

      mockQRHashService.validateCodeFormat.mockReturnValue(true)
      mockQRCodeRepository.findOne.mockResolvedValue(mockQRCode)
      mockQRCodeRepository.save.mockResolvedValue({
        ...mockQRCode,
        scanCount: 1,
        status: QRCodeStatus.USED,
        scannedAt: new Date(),
      })
      mockScanLogRepository.create.mockReturnValue({})
      mockScanLogRepository.save.mockResolvedValue({})

      const result = await service.scanQRCode(code, {
        scannedBy: "scanner-001",
        scannedLocation: "Warehouse A",
      })

      expect(result.result).toBe(ScanResult.SUCCESS)
      expect(result.qrCode).toBeDefined()
      expect(result.message).toBe("QR code scanned successfully")
      expect(mockQRCodeRepository.save).toHaveBeenCalled()
      expect(mockScanLogRepository.save).toHaveBeenCalled()
    })

    it("should reject invalid QR code format", async () => {
      const invalidCode = "invalid-code"

      mockQRHashService.validateCodeFormat.mockReturnValue(false)
      mockScanLogRepository.create.mockReturnValue({})
      mockScanLogRepository.save.mockResolvedValue({})

      const result = await service.scanQRCode(invalidCode)

      expect(result.result).toBe(ScanResult.INVALID)
      expect(result.message).toBe("Invalid QR code format")
      expect(result.qrCode).toBeUndefined()
    })

    it("should reject non-existent QR code", async () => {
      const code = "QR_nonexistent123"

      mockQRHashService.validateCodeFormat.mockReturnValue(true)
      mockQRCodeRepository.findOne.mockResolvedValue(null)
      mockScanLogRepository.create.mockReturnValue({})
      mockScanLogRepository.save.mockResolvedValue({})

      const result = await service.scanQRCode(code)

      expect(result.result).toBe(ScanResult.INVALID)
      expect(result.message).toBe("QR code not found")
    })

    it("should reject expired QR code", async () => {
      const code = "QR_expired123456"
      const mockQRCode = {
        id: "qr-id-123",
        code,
        status: QRCodeStatus.ACTIVE,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        scanCount: 0,
        maxScans: 1,
      }

      mockQRHashService.validateCodeFormat.mockReturnValue(true)
      mockQRCodeRepository.findOne.mockResolvedValue(mockQRCode)
      mockScanLogRepository.create.mockReturnValue({})
      mockScanLogRepository.save.mockResolvedValue({})

      const result = await service.scanQRCode(code)

      expect(result.result).toBe(ScanResult.EXPIRED)
      expect(result.message).toBe("QR code has expired")
    })

    it("should reject already used QR code", async () => {
      const code = "QR_used123456"
      const mockQRCode = {
        id: "qr-id-123",
        code,
        status: QRCodeStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        scanCount: 1,
        maxScans: 1,
      }

      mockQRHashService.validateCodeFormat.mockReturnValue(true)
      mockQRCodeRepository.findOne.mockResolvedValue(mockQRCode)
      mockScanLogRepository.create.mockReturnValue({})
      mockScanLogRepository.save.mockResolvedValue({})

      const result = await service.scanQRCode(code)

      expect(result.result).toBe(ScanResult.ALREADY_USED)
      expect(result.message).toBe("QR code has reached maximum scan limit")
    })

    it("should reject revoked QR code", async () => {
      const code = "QR_revoked123456"
      const mockQRCode = {
        id: "qr-id-123",
        code,
        status: QRCodeStatus.REVOKED,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        scanCount: 0,
        maxScans: 1,
      }

      mockQRHashService.validateCodeFormat.mockReturnValue(true)
      mockQRCodeRepository.findOne.mockResolvedValue(mockQRCode)
      mockScanLogRepository.create.mockReturnValue({})
      mockScanLogRepository.save.mockResolvedValue({})

      const result = await service.scanQRCode(code)

      expect(result.result).toBe(ScanResult.REVOKED)
      expect(result.message).toBe("QR code has been revoked")
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

      mockQRCodeRepository.findOne.mockResolvedValue(mockQRCode)

      const result = await service.getQRCode(id)

      expect(result).toEqual(mockQRCode)
      expect(mockQRCodeRepository.findOne).toHaveBeenCalledWith({ where: { id } })
    })

    it("should throw NotFoundException for non-existent QR code", async () => {
      const id = "non-existent"

      mockQRCodeRepository.findOne.mockResolvedValue(null)

      await expect(service.getQRCode(id)).rejects.toThrow(NotFoundException)
    })
  })

  describe("revokeQRCode", () => {
    it("should revoke active QR code", async () => {
      const id = "qr-id-123"
      const mockQRCode = {
        id,
        status: QRCodeStatus.ACTIVE,
        metadata: {},
      }

      mockQRCodeRepository.findOne.mockResolvedValue(mockQRCode)
      mockQRCodeRepository.save.mockResolvedValue({
        ...mockQRCode,
        status: QRCodeStatus.REVOKED,
      })

      const result = await service.revokeQRCode(id, "Security concern")

      expect(result.status).toBe(QRCodeStatus.REVOKED)
      expect(mockQRCodeRepository.save).toHaveBeenCalled()
    })

    it("should throw error for already revoked QR code", async () => {
      const id = "qr-id-123"
      const mockQRCode = {
        id,
        status: QRCodeStatus.REVOKED,
      }

      mockQRCodeRepository.findOne.mockResolvedValue(mockQRCode)

      await expect(service.revokeQRCode(id)).rejects.toThrow(BadRequestException)
    })
  })

  describe("extendExpiration", () => {
    it("should extend expiration for active QR code", async () => {
      const id = "qr-id-123"
      const originalExpiration = new Date()
      const mockQRCode = {
        id,
        status: QRCodeStatus.ACTIVE,
        expiresAt: originalExpiration,
        metadata: {},
      }

      mockQRCodeRepository.findOne.mockResolvedValue(mockQRCode)
      mockQRCodeRepository.save.mockResolvedValue({
        ...mockQRCode,
        expiresAt: new Date(originalExpiration.getTime() + 12 * 60 * 60 * 1000),
      })

      const result = await service.extendExpiration(id, 12)

      expect(result.expiresAt.getTime()).toBeGreaterThan(originalExpiration.getTime())
      expect(mockQRCodeRepository.save).toHaveBeenCalled()
    })

    it("should throw error for non-active QR code", async () => {
      const id = "qr-id-123"
      const mockQRCode = {
        id,
        status: QRCodeStatus.EXPIRED,
      }

      mockQRCodeRepository.findOne.mockResolvedValue(mockQRCode)

      await expect(service.extendExpiration(id, 12)).rejects.toThrow(BadRequestException)
    })
  })

  describe("cleanupExpiredQRCodes", () => {
    it("should mark expired QR codes as expired", async () => {
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 5 }),
      }

      mockQRCodeRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      const result = await service.cleanupExpiredQRCodes()

      expect(result).toBe(5)
      expect(mockQueryBuilder.execute).toHaveBeenCalled()
    })
  })

  describe("getQRCodesByReference", () => {
    it("should return QR codes by reference ID", async () => {
      const referenceId = "shipment-123"
      const mockQRCodes = [
        { id: "qr-1", referenceId, code: "QR_test1" },
        { id: "qr-2", referenceId, code: "QR_test2" },
      ]

      mockQRCodeRepository.find.mockResolvedValue(mockQRCodes)

      const result = await service.getQRCodesByReference(referenceId)

      expect(result).toEqual(mockQRCodes)
      expect(mockQRCodeRepository.find).toHaveBeenCalledWith({
        where: { referenceId },
        order: { createdAt: "DESC" },
      })
    })
  })

  describe("getScanHistory", () => {
    it("should return scan history for QR code", async () => {
      const qrCodeId = "qr-id-123"
      const mockScanLogs = [
        { id: "scan-1", qrCodeId, scanResult: ScanResult.SUCCESS },
        { id: "scan-2", qrCodeId, scanResult: ScanResult.SUCCESS },
      ]

      mockScanLogRepository.find.mockResolvedValue(mockScanLogs)

      const result = await service.getScanHistory(qrCodeId, 25)

      expect(result).toEqual(mockScanLogs)
      expect(mockScanLogRepository.find).toHaveBeenCalledWith({
        where: { qrCodeId },
        order: { createdAt: "DESC" },
        take: 25,
      })
    })
  })
})
