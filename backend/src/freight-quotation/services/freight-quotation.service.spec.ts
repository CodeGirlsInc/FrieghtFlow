import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { BadRequestException, NotFoundException } from "@nestjs/common"
import { FreightQuotationService } from "./freight-quotation.service"
import { PricingService } from "./pricing.service"
import { FreightQuote, QuoteStatus, CargoType } from "../entities/freight-quote.entity"
import type { CreateQuoteRequestDto } from "../dto/create-quote-request.dto"
import { jest } from "@jest/globals"

describe("FreightQuotationService", () => {
  let service: FreightQuotationService
  let repository: Repository<FreightQuote>
  let pricingService: PricingService

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    update: jest.fn(),
  }

  const mockPricingService = {
    calculatePrice: jest.fn(),
  }

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getCount: jest.fn(),
    clone: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FreightQuotationService,
        {
          provide: getRepositoryToken(FreightQuote),
          useValue: mockRepository,
        },
        {
          provide: PricingService,
          useValue: mockPricingService,
        },
      ],
    }).compile()

    service = module.get<FreightQuotationService>(FreightQuotationService)
    repository = module.get<Repository<FreightQuote>>(getRepositoryToken(FreightQuote))
    pricingService = module.get<PricingService>(PricingService)

    // Reset all mocks
    jest.clearAllMocks()
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
  })

  describe("createQuote", () => {
    const createQuoteDto: CreateQuoteRequestDto = {
      requesterId: "user-123",
      cargoType: CargoType.GENERAL,
      weight: 100,
      origin: "New York",
      destination: "Los Angeles",
      notes: "Test shipment",
    }

    const mockPricingResult = {
      basePrice: 250,
      distanceCharge: 375,
      cargoTypeMultiplier: 1.0,
      totalPrice: 625,
      minimumCharge: 25,
      finalPrice: 625,
    }

    const mockSavedQuote = {
      id: "quote-123",
      ...createQuoteDto,
      distance: 2500,
      price: 625,
      status: QuoteStatus.PENDING,
      expiresAt: expect.any(Date),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    beforeEach(() => {
      mockPricingService.calculatePrice.mockResolvedValue(mockPricingResult)
      mockRepository.create.mockReturnValue(mockSavedQuote)
      mockRepository.save.mockResolvedValue(mockSavedQuote)
    })

    it("should create a quote successfully", async () => {
      const result = await service.createQuote(createQuoteDto)

      expect(mockPricingService.calculatePrice).toHaveBeenCalledWith({
        cargoType: createQuoteDto.cargoType,
        weight: createQuoteDto.weight,
        distance: expect.any(Number),
      })
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createQuoteDto,
        distance: expect.any(Number),
        price: mockPricingResult.finalPrice,
        expiresAt: expect.any(Date),
        status: QuoteStatus.PENDING,
      })
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result).toEqual(mockSavedQuote)
    })

    it("should set expiration date 30 days from now", async () => {
      const beforeCreate = new Date()
      await service.createQuote(createQuoteDto)
      const afterCreate = new Date()

      const createCall = mockRepository.create.mock.calls[0][0]
      const expiresAt = createCall.expiresAt

      expect(expiresAt).toBeInstanceOf(Date)
      expect(expiresAt.getTime()).toBeGreaterThan(beforeCreate.getTime() + 29 * 24 * 60 * 60 * 1000)
      expect(expiresAt.getTime()).toBeLessThan(afterCreate.getTime() + 31 * 24 * 60 * 60 * 1000)
    })
  })

  describe("findQuoteById", () => {
    const quoteId = "quote-123"
    const mockQuote = {
      id: quoteId,
      requesterId: "user-123",
      cargoType: CargoType.GENERAL,
      weight: 100,
      origin: "New York",
      destination: "Los Angeles",
      price: 625,
      status: QuoteStatus.PENDING,
    }

    it("should return a quote when found", async () => {
      mockRepository.findOne.mockResolvedValue(mockQuote)

      const result = await service.findQuoteById(quoteId)

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: quoteId } })
      expect(result).toEqual(mockQuote)
    })

    it("should throw NotFoundException when quote not found", async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.findQuoteById(quoteId)).rejects.toThrow(NotFoundException)
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: quoteId } })
    })
  })

  describe("approveQuote", () => {
    const quoteId = "quote-123"
    const mockPendingQuote = {
      id: quoteId,
      status: QuoteStatus.PENDING,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      notes: "Original notes",
    }

    beforeEach(() => {
      jest.spyOn(service, "findQuoteById").mockResolvedValue(mockPendingQuote as any)
    })

    it("should approve a pending quote", async () => {
      const approverNotes = "Approved by manager"
      const expectedUpdatedQuote = {
        ...mockPendingQuote,
        status: QuoteStatus.APPROVED,
        notes: `${mockPendingQuote.notes}\n\nApprover Notes: ${approverNotes}`,
      }

      mockRepository.save.mockResolvedValue(expectedUpdatedQuote)

      const result = await service.approveQuote(quoteId, approverNotes)

      expect(result.status).toBe(QuoteStatus.APPROVED)
      expect(result.notes).toContain(approverNotes)
      expect(mockRepository.save).toHaveBeenCalled()
    })

    it("should throw BadRequestException for non-pending quote", async () => {
      const approvedQuote = { ...mockPendingQuote, status: QuoteStatus.APPROVED }
      jest.spyOn(service, "findQuoteById").mockResolvedValue(approvedQuote as any)

      await expect(service.approveQuote(quoteId)).rejects.toThrow(BadRequestException)
    })

    it("should throw BadRequestException for expired quote", async () => {
      const expiredQuote = {
        ...mockPendingQuote,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      }
      jest.spyOn(service, "findQuoteById").mockResolvedValue(expiredQuote as any)

      await expect(service.approveQuote(quoteId)).rejects.toThrow(BadRequestException)
    })
  })

  describe("expireOldQuotes", () => {
    it("should expire old pending quotes", async () => {
      const mockResult = { affected: 5 }
      mockQueryBuilder.execute.mockResolvedValue(mockResult)

      const result = await service.expireOldQuotes()

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled()
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(FreightQuote)
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({ status: QuoteStatus.EXPIRED })
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("status = :status", { status: QuoteStatus.PENDING })
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("expiresAt < :now", { now: expect.any(Date) })
      expect(result).toBe(5)
    })

    it("should return 0 when no quotes are expired", async () => {
      const mockResult = { affected: 0 }
      mockQueryBuilder.execute.mockResolvedValue(mockResult)

      const result = await service.expireOldQuotes()

      expect(result).toBe(0)
    })
  })

  describe("getQuoteStatistics", () => {
    beforeEach(() => {
      mockQueryBuilder.getCount
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(20) // pending
        .mockResolvedValueOnce(60) // approved
        .mockResolvedValueOnce(15) // rejected
        .mockResolvedValueOnce(5) // expired
    })

    it("should return statistics for all quotes", async () => {
      const result = await service.getQuoteStatistics()

      expect(result).toEqual({
        total: 100,
        pending: 20,
        approved: 60,
        rejected: 15,
        expired: 5,
        approvalRate: "60.00",
      })
    })

    it("should return statistics for specific requester", async () => {
      const requesterId = "user-123"

      const result = await service.getQuoteStatistics(requesterId)

      expect(mockQueryBuilder.where).toHaveBeenCalledWith("quote.requesterId = :requesterId", { requesterId })
      expect(result).toEqual({
        total: 100,
        pending: 20,
        approved: 60,
        rejected: 15,
        expired: 5,
        approvalRate: "60.00",
      })
    })

    it("should handle zero total quotes", async () => {
      mockQueryBuilder.getCount
        .mockResolvedValueOnce(0) // total
        .mockResolvedValueOnce(0) // pending
        .mockResolvedValueOnce(0) // approved
        .mockResolvedValueOnce(0) // rejected
        .mockResolvedValueOnce(0) // expired

      const result = await service.getQuoteStatistics()

      expect(result.approvalRate).toBe("0.00")
    })
  })
})
