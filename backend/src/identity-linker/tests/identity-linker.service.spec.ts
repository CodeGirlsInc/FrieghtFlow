import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common"
import { IdentityLinkerService } from "../services/identity-linker.service"
import { CryptoService } from "../services/crypto.service"
import { IdentityLink } from "../entities/identity-link.entity"
import { WalletNonce } from "../entities/wallet-nonce.entity"
import { ethers } from "ethers"
import { jest } from "@jest/globals" // Import jest to declare it

describe("IdentityLinkerService", () => {
  let service: IdentityLinkerService
  let identityLinkRepository: Repository<IdentityLink>
  let walletNonceRepository: Repository<WalletNonce>
  let cryptoService: CryptoService

  const mockIdentityLinkRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockWalletNonceRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdentityLinkerService,
        CryptoService,
        {
          provide: getRepositoryToken(IdentityLink),
          useValue: mockIdentityLinkRepository,
        },
        {
          provide: getRepositoryToken(WalletNonce),
          useValue: mockWalletNonceRepository,
        },
      ],
    }).compile()

    service = module.get<IdentityLinkerService>(IdentityLinkerService)
    identityLinkRepository = module.get<Repository<IdentityLink>>(getRepositoryToken(IdentityLink))
    walletNonceRepository = module.get<Repository<WalletNonce>>(getRepositoryToken(WalletNonce))
    cryptoService = module.get<CryptoService>(CryptoService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("generateNonce", () => {
    const walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4"

    it("should generate a new nonce when none exists", async () => {
      mockWalletNonceRepository.findOne.mockResolvedValue(null)
      mockWalletNonceRepository.create.mockReturnValue({
        walletAddress: walletAddress.toLowerCase(),
        nonce: "test-nonce",
        expiresAt: new Date(),
      })
      mockWalletNonceRepository.save.mockResolvedValue({})

      const result = await service.generateNonce({ walletAddress })

      expect(result).toHaveProperty("nonce")
      expect(result).toHaveProperty("message")
      expect(result).toHaveProperty("expiresAt")
      expect(mockWalletNonceRepository.delete).toHaveBeenCalledWith({
        walletAddress: walletAddress.toLowerCase(),
      })
    })

    it("should return existing valid nonce", async () => {
      const existingNonce = {
        nonce: "existing-nonce",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        walletAddress: walletAddress.toLowerCase(),
      }
      mockWalletNonceRepository.findOne.mockResolvedValue(existingNonce)

      const result = await service.generateNonce({ walletAddress })

      expect(result.nonce).toBe("existing-nonce")
      expect(mockWalletNonceRepository.create).not.toHaveBeenCalled()
    })
  })

  describe("linkWallet", () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000"
    const walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4"
    let wallet: ethers.Wallet
    let signature: string
    let nonce: string

    beforeEach(async () => {
      wallet = new ethers.Wallet("0x" + "1".repeat(64))
      nonce = "test-nonce"
      const message = cryptoService.createSignatureMessage(walletAddress, nonce)
      signature = await wallet.signMessage(message)
    })

    it("should successfully link wallet with valid signature", async () => {
      const walletNonce = {
        nonce,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        isUsed: false,
        walletAddress: walletAddress.toLowerCase(),
      }

      mockWalletNonceRepository.findOne.mockResolvedValue(walletNonce)
      mockIdentityLinkRepository.findOne.mockResolvedValue(null)
      mockIdentityLinkRepository.create.mockReturnValue({
        id: "link-id",
        userId,
        walletAddress: walletAddress.toLowerCase(),
        linkedAt: new Date(),
      })
      mockIdentityLinkRepository.save.mockResolvedValue({
        id: "link-id",
        linkedAt: new Date(),
      })
      mockWalletNonceRepository.save.mockResolvedValue({})

      // Mock the wallet address to match our test wallet
      jest.spyOn(cryptoService, "verifySignature").mockReturnValue(true)

      const result = await service.linkWallet({
        userId,
        walletAddress,
        signature,
      })

      expect(result.success).toBe(true)
      expect(result.linkId).toBe("link-id")
    })

    it("should throw BadRequestException when nonce not found", async () => {
      mockWalletNonceRepository.findOne.mockResolvedValue(null)

      await expect(service.linkWallet({ userId, walletAddress, signature })).rejects.toThrow(BadRequestException)
    })

    it("should throw BadRequestException when nonce is expired", async () => {
      const expiredNonce = {
        nonce,
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
        isUsed: false,
      }
      mockWalletNonceRepository.findOne.mockResolvedValue(expiredNonce)

      await expect(service.linkWallet({ userId, walletAddress, signature })).rejects.toThrow(BadRequestException)
    })

    it("should throw ConflictException when wallet already linked", async () => {
      const walletNonce = {
        nonce,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        isUsed: false,
      }
      const existingLink = { id: "existing-link" }

      mockWalletNonceRepository.findOne.mockResolvedValue(walletNonce)
      mockIdentityLinkRepository.findOne.mockResolvedValue(existingLink)
      jest.spyOn(cryptoService, "verifySignature").mockReturnValue(true)

      await expect(service.linkWallet({ userId, walletAddress, signature })).rejects.toThrow(ConflictException)
    })
  })

  describe("getLinkedIdentities", () => {
    it("should return filtered identities", async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: "link-1",
            userId: "user-1",
            walletAddress: "0x123",
            linkedAt: new Date(),
            isActive: true,
          },
        ]),
      }

      mockIdentityLinkRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      const result = await service.getLinkedIdentities({ userId: "user-1" })

      expect(result).toHaveLength(1)
      expect(result[0].userId).toBe("user-1")
    })
  })

  describe("unlinkWallet", () => {
    const userId = "user-1"
    const walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4"

    it("should successfully unlink wallet", async () => {
      const identityLink = {
        id: "link-1",
        userId,
        walletAddress: walletAddress.toLowerCase(),
        isActive: true,
      }

      mockIdentityLinkRepository.findOne.mockResolvedValue(identityLink)
      mockIdentityLinkRepository.save.mockResolvedValue({})

      const result = await service.unlinkWallet(userId, walletAddress)

      expect(result).toBe(true)
      expect(identityLink.isActive).toBe(false)
    })

    it("should throw NotFoundException when link not found", async () => {
      mockIdentityLinkRepository.findOne.mockResolvedValue(null)

      await expect(service.unlinkWallet(userId, walletAddress)).rejects.toThrow(NotFoundException)
    })
  })

  describe("isWalletLinkedToUser", () => {
    it("should return true when wallet is linked", async () => {
      mockIdentityLinkRepository.count.mockResolvedValue(1)

      const result = await service.isWalletLinkedToUser("user-1", "0x123")

      expect(result).toBe(true)
    })

    it("should return false when wallet is not linked", async () => {
      mockIdentityLinkRepository.count.mockResolvedValue(0)

      const result = await service.isWalletLinkedToUser("user-1", "0x123")

      expect(result).toBe(false)
    })
  })

  describe("getUserByWallet", () => {
    it("should return user ID when wallet is linked", async () => {
      const identityLink = { userId: "user-1" }
      mockIdentityLinkRepository.findOne.mockResolvedValue(identityLink)

      const result = await service.getUserByWallet("0x123")

      expect(result).toBe("user-1")
    })

    it("should return null when wallet is not linked", async () => {
      mockIdentityLinkRepository.findOne.mockResolvedValue(null)

      const result = await service.getUserByWallet("0x123")

      expect(result).toBeNull()
    })
  })
})
