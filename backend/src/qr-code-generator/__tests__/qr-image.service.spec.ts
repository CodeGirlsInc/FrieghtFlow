import { Test, type TestingModule } from "@nestjs/testing"
import { QRImageService } from "../services/qr-image.service"

describe("QRImageService", () => {
  let service: QRImageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QRImageService],
    }).compile()

    service = module.get<QRImageService>(QRImageService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("generateQRCodeImage", () => {
    it("should generate QR code image as data URL", async () => {
      const data = "QR_test123456789"
      const result = await service.generateQRCodeImage(data)

      expect(result).toMatch(/^data:image\/png;base64,/)
      expect(result.length).toBeGreaterThan(100)
    })

    it("should generate QR code with custom size", async () => {
      const data = "QR_test123456789"
      const result = await service.generateQRCodeImage(data, { size: 512 })

      expect(result).toMatch(/^data:image\/png;base64,/)
    })

    it("should generate SVG QR code", async () => {
      const data = "QR_test123456789"
      const result = await service.generateQRCodeImage(data, { type: "svg" })

      expect(result).toMatch(/^data:image\/svg\+xml;base64,/)
    })

    it("should handle custom colors", async () => {
      const data = "QR_test123456789"
      const result = await service.generateQRCodeImage(data, {
        color: { dark: "#FF0000", light: "#00FF00" },
      })

      expect(result).toMatch(/^data:image\/png;base64,/)
    })

    it("should throw error for invalid data", async () => {
      await expect(service.generateQRCodeImage("")).rejects.toThrow()
    })
  })

  describe("generateQRCodeBuffer", () => {
    it("should generate QR code as buffer", async () => {
      const data = "QR_test123456789"
      const result = await service.generateQRCodeBuffer(data)

      expect(Buffer.isBuffer(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it("should generate buffer with custom options", async () => {
      const data = "QR_test123456789"
      const result = await service.generateQRCodeBuffer(data, {
        size: 128,
        margin: 4,
      })

      expect(Buffer.isBuffer(result)).toBe(true)
    })
  })

  describe("generateMultipleSizes", () => {
    it("should generate QR codes in multiple sizes", async () => {
      const data = "QR_test123456789"
      const sizes = [128, 256, 512]
      const result = await service.generateMultipleSizes(data, sizes)

      expect(Object.keys(result)).toEqual(["128px", "256px", "512px"])
      Object.values(result).forEach((image) => {
        expect(image).toMatch(/^data:image\/png;base64,/)
      })
    })

    it("should use default sizes when none provided", async () => {
      const data = "QR_test123456789"
      const result = await service.generateMultipleSizes(data)

      expect(Object.keys(result)).toEqual(["128px", "256px", "512px"])
    })
  })

  describe("validateQRCodeData", () => {
    it("should validate normal QR code data", () => {
      const validData = "QR_test123456789"
      expect(service.validateQRCodeData(validData)).toBe(true)
    })

    it("should reject empty data", () => {
      expect(service.validateQRCodeData("")).toBe(false)
    })

    it("should reject data that is too long", () => {
      const longData = "x".repeat(3000)
      expect(service.validateQRCodeData(longData)).toBe(false)
    })

    it("should accept data at the limit", () => {
      const limitData = "x".repeat(2953)
      expect(service.validateQRCodeData(limitData)).toBe(true)
    })
  })

  describe("getOptimalErrorCorrectionLevel", () => {
    it("should return H for short data", () => {
      expect(service.getOptimalErrorCorrectionLevel(50)).toBe("H")
    })

    it("should return Q for medium data", () => {
      expect(service.getOptimalErrorCorrectionLevel(300)).toBe("Q")
    })

    it("should return M for longer data", () => {
      expect(service.getOptimalErrorCorrectionLevel(800)).toBe("M")
    })

    it("should return L for very long data", () => {
      expect(service.getOptimalErrorCorrectionLevel(1500)).toBe("L")
    })
  })

  describe("generateCustomStyledQR", () => {
    it("should generate QR code with custom styling", async () => {
      const data = "QR_test123456789"
      const style = {
        backgroundColor: "#FFFFFF",
        foregroundColor: "#000000",
      }

      const result = await service.generateCustomStyledQR(data, style)
      expect(result).toMatch(/^data:image\/png;base64,/)
    })

    it("should use default styling when none provided", async () => {
      const data = "QR_test123456789"
      const result = await service.generateCustomStyledQR(data)

      expect(result).toMatch(/^data:image\/png;base64,/)
    })
  })
})
