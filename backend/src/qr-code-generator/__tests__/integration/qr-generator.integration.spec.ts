import { Test, type TestingModule } from "@nestjs/testing"
import type { INestApplication } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import * as request from "supertest"
import { QRCodeGeneratorModule } from "../../qr-code-generator.module"
import { QRCode } from "../../entities/qr-code.entity"
import { QRScanLog } from "../../entities/qr-scan-log.entity"
import { QRCodeType } from "../../entities/qr-code.entity"

describe("QRGeneratorController (Integration)", () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [QRCode, QRScanLog],
          synchronize: true,
        }),
        QRCodeGeneratorModule,
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe("/qr-codes/generate (POST)", () => {
    it("should generate QR code successfully", async () => {
      const generateRequest = {
        type: QRCodeType.SHIPMENT_TRACKING,
        referenceId: "shipment-123",
        description: "Test shipment QR code",
        expirationHours: 48,
        maxScans: 3,
        metadata: { priority: "high", carrier: "FedEx" },
      }

      const response = await request(app.getHttpServer()).post("/qr-codes/generate").send(generateRequest).expect(201)

      expect(response.body).toHaveProperty("id")
      expect(response.body).toHaveProperty("code")
      expect(response.body).toHaveProperty("qrCodeImage")
      expect(response.body.code).toMatch(/^QR_[a-f0-9]{12}$/)
      expect(response.body.type).toBe(QRCodeType.SHIPMENT_TRACKING)
      expect(response.body.referenceId).toBe("shipment-123")
      expect(response.body.maxScans).toBe(3)
      expect(response.body.qrCodeImage).toMatch(/^data:image\/png;base64,/)
    })

    it("should generate QR code with default values", async () => {
      const generateRequest = {
        type: QRCodeType.DELIVERY_VALIDATION,
      }

      const response = await request(app.getHttpServer()).post("/qr-codes/generate").send(generateRequest).expect(201)

      expect(response.body.maxScans).toBe(1) // Default value
      expect(response.body.scanCount).toBe(0)
    })

    it("should return 400 for invalid request", async () => {
      const invalidRequest = {
        type: "INVALID_TYPE",
        expirationHours: -1,
      }

      await request(app.getHttpServer()).post("/qr-codes/generate").send(invalidRequest).expect(400)
    })
  })

  describe("/qr-codes/scan (POST)", () => {
    let generatedQRCode: any

    beforeEach(async () => {
      // Generate a QR code for scanning tests
      const generateResponse = await request(app.getHttpServer()).post("/qr-codes/generate").send({
        type: QRCodeType.PICKUP_CONFIRMATION,
        referenceId: "pickup-456",
        expirationHours: 24,
        maxScans: 2,
      })

      generatedQRCode = generateResponse.body
    })

    it("should scan valid QR code successfully", async () => {
      const scanRequest = {
        code: generatedQRCode.code,
        scannedBy: "scanner-001",
        scannedLocation: "Warehouse A - Gate 3",
        ipAddress: "192.168.1.100",
      }

      const response = await request(app.getHttpServer()).post("/qr-codes/scan").send(scanRequest).expect(200)

      expect(response.body.result).toBe("SUCCESS")
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe("QR code scanned successfully")
      expect(response.body.qrCode).toBeDefined()
      expect(response.body.qrCode.scanCount).toBe(1)
      expect(response.body.scannedAt).toBeDefined()
    })

    it("should allow multiple scans up to limit", async () => {
      const scanRequest = {
        code: generatedQRCode.code,
        scannedBy: "scanner-002",
      }

      // First scan
      await request(app.getHttpServer()).post("/qr-codes/scan").send(scanRequest).expect(200)

      // Second scan (should still work)
      const response = await request(app.getHttpServer()).post("/qr-codes/scan").send(scanRequest).expect(200)

      expect(response.body.result).toBe("SUCCESS")
      expect(response.body.qrCode.scanCount).toBe(2)
    })

    it("should reject scan when max scans exceeded", async () => {
      const scanRequest = {
        code: generatedQRCode.code,
        scannedBy: "scanner-003",
      }

      // Perform maximum allowed scans
      await request(app.getHttpServer()).post("/qr-codes/scan").send(scanRequest)
      await request(app.getHttpServer()).post("/qr-codes/scan").send(scanRequest)

      // Third scan should fail
      const response = await request(app.getHttpServer()).post("/qr-codes/scan").send(scanRequest).expect(200)

      expect(response.body.result).toBe("ALREADY_USED")
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain("maximum scan limit")
    })

    it("should reject invalid QR code", async () => {
      const scanRequest = {
        code: "invalid-qr-code",
      }

      const response = await request(app.getHttpServer()).post("/qr-codes/scan").send(scanRequest).expect(200)

      expect(response.body.result).toBe("INVALID")
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe("Invalid QR code format")
    })

    it("should reject non-existent QR code", async () => {
      const scanRequest = {
        code: "QR_nonexistent123",
      }

      const response = await request(app.getHttpServer()).post("/qr-codes/scan").send(scanRequest).expect(200)

      expect(response.body.result).toBe("INVALID")
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe("QR code not found")
    })
  })

  describe("/qr-codes/:id (GET)", () => {
    it("should get QR code details by ID", async () => {
      // Generate a QR code first
      const generateResponse = await request(app.getHttpServer()).post("/qr-codes/generate").send({
        type: QRCodeType.WAREHOUSE_SCAN,
        referenceId: "warehouse-789",
        description: "Warehouse inventory scan",
      })

      const qrCodeId = generateResponse.body.id

      const response = await request(app.getHttpServer()).get(`/qr-codes/${qrCodeId}`).expect(200)

      expect(response.body.id).toBe(qrCodeId)
      expect(response.body.type).toBe(QRCodeType.WAREHOUSE_SCAN)
      expect(response.body.referenceId).toBe("warehouse-789")
    })

    it("should return 404 for non-existent QR code", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000"

      await request(app.getHttpServer()).get(`/qr-codes/${nonExistentId}`).expect(404)
    })
  })

  describe("/qr-codes/reference/:referenceId (GET)", () => {
    it("should get QR codes by reference ID", async () => {
      const referenceId = "multi-ref-123"

      // Generate multiple QR codes with same reference ID
      await request(app.getHttpServer()).post("/qr-codes/generate").send({
        type: QRCodeType.SHIPMENT_TRACKING,
        referenceId,
      })

      await request(app.getHttpServer()).post("/qr-codes/generate").send({
        type: QRCodeType.DELIVERY_VALIDATION,
        referenceId,
      })

      const response = await request(app.getHttpServer()).get(`/qr-codes/reference/${referenceId}`).expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(2)
      response.body.forEach((qr: any) => {
        expect(qr.referenceId).toBe(referenceId)
      })
    })
  })

  describe("/qr-codes/:id/revoke (PATCH)", () => {
    it("should revoke QR code successfully", async () => {
      // Generate a QR code first
      const generateResponse = await request(app.getHttpServer()).post("/qr-codes/generate").send({
        type: QRCodeType.GENERAL,
        referenceId: "revoke-test",
      })

      const qrCodeId = generateResponse.body.id

      const response = await request(app.getHttpServer())
        .patch(`/qr-codes/${qrCodeId}/revoke`)
        .send({ reason: "Security concern" })
        .expect(200)

      expect(response.body.status).toBe("REVOKED")
    })
  })

  describe("/qr-codes/:id/extend (PATCH)", () => {
    it("should extend QR code expiration", async () => {
      // Generate a QR code first
      const generateResponse = await request(app.getHttpServer()).post("/qr-codes/generate").send({
        type: QRCodeType.CUSTOMS_CLEARANCE,
        expirationHours: 12,
      })

      const qrCodeId = generateResponse.body.id
      const originalExpiration = new Date(generateResponse.body.expiresAt)

      const response = await request(app.getHttpServer())
        .patch(`/qr-codes/${qrCodeId}/extend`)
        .send({ additionalHours: 24 })
        .expect(200)

      const newExpiration = new Date(response.body.expiresAt)
      expect(newExpiration.getTime()).toBeGreaterThan(originalExpiration.getTime())
    })
  })

  describe("/qr-codes/cleanup-expired (POST)", () => {
    it("should cleanup expired QR codes", async () => {
      // Generate an expired QR code (using past date)
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      await request(app.getHttpServer()).post("/qr-codes/generate").send({
        type: QRCodeType.GENERAL,
        customExpirationDate: pastDate.toISOString(),
      })

      const response = await request(app.getHttpServer()).post("/qr-codes/cleanup-expired").expect(200)

      expect(response.body.message).toMatch(/\d+ expired QR codes cleaned up/)
    })
  })

  describe("/qr-codes/analytics/statistics (GET)", () => {
    it("should return overall statistics", async () => {
      const response = await request(app.getHttpServer()).get("/qr-codes/analytics/statistics").expect(200)

      expect(response.body).toHaveProperty("totalGenerated")
      expect(response.body).toHaveProperty("totalScanned")
      expect(response.body).toHaveProperty("activeCount")
      expect(response.body).toHaveProperty("expiredCount")
      expect(response.body).toHaveProperty("usedCount")
      expect(response.body).toHaveProperty("revokedCount")
      expect(response.body).toHaveProperty("scansByType")
      expect(response.body).toHaveProperty("scansByResult")
    })
  })

  describe("QR Code Expiration Integration", () => {
    it("should reject expired QR code scan", async () => {
      // Generate QR code with very short expiration
      const generateResponse = await request(app.getHttpServer())
        .post("/qr-codes/generate")
        .send({
          type: QRCodeType.GENERAL,
          customExpirationDate: new Date(Date.now() - 1000).toISOString(), // 1 second ago
        })

      const scanRequest = {
        code: generateResponse.body.code,
      }

      const response = await request(app.getHttpServer()).post("/qr-codes/scan").send(scanRequest).expect(200)

      expect(response.body.result).toBe("EXPIRED")
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe("QR code has expired")
    })
  })

  describe("QR Code Lifecycle Integration", () => {
    it("should handle complete QR code lifecycle", async () => {
      // 1. Generate QR code
      const generateResponse = await request(app.getHttpServer()).post("/qr-codes/generate").send({
        type: QRCodeType.SHIPMENT_TRACKING,
        referenceId: "lifecycle-test",
        description: "Complete lifecycle test",
        expirationHours: 48,
        maxScans: 1,
      })

      const qrCode = generateResponse.body
      expect(qrCode.status).toBe("ACTIVE")

      // 2. Scan QR code
      const scanResponse = await request(app.getHttpServer()).post("/qr-codes/scan").send({
        code: qrCode.code,
        scannedBy: "integration-test",
        scannedLocation: "Test Location",
      })

      expect(scanResponse.body.result).toBe("SUCCESS")

      // 3. Verify QR code is now used
      const getResponse = await request(app.getHttpServer()).get(`/qr-codes/${qrCode.id}`)

      expect(getResponse.body.status).toBe("USED")
      expect(getResponse.body.scanCount).toBe(1)

      // 4. Try to scan again (should fail)
      const secondScanResponse = await request(app.getHttpServer()).post("/qr-codes/scan").send({ code: qrCode.code })

      expect(secondScanResponse.body.result).toBe("ALREADY_USED")

      // 5. Get scan history
      const historyResponse = await request(app.getHttpServer()).get(`/qr-codes/${qrCode.id}/scans`)

      expect(Array.isArray(historyResponse.body)).toBe(true)
      expect(historyResponse.body.length).toBe(2) // One success, one failure
    })
  })
})
