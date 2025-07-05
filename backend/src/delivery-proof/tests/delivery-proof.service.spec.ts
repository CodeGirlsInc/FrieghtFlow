import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { DeliveryProofService } from "../services/delivery-proof.service"
import { DeliveryProof, ProofType, ProofStatus } from "../entities/delivery-proof.entity"
import type { CreateDeliveryProofDto } from "../dto/create-delivery-proof.dto"
import {
  DeliveryProofNotFoundException,
  DuplicateDeliveryProofException,
  InvalidProofDataException,
  ProofExpiredException,
} from "../exceptions/delivery-proof.exceptions"
import { jest } from "@jest/globals"

describe("DeliveryProofService", () => {
  let service: DeliveryProofService
  let repository: Repository<DeliveryProof>
  let eventEmitter: EventEmitter2

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockEventEmitter = {
    emit: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryProofService,
        {
          provide: getRepositoryToken(DeliveryProof),
          useValue: mockRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile()

    service = module.get<DeliveryProofService>(DeliveryProofService)
    repository = module.get<Repository<DeliveryProof>>(getRepositoryToken(DeliveryProof))
    eventEmitter = module.get<EventEmitter2>(EventEmitter2)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("create", () => {
    const createDto: CreateDeliveryProofDto = {
      deliveryId: "delivery-123",
      proofType: ProofType.SIGNATURE,
      signature: "test-signature",
      recipientName: "John Doe",
      recipientEmail: "john@example.com",
    }

    it("should create a delivery proof successfully", async () => {
      const mockProof = {
        id: "proof-123",
        ...createDto,
        status: ProofStatus.PENDING,
        createdAt: new Date(),
      }

      mockRepository.findOne.mockResolvedValue(null) // No duplicate
      mockRepository.create.mockReturnValue(mockProof)
      mockRepository.save.mockResolvedValue(mockProof)

      const result = await service.create(createDto)

      expect(result).toEqual(mockProof)
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        status: ProofStatus.PENDING,
        verificationAttempts: 0,
      })
      expect(mockRepository.save).toHaveBeenCalledWith(mockProof)
      expect(mockEventEmitter.emit).toHaveBeenCalledWith("delivery-proof.created", expect.any(Object))
    })

    it("should throw DuplicateDeliveryProofException when duplicate exists", async () => {
      const existingProof = {
        id: "existing-proof",
        deliveryId: createDto.deliveryId,
        proofType: createDto.proofType,
        status: ProofStatus.VERIFIED,
      }

      mockRepository.findOne.mockResolvedValue(existingProof)

      await expect(service.create(createDto)).rejects.toThrow(DuplicateDeliveryProofException)
    })

    it("should throw InvalidProofDataException for signature type without signature", async () => {
      const invalidDto = {
        ...createDto,
        signature: undefined,
      }

      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.create(invalidDto)).rejects.toThrow(InvalidProofDataException)
    })

    it("should throw InvalidProofDataException for photo type without photoUrl", async () => {
      const invalidDto: CreateDeliveryProofDto = {
        deliveryId: "delivery-123",
        proofType: ProofType.PHOTO,
        photoUrl: undefined,
      }

      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.create(invalidDto)).rejects.toThrow(InvalidProofDataException)
    })

    it("should throw InvalidProofDataException for token type without token", async () => {
      const invalidDto: CreateDeliveryProofDto = {
        deliveryId: "delivery-123",
        proofType: ProofType.TOKEN,
        token: undefined,
      }

      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.create(invalidDto)).rejects.toThrow(InvalidProofDataException)
    })

    it("should throw InvalidProofDataException for QR type without qrData", async () => {
      const invalidDto: CreateDeliveryProofDto = {
        deliveryId: "delivery-123",
        proofType: ProofType.QR_CODE,
        qrData: undefined,
      }

      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.create(invalidDto)).rejects.toThrow(InvalidProofDataException)
    })
  })

  describe("findOne", () => {
    it("should return a delivery proof when found", async () => {
      const mockProof = {
        id: "proof-123",
        deliveryId: "delivery-123",
        status: ProofStatus.PENDING,
        expiresAt: null,
      }

      mockRepository.findOne.mockResolvedValue(mockProof)

      const result = await service.findOne("proof-123")

      expect(result).toEqual(mockProof)
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: "proof-123" },
      })
    })

    it("should throw DeliveryProofNotFoundException when not found", async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne("non-existent")).rejects.toThrow(DeliveryProofNotFoundException)
    })

    it("should throw ProofExpiredException when proof has expired", async () => {
      const expiredProof = {
        id: "proof-123",
        deliveryId: "delivery-123",
        status: ProofStatus.PENDING,
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      }

      mockRepository.findOne.mockResolvedValue(expiredProof)

      await expect(service.findOne("proof-123")).rejects.toThrow(ProofExpiredException)
    })
  })

  describe("verifyProof", () => {
    it("should verify a pending proof successfully", async () => {
      const mockProof = {
        id: "proof-123",
        deliveryId: "delivery-123",
        status: ProofStatus.PENDING,
        verificationAttempts: 0,
        expiresAt: null,
      }

      const verifiedProof = {
        ...mockProof,
        status: ProofStatus.VERIFIED,
        verificationAttempts: 1,
      }

      mockRepository.findOne.mockResolvedValue(mockProof)
      mockRepository.save.mockResolvedValue(verifiedProof)

      const result = await service.verifyProof("proof-123")

      expect(result.status).toBe(ProofStatus.VERIFIED)
      expect(result.verificationAttempts).toBe(1)
      expect(mockEventEmitter.emit).toHaveBeenCalledWith("delivery-proof.verified", expect.any(Object))
      expect(mockEventEmitter.emit).toHaveBeenCalledWith("blockchain.update-requested", expect.any(Object))
    })

    it("should throw InvalidProofDataException when proof is not pending", async () => {
      const mockProof = {
        id: "proof-123",
        deliveryId: "delivery-123",
        status: ProofStatus.VERIFIED,
        expiresAt: null,
      }

      mockRepository.findOne.mockResolvedValue(mockProof)

      await expect(service.verifyProof("proof-123")).rejects.toThrow(InvalidProofDataException)
    })
  })

  describe("markAsFailed", () => {
    it("should mark proof as failed successfully", async () => {
      const mockProof = {
        id: "proof-123",
        deliveryId: "delivery-123",
        status: ProofStatus.PENDING,
        verificationAttempts: 0,
        expiresAt: null,
      }

      const failedProof = {
        ...mockProof,
        status: ProofStatus.FAILED,
        lastError: "Test error",
        verificationAttempts: 1,
      }

      mockRepository.findOne.mockResolvedValue(mockProof)
      mockRepository.save.mockResolvedValue(failedProof)

      const result = await service.markAsFailed("proof-123", "Test error")

      expect(result.status).toBe(ProofStatus.FAILED)
      expect(result.lastError).toBe("Test error")
      expect(result.verificationAttempts).toBe(1)
      expect(mockEventEmitter.emit).toHaveBeenCalledWith("delivery-proof.failed", expect.any(Object))
    })
  })

  describe("updateBlockchainInfo", () => {
    it("should update blockchain info successfully", async () => {
      const mockProof = {
        id: "proof-123",
        deliveryId: "delivery-123",
        status: ProofStatus.VERIFIED,
        expiresAt: null,
      }

      const updatedProof = {
        ...mockProof,
        blockchainTxHash: "0x123",
        blockchainBlockNumber: "12345",
        status: ProofStatus.BLOCKCHAIN_CONFIRMED,
      }

      mockRepository.findOne.mockResolvedValue(mockProof)
      mockRepository.save.mockResolvedValue(updatedProof)

      const result = await service.updateBlockchainInfo("proof-123", "0x123", "12345")

      expect(result.blockchainTxHash).toBe("0x123")
      expect(result.blockchainBlockNumber).toBe("12345")
      expect(result.status).toBe(ProofStatus.BLOCKCHAIN_CONFIRMED)
    })
  })

  describe("findAll", () => {
    it("should return paginated results", async () => {
      const mockProofs = [
        { id: "proof-1", deliveryId: "delivery-1" },
        { id: "proof-2", deliveryId: "delivery-2" },
      ]

      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockProofs, 2]),
      }

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      const result = await service.findAll({
        limit: 10,
        offset: 0,
        sortBy: "createdAt",
        sortOrder: "DESC",
      })

      expect(result.data).toEqual(mockProofs)
      expect(result.total).toBe(2)
    })
  })

  describe("getStatistics", () => {
    it("should return proof statistics", async () => {
      const mockStats = {
        total: "10",
        pending: "3",
        verified: "5",
        failed: "1",
        blockchainConfirmed: "1",
      }

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockStats),
      }

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      const result = await service.getStatistics()

      expect(result).toEqual({
        total: 10,
        pending: 3,
        verified: 5,
        failed: 1,
        blockchainConfirmed: 1,
      })
    })
  })
})
