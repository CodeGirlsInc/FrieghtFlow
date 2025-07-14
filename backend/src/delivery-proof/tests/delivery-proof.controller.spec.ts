import { Test, type TestingModule } from "@nestjs/testing"
import { DeliveryProofController } from "../controllers/delivery-proof.controller"
import { DeliveryProofService } from "../services/delivery-proof.service"
import type { CreateDeliveryProofDto } from "../dto/create-delivery-proof.dto"
import type { UpdateDeliveryProofDto } from "../dto/update-delivery-proof.dto"
import type { QueryDeliveryProofDto } from "../dto/query-delivery-proof.dto"
import { ProofType, ProofStatus } from "../entities/delivery-proof.entity"
import { jest } from "@jest/globals" // Import jest to declare it

describe("DeliveryProofController", () => {
  let controller: DeliveryProofController
  let service: DeliveryProofService

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByDeliveryId: jest.fn(),
    update: jest.fn(),
    verifyProof: jest.fn(),
    markAsFailed: jest.fn(),
    updateBlockchainInfo: jest.fn(),
    delete: jest.fn(),
    getStatistics: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryProofController],
      providers: [
        {
          provide: DeliveryProofService,
          useValue: mockService,
        },
      ],
    }).compile()

    controller = module.get<DeliveryProofController>(DeliveryProofController)
    service = module.get<DeliveryProofService>(DeliveryProofService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("create", () => {
    it("should create a delivery proof", async () => {
      const createDto: CreateDeliveryProofDto = {
        deliveryId: "delivery-123",
        proofType: ProofType.SIGNATURE,
        signature: "test-signature",
      }

      const mockProof = {
        id: "proof-123",
        ...createDto,
        status: ProofStatus.PENDING,
        createdAt: new Date(),
      }

      mockService.create.mockResolvedValue(mockProof)

      const result = await controller.create(createDto)

      expect(result).toEqual(mockProof)
      expect(service.create).toHaveBeenCalledWith(createDto)
    })
  })

  describe("findAll", () => {
    it("should return paginated delivery proofs", async () => {
      const queryDto: QueryDeliveryProofDto = {
        limit: 10,
        offset: 0,
        sortBy: "createdAt",
        sortOrder: "DESC",
      }

      const mockResult = {
        data: [
          { id: "proof-1", deliveryId: "delivery-1" },
          { id: "proof-2", deliveryId: "delivery-2" },
        ],
        total: 2,
      }

      mockService.findAll.mockResolvedValue(mockResult)

      const result = await controller.findAll(queryDto)

      expect(result).toEqual(mockResult)
      expect(service.findAll).toHaveBeenCalledWith(queryDto)
    })
  })

  describe("findOne", () => {
    it("should return a single delivery proof", async () => {
      const mockProof = {
        id: "proof-123",
        deliveryId: "delivery-123",
        status: ProofStatus.PENDING,
      }

      mockService.findOne.mockResolvedValue(mockProof)

      const result = await controller.findOne("proof-123")

      expect(result).toEqual(mockProof)
      expect(service.findOne).toHaveBeenCalledWith("proof-123")
    })
  })

  describe("findByDeliveryId", () => {
    it("should return proofs for a specific delivery", async () => {
      const mockProofs = [
        { id: "proof-1", deliveryId: "delivery-123" },
        { id: "proof-2", deliveryId: "delivery-123" },
      ]

      mockService.findByDeliveryId.mockResolvedValue(mockProofs)

      const result = await controller.findByDeliveryId("delivery-123")

      expect(result).toEqual(mockProofs)
      expect(service.findByDeliveryId).toHaveBeenCalledWith("delivery-123")
    })
  })

  describe("update", () => {
    it("should update a delivery proof", async () => {
      const updateDto: UpdateDeliveryProofDto = {
        status: ProofStatus.VERIFIED,
      }

      const mockUpdatedProof = {
        id: "proof-123",
        deliveryId: "delivery-123",
        status: ProofStatus.VERIFIED,
      }

      mockService.update.mockResolvedValue(mockUpdatedProof)

      const result = await controller.update("proof-123", updateDto)

      expect(result).toEqual(mockUpdatedProof)
      expect(service.update).toHaveBeenCalledWith("proof-123", updateDto)
    })
  })

  describe("verify", () => {
    it("should verify a delivery proof", async () => {
      const mockVerifiedProof = {
        id: "proof-123",
        deliveryId: "delivery-123",
        status: ProofStatus.VERIFIED,
      }

      mockService.verifyProof.mockResolvedValue(mockVerifiedProof)

      const result = await controller.verify("proof-123")

      expect(result).toEqual(mockVerifiedProof)
      expect(service.verifyProof).toHaveBeenCalledWith("proof-123")
    })
  })

  describe("markAsFailed", () => {
    it("should mark a delivery proof as failed", async () => {
      const mockFailedProof = {
        id: "proof-123",
        deliveryId: "delivery-123",
        status: ProofStatus.FAILED,
        lastError: "Test error",
      }

      mockService.markAsFailed.mockResolvedValue(mockFailedProof)

      const result = await controller.markAsFailed("proof-123", "Test error")

      expect(result).toEqual(mockFailedProof)
      expect(service.markAsFailed).toHaveBeenCalledWith("proof-123", "Test error")
    })
  })

  describe("updateBlockchainInfo", () => {
    it("should update blockchain information", async () => {
      const mockUpdatedProof = {
        id: "proof-123",
        deliveryId: "delivery-123",
        blockchainTxHash: "0x123",
        blockchainBlockNumber: "12345",
        status: ProofStatus.BLOCKCHAIN_CONFIRMED,
      }

      mockService.updateBlockchainInfo.mockResolvedValue(mockUpdatedProof)

      const result = await controller.updateBlockchainInfo("proof-123", "0x123", "12345")

      expect(result).toEqual(mockUpdatedProof)
      expect(service.updateBlockchainInfo).toHaveBeenCalledWith("proof-123", "0x123", "12345")
    })
  })

  describe("remove", () => {
    it("should delete a delivery proof", async () => {
      mockService.delete.mockResolvedValue(undefined)

      await controller.remove("proof-123")

      expect(service.delete).toHaveBeenCalledWith("proof-123")
    })
  })

  describe("getStatistics", () => {
    it("should return delivery proof statistics", async () => {
      const mockStats = {
        total: 10,
        pending: 3,
        verified: 5,
        failed: 1,
        blockchainConfirmed: 1,
      }

      mockService.getStatistics.mockResolvedValue(mockStats)

      const result = await controller.getStatistics()

      expect(result).toEqual(mockStats)
      expect(service.getStatistics).toHaveBeenCalled()
    })
  })
})
