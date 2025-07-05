import { Test, type TestingModule } from "@nestjs/testing"
import { QRHashService } from "../services/qr-hash.service"

describe("QRHashService", () => {
  let service: QRHashService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QRHashService],
    }).compile()

    service = module.get<QRHashService>(QRHashService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("generateUniqueCode", () => {
    it("should generate unique codes with QR_ prefix", () => {
      const code1 = service.generateUniqueCode()
      const code2 = service.generateUniqueCode()

      expect(code1).toMatch(/^QR_[a-f0-9]{12}$/)
      expect(code2).toMatch(/^QR_[a-f0-9]{12}$/)
      expect(code1).not.toBe(code2)
    })

    it("should generate codes of consistent length", () => {
      const codes = Array.from({ length: 10 }, () => service.generateUniqueCode())

      codes.forEach((code) => {
        expect(code.length).toBe(15) // QR_ + 12 hex characters
      })
    })
  })

  describe("generateSecureHash", () => {
    it("should generate consistent hashes for same input", () => {
      const data = "test-data"
      const hash1 = service.generateSecureHash(data)
      const hash2 = service.generateSecureHash(data)

      expect(hash1).toBe(hash2)
      expect(hash1).toMatch(/^[a-f0-9]{64}$/) // SHA256 hex string
    })

    it("should generate different hashes for different inputs", () => {
      const hash1 = service.generateSecureHash("data1")
      const hash2 = service.generateSecureHash("data2")

      expect(hash1).not.toBe(hash2)
    })
  })

  describe("verifyHash", () => {
    it("should verify correct hashes", () => {
      const data = "test-data"
      const hash = service.generateSecureHash(data)

      expect(service.verifyHash(data, hash)).toBe(true)
    })

    it("should reject incorrect hashes", () => {
      const data = "test-data"
      const wrongHash = service.generateSecureHash("wrong-data")

      expect(service.verifyHash(data, wrongHash)).toBe(false)
    })
  })

  describe("generateCodeWithChecksum", () => {
    it("should generate codes with valid checksums", () => {
      const baseData = "shipment-123"
      const code = service.generateCodeWithChecksum(baseData)

      expect(code).toMatch(/^QR_[a-f0-9]{18}$/) // QR_ + 16 hash + 2 checksum
      expect(service.validateCodeFormat(code)).toBe(true)
    })

    it("should generate unique codes for same base data", () => {
      const baseData = "shipment-123"
      const code1 = service.generateCodeWithChecksum(baseData)
      const code2 = service.generateCodeWithChecksum(baseData)

      expect(code1).not.toBe(code2)
    })
  })

  describe("validateCodeFormat", () => {
    it("should validate correct QR code formats", () => {
      const validCode = "QR_abc123def456789012"
      expect(service.validateCodeFormat(validCode)).toBe(true)
    })

    it("should reject codes without QR_ prefix", () => {
      const invalidCode = "abc123def456789012"
      expect(service.validateCodeFormat(invalidCode)).toBe(false)
    })

    it("should reject codes that are too short", () => {
      const shortCode = "QR_abc123"
      expect(service.validateCodeFormat(shortCode)).toBe(false)
    })

    it("should validate checksum when present", () => {
      const codeWithChecksum = service.generateCodeWithChecksum("test")
      expect(service.validateCodeFormat(codeWithChecksum)).toBe(true)

      // Corrupt the checksum
      const corruptedCode = codeWithChecksum.slice(0, -2) + "xx"
      expect(service.validateCodeFormat(corruptedCode)).toBe(false)
    })
  })

  describe("generateSecureToken", () => {
    it("should generate tokens of specified length", () => {
      const token16 = service.generateSecureToken(16)
      const token32 = service.generateSecureToken(32)

      expect(token16.length).toBe(32) // 16 bytes = 32 hex chars
      expect(token32.length).toBe(64) // 32 bytes = 64 hex chars
    })

    it("should generate unique tokens", () => {
      const token1 = service.generateSecureToken()
      const token2 = service.generateSecureToken()

      expect(token1).not.toBe(token2)
    })
  })

  describe("hashSensitiveData", () => {
    it("should hash sensitive data with salt", () => {
      const data = "sensitive-info"
      const hash1 = service.hashSensitiveData(data)
      const hash2 = service.hashSensitiveData(data)

      expect(hash1).not.toBe(hash2) // Different due to random salt
      expect(hash1).toMatch(/^[a-f0-9]{64}$/)
    })

    it("should use provided salt consistently", () => {
      const data = "sensitive-info"
      const salt = "fixed-salt"
      const hash1 = service.hashSensitiveData(data, salt)
      const hash2 = service.hashSensitiveData(data, salt)

      expect(hash1).toBe(hash2) // Same due to fixed salt
    })
  })
})
