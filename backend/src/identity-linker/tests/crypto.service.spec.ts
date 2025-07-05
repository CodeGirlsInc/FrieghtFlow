import { Test, type TestingModule } from "@nestjs/testing"
import { CryptoService } from "../services/crypto.service"
import { ethers } from "ethers"

describe("CryptoService", () => {
  let service: CryptoService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile()

    service = module.get<CryptoService>(CryptoService)
  })

  describe("generateNonce", () => {
    it("should generate a 64-character hex string", () => {
      const nonce = service.generateNonce()
      expect(nonce).toHaveLength(64)
      expect(/^[a-f0-9]+$/i.test(nonce)).toBe(true)
    })

    it("should generate unique nonces", () => {
      const nonce1 = service.generateNonce()
      const nonce2 = service.generateNonce()
      expect(nonce1).not.toBe(nonce2)
    })
  })

  describe("createSignatureMessage", () => {
    it("should create a properly formatted message", () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4"
      const nonce = "test-nonce"
      const message = service.createSignatureMessage(walletAddress, nonce)

      expect(message).toContain(walletAddress)
      expect(message).toContain(nonce)
      expect(message).toContain("Please sign this message")
    })
  })

  describe("verifySignature", () => {
    it("should verify a valid signature", async () => {
      const wallet = ethers.Wallet.createRandom()
      const message = "Test message"
      const signature = await wallet.signMessage(message)

      const isValid = service.verifySignature(message, signature, wallet.address)
      expect(isValid).toBe(true)
    })

    it("should reject an invalid signature", () => {
      const message = "Test message"
      const invalidSignature = "0xinvalid"
      const walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4"

      const isValid = service.verifySignature(message, invalidSignature, walletAddress)
      expect(isValid).toBe(false)
    })

    it("should reject signature from wrong address", async () => {
      const wallet1 = ethers.Wallet.createRandom()
      const wallet2 = ethers.Wallet.createRandom()
      const message = "Test message"
      const signature = await wallet1.signMessage(message)

      const isValid = service.verifySignature(message, signature, wallet2.address)
      expect(isValid).toBe(false)
    })
  })

  describe("hashSignature", () => {
    it("should create a consistent hash", () => {
      const signature = "0x1234567890abcdef"
      const hash1 = service.hashSignature(signature)
      const hash2 = service.hashSignature(signature)

      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(64)
    })

    it("should create different hashes for different signatures", () => {
      const signature1 = "0x1234567890abcdef"
      const signature2 = "0xfedcba0987654321"
      const hash1 = service.hashSignature(signature1)
      const hash2 = service.hashSignature(signature2)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe("normalizeAddress", () => {
    it("should convert address to lowercase", () => {
      const address = "0x742D35CC6634C0532925A3B8D4C9DB96C4B4D4D4"
      const normalized = service.normalizeAddress(address)
      expect(normalized).toBe(address.toLowerCase())
    })
  })
})
