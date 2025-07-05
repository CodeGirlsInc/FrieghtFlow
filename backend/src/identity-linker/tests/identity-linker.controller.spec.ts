import { Test, type TestingModule } from "@nestjs/testing"
import { IdentityLinkerController } from "../controllers/identity-linker.controller"
import { IdentityLinkerService } from "../services/identity-linker.service"
import { jest } from "@jest/globals"

describe("IdentityLinkerController", () => {
  let controller: IdentityLinkerController
  let service: IdentityLinkerService

  const mockIdentityLinkerService = {
    generateNonce: jest.fn(),
    linkWallet: jest.fn(),
    getLinkedIdentities: jest.fn(),
    unlinkWallet: jest.fn(),
    isWalletLinkedToUser: jest.fn(),
    getUserByWallet: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdentityLinkerController],
      providers: [
        {
          provide: IdentityLinkerService,
          useValue: mockIdentityLinkerService,
        },
      ],
    }).compile()

    controller = module.get<IdentityLinkerController>(IdentityLinkerController)
    service = module.get<IdentityLinkerService>(IdentityLinkerService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("generateNonce", () => {
    it("should generate nonce successfully", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4"
      const expectedResponse = {
        nonce: "test-nonce",
        message: "test-message",
        expiresAt: new Date(),
      }

      mockIdentityLinkerService.generateNonce.mockResolvedValue(expectedResponse)

      const result = await controller.generateNonce({ walletAddress })

      expect(result).toEqual(expectedResponse)
      expect(service.generateNonce).toHaveBeenCalledWith({ walletAddress })
    })
  })

  describe("linkWallet", () => {
    it("should link wallet successfully", async () => {
      const linkWalletDto = {
        userId: "user-1",
        walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4",
        signature: "0x123",
      }
      const expectedResponse = {
        success: true,
        linkId: "link-1",
        linkedAt: new Date(),
      }

      mockIdentityLinkerService.linkWallet.mockResolvedValue(expectedResponse)

      const result = await controller.linkWallet(linkWalletDto)

      expect(result).toEqual(expectedResponse)
      expect(service.linkWallet).toHaveBeenCalledWith(linkWalletDto)
    })
  })

  describe("getLinkedIdentities", () => {
    it("should get linked identities successfully", async () => {
      const filters = { userId: "user-1" }
      const expectedResponse = [
        {
          id: "link-1",
          userId: "user-1",
          walletAddress: "0x123",
          linkedAt: new Date(),
          isActive: true,
        },
      ]

      mockIdentityLinkerService.getLinkedIdentities.mockResolvedValue(expectedResponse)

      const result = await controller.getLinkedIdentities(filters)

      expect(result).toEqual(expectedResponse)
      expect(service.getLinkedIdentities).toHaveBeenCalledWith(filters)
    })
  })

  describe("unlinkWallet", () => {
    it("should unlink wallet successfully", async () => {
      const userId = "user-1"
      const walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4"

      mockIdentityLinkerService.unlinkWallet.mockResolvedValue(true)

      await controller.unlinkWallet(userId, walletAddress)

      expect(service.unlinkWallet).toHaveBeenCalledWith(userId, walletAddress)
    })
  })

  describe("checkWalletLink", () => {
    it("should check wallet link successfully", async () => {
      const userId = "user-1"
      const walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4"

      mockIdentityLinkerService.isWalletLinkedToUser.mockResolvedValue(true)

      const result = await controller.checkWalletLink(userId, walletAddress)

      expect(result).toEqual({ isLinked: true })
      expect(service.isWalletLinkedToUser).toHaveBeenCalledWith(userId, walletAddress)
    })
  })

  describe("getUserByWallet", () => {
    it("should get user by wallet successfully", async () => {
      const walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4"
      const userId = "user-1"

      mockIdentityLinkerService.getUserByWallet.mockResolvedValue(userId)

      const result = await controller.getUserByWallet(walletAddress)

      expect(result).toEqual({ userId })
      expect(service.getUserByWallet).toHaveBeenCalledWith(walletAddress)
    })
  })
})
