import { Test, type TestingModule } from "@nestjs/testing"
import { FreightQuotationController } from "./freight-quotation.controller"
import { FreightQuotationService } from "../services/freight-quotation.service"
import type { CreateQuoteRequestDto } from "../dto/create-quote-request.dto"
import type { UpdateQuoteDto } from "../dto/update-quote.dto"
import { CargoType, QuoteStatus } from "../entities/freight-quote.entity"
import { jest } from "@jest/globals"

describe("FreightQuotationController", () => {
  let controller: FreightQuotationController
  let service: FreightQuotationService

  const mockService = {
    createQuote: jest.fn(),
    findQuotes: jest.fn(),
    findQuoteById: jest.fn(),
    updateQuote: jest.fn(),
    approveQuote: jest.fn(),
    rejectQuote: jest.fn(),
    expireOldQuotes: jest.fn(),
    getQuotesByRequester: jest.fn(),
    getQuoteStatistics: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FreightQuotationController],
      providers: [
        {
          provide: FreightQuotationService,
          useValue: mockService,
        },
      ],
    }).compile()

    controller = module.get<FreightQuotationController>(FreightQuotationController)
    service = module.get<FreightQuotationService>(FreightQuotationService)

    jest.clearAllMocks()
  })

  describe("createQuote", () => {
    const createQuoteDto: CreateQuoteRequestDto = {
      requesterId: "user-123",
      cargoType: CargoType.GENERAL,
      weight: 100,
      origin: "New York",
      destination: "Los Angeles",
    }

    const mockCreatedQuote = {
      id: "quote-123",
      ...createQuoteDto,
      price: 625,
      status: QuoteStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it("should create a quote", async () => {
      mockService.createQuote.mockResolvedValue(mockCreatedQuote)

      const result = await controller.createQuote(createQuoteDto)

      expect(service.createQuote).toHaveBeenCalledWith(createQuoteDto)
      expect(result).toEqual(mockCreatedQuote)
    })
  })

  describe("findQuotes", () => {
    const mockPaginatedResult = {
      data: [
        {
          id: "quote-1",
          requesterId: "user-123",
          cargoType: CargoType.GENERAL,
          status: QuoteStatus.PENDING,
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    }

    it("should find quotes with filters and pagination", async () => {
      mockService.findQuotes.mockResolvedValue(mockPaginatedResult)

      const result = await controller.findQuotes(
        "user-123",
        QuoteStatus.PENDING,
        undefined,
        undefined,
        undefined,
        1,
        10,
      )

      expect(service.findQuotes).toHaveBeenCalledWith(
        {
          requesterId: "user-123",
          status: QuoteStatus.PENDING,
          cargoType: undefined,
          fromDate: undefined,
          toDate: undefined,
        },
        { page: 1, limit: 10 },
      )
      expect(result).toEqual(mockPaginatedResult)
    })

    it("should handle date filters", async () => {
      const fromDate = "2024-01-01T00:00:00.000Z"
      const toDate = "2024-12-31T23:59:59.999Z"

      await controller.findQuotes(undefined, undefined, undefined, fromDate, toDate)

      expect(service.findQuotes).toHaveBeenCalledWith(
        {
          requesterId: undefined,
          status: undefined,
          cargoType: undefined,
          fromDate: new Date(fromDate),
          toDate: new Date(toDate),
        },
        { page: 1, limit: 10 },
      )
    })
  })

  describe("findQuoteById", () => {
    const quoteId = "quote-123"
    const mockQuote = {
      id: quoteId,
      requesterId: "user-123",
      cargoType: CargoType.GENERAL,
      status: QuoteStatus.PENDING,
    }

    it("should find quote by id", async () => {
      mockService.findQuoteById.mockResolvedValue(mockQuote)

      const result = await controller.findQuoteById(quoteId)

      expect(service.findQuoteById).toHaveBeenCalledWith(quoteId)
      expect(result).toEqual(mockQuote)
    })
  })

  describe("updateQuote", () => {
    const quoteId = "quote-123"
    const updateDto: UpdateQuoteDto = {
      price: 700,
      status: QuoteStatus.APPROVED,
    }
    const mockUpdatedQuote = {
      id: quoteId,
      ...updateDto,
    }

    it("should update quote", async () => {
      mockService.updateQuote.mockResolvedValue(mockUpdatedQuote)

      const result = await controller.updateQuote(quoteId, updateDto)

      expect(service.updateQuote).toHaveBeenCalledWith(quoteId, updateDto)
      expect(result).toEqual(mockUpdatedQuote)
    })
  })

  describe("approveQuote", () => {
    const quoteId = "quote-123"
    const approverNotes = "Approved by manager"
    const mockApprovedQuote = {
      id: quoteId,
      status: QuoteStatus.APPROVED,
      notes: `Approver Notes: ${approverNotes}`,
    }

    it("should approve quote", async () => {
      mockService.approveQuote.mockResolvedValue(mockApprovedQuote)

      const result = await controller.approveQuote(quoteId, approverNotes)

      expect(service.approveQuote).toHaveBeenCalledWith(quoteId, approverNotes)
      expect(result).toEqual(mockApprovedQuote)
    })

    it("should approve quote without notes", async () => {
      const mockApprovedQuoteNoNotes = {
        id: quoteId,
        status: QuoteStatus.APPROVED,
      }
      mockService.approveQuote.mockResolvedValue(mockApprovedQuoteNoNotes)

      const result = await controller.approveQuote(quoteId)

      expect(service.approveQuote).toHaveBeenCalledWith(quoteId, undefined)
      expect(result).toEqual(mockApprovedQuoteNoNotes)
    })
  })

  describe("rejectQuote", () => {
    const quoteId = "quote-123"
    const rejectionReason = "Insufficient documentation"
    const mockRejectedQuote = {
      id: quoteId,
      status: QuoteStatus.REJECTED,
      notes: `Rejection Reason: ${rejectionReason}`,
    }

    it("should reject quote", async () => {
      mockService.rejectQuote.mockResolvedValue(mockRejectedQuote)

      const result = await controller.rejectQuote(quoteId, rejectionReason)

      expect(service.rejectQuote).toHaveBeenCalledWith(quoteId, rejectionReason)
      expect(result).toEqual(mockRejectedQuote)
    })
  })

  describe("expireOldQuotes", () => {
    it("should expire old quotes", async () => {
      mockService.expireOldQuotes.mockResolvedValue(5)

      const result = await controller.expireOldQuotes()

      expect(service.expireOldQuotes).toHaveBeenCalled()
      expect(result).toEqual({ expiredCount: 5 })
    })
  })

  describe("getQuotesByRequester", () => {
    const requesterId = "user-123"
    const mockResult = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    }

    it("should get quotes by requester", async () => {
      mockService.getQuotesByRequester.mockResolvedValue(mockResult)

      const result = await controller.getQuotesByRequester(requesterId, 1, 10)

      expect(service.getQuotesByRequester).toHaveBeenCalledWith(requesterId, { page: 1, limit: 10 })
      expect(result).toEqual(mockResult)
    })
  })

  describe("getStatistics", () => {
    const mockStats = {
      total: 100,
      pending: 20,
      approved: 60,
      rejected: 15,
      expired: 5,
      approvalRate: "60.00",
    }

    it("should get statistics", async () => {
      mockService.getQuoteStatistics.mockResolvedValue(mockStats)

      const result = await controller.getStatistics()

      expect(service.getQuoteStatistics).toHaveBeenCalledWith(undefined)
      expect(result).toEqual(mockStats)
    })

    it("should get statistics for specific requester", async () => {
      const requesterId = "user-123"
      mockService.getQuoteStatistics.mockResolvedValue(mockStats)

      const result = await controller.getStatistics(requesterId)

      expect(service.getQuoteStatistics).toHaveBeenCalledWith(requesterId)
      expect(result).toEqual(mockStats)
    })
  })
})
