import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common"
import type { Repository, FindOptionsWhere } from "typeorm"
import { FreightQuote, QuoteStatus } from "../entities/freight-quote.entity"
import type { PricingService } from "./pricing.service"
import type { CreateQuoteRequestDto } from "../dto/create-quote-request.dto"
import type { UpdateQuoteDto } from "../dto/update-quote.dto"

export interface QuoteFilters {
  requesterId?: string
  status?: QuoteStatus
  cargoType?: string
  fromDate?: Date
  toDate?: Date
}

export interface PaginationOptions {
  page?: number
  limit?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

@Injectable()
export class FreightQuotationService {
  private readonly logger = new Logger(FreightQuotationService.name)

  constructor(
    private readonly freightQuoteRepository: Repository<FreightQuote>,
    private readonly pricingService: PricingService,
  ) {}

  async createQuote(createQuoteDto: CreateQuoteRequestDto): Promise<FreightQuote> {
    this.logger.log(`Creating new quote for requester: ${createQuoteDto.requesterId}`)

    // Calculate distance (in a real app, you'd use a geocoding service)
    const estimatedDistance = await this.calculateDistance(createQuoteDto.origin, createQuoteDto.destination)

    // Calculate pricing
    const pricingResult = await this.pricingService.calculatePrice({
      cargoType: createQuoteDto.cargoType,
      weight: createQuoteDto.weight,
      distance: estimatedDistance,
    })

    // Set expiration date (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const quote = this.freightQuoteRepository.create({
      ...createQuoteDto,
      distance: estimatedDistance,
      price: pricingResult.finalPrice,
      expiresAt,
      status: QuoteStatus.PENDING,
    })

    const savedQuote = await this.freightQuoteRepository.save(quote)
    this.logger.log(`Quote created with ID: ${savedQuote.id}`)

    return savedQuote
  }

  async findQuoteById(id: string): Promise<FreightQuote> {
    const quote = await this.freightQuoteRepository.findOne({ where: { id } })
    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`)
    }
    return quote
  }

  async findQuotes(
    filters: QuoteFilters = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginatedResult<FreightQuote>> {
    const { page = 1, limit = 10 } = pagination
    const skip = (page - 1) * limit

    const where: FindOptionsWhere<FreightQuote> = {}

    if (filters.requesterId) {
      where.requesterId = filters.requesterId
    }
    if (filters.status) {
      where.status = filters.status
    }
    if (filters.cargoType) {
      where.cargoType = filters.cargoType as any
    }

    const queryBuilder = this.freightQuoteRepository.createQueryBuilder("quote").where(where)

    if (filters.fromDate) {
      queryBuilder.andWhere("quote.createdAt >= :fromDate", { fromDate: filters.fromDate })
    }
    if (filters.toDate) {
      queryBuilder.andWhere("quote.createdAt <= :toDate", { toDate: filters.toDate })
    }

    const [data, total] = await queryBuilder.orderBy("quote.createdAt", "DESC").skip(skip).take(limit).getManyAndCount()

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async updateQuote(id: string, updateQuoteDto: UpdateQuoteDto): Promise<FreightQuote> {
    const quote = await this.findQuoteById(id)

    // Validate status transitions
    if (updateQuoteDto.status && !this.isValidStatusTransition(quote.status, updateQuoteDto.status)) {
      throw new BadRequestException(`Invalid status transition from ${quote.status} to ${updateQuoteDto.status}`)
    }

    // If updating price manually, recalculate if distance is also provided
    if (updateQuoteDto.distance && !updateQuoteDto.price) {
      const pricingResult = await this.pricingService.calculatePrice({
        cargoType: quote.cargoType,
        weight: quote.weight,
        distance: updateQuoteDto.distance,
      })
      updateQuoteDto.price = pricingResult.finalPrice
    }

    Object.assign(quote, updateQuoteDto)
    const updatedQuote = await this.freightQuoteRepository.save(quote)

    this.logger.log(`Quote ${id} updated successfully`)
    return updatedQuote
  }

  async approveQuote(id: string, approverNotes?: string): Promise<FreightQuote> {
    const quote = await this.findQuoteById(id)

    if (quote.status !== QuoteStatus.PENDING) {
      throw new BadRequestException(`Cannot approve quote with status: ${quote.status}`)
    }

    if (this.isQuoteExpired(quote)) {
      throw new BadRequestException("Cannot approve an expired quote")
    }

    quote.status = QuoteStatus.APPROVED
    if (approverNotes) {
      quote.notes = quote.notes
        ? `${quote.notes}\n\nApprover Notes: ${approverNotes}`
        : `Approver Notes: ${approverNotes}`
    }

    const approvedQuote = await this.freightQuoteRepository.save(quote)
    this.logger.log(`Quote ${id} approved`)

    return approvedQuote
  }

  async rejectQuote(id: string, rejectionReason?: string): Promise<FreightQuote> {
    const quote = await this.findQuoteById(id)

    if (quote.status !== QuoteStatus.PENDING) {
      throw new BadRequestException(`Cannot reject quote with status: ${quote.status}`)
    }

    quote.status = QuoteStatus.REJECTED
    if (rejectionReason) {
      quote.notes = quote.notes
        ? `${quote.notes}\n\nRejection Reason: ${rejectionReason}`
        : `Rejection Reason: ${rejectionReason}`
    }

    const rejectedQuote = await this.freightQuoteRepository.save(quote)
    this.logger.log(`Quote ${id} rejected`)

    return rejectedQuote
  }

  async expireOldQuotes(): Promise<number> {
    const result = await this.freightQuoteRepository
      .createQueryBuilder()
      .update(FreightQuote)
      .set({ status: QuoteStatus.EXPIRED })
      .where("status = :status", { status: QuoteStatus.PENDING })
      .andWhere("expiresAt < :now", { now: new Date() })
      .execute()

    this.logger.log(`Expired ${result.affected} old quotes`)
    return result.affected || 0
  }

  async getQuotesByRequester(
    requesterId: string,
    pagination: PaginationOptions = {},
  ): Promise<PaginatedResult<FreightQuote>> {
    return this.findQuotes({ requesterId }, pagination)
  }

  async getQuoteStatistics(requesterId?: string): Promise<any> {
    const queryBuilder = this.freightQuoteRepository.createQueryBuilder("quote")

    if (requesterId) {
      queryBuilder.where("quote.requesterId = :requesterId", { requesterId })
    }

    const [total, pending, approved, rejected, expired] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere("quote.status = :status", { status: QuoteStatus.PENDING }).getCount(),
      queryBuilder.clone().andWhere("quote.status = :status", { status: QuoteStatus.APPROVED }).getCount(),
      queryBuilder.clone().andWhere("quote.status = :status", { status: QuoteStatus.REJECTED }).getCount(),
      queryBuilder.clone().andWhere("quote.status = :status", { status: QuoteStatus.EXPIRED }).getCount(),
    ])

    return {
      total,
      pending,
      approved,
      rejected,
      expired,
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(2) : "0.00",
    }
  }

  private isValidStatusTransition(currentStatus: QuoteStatus, newStatus: QuoteStatus): boolean {
    const validTransitions: Record<QuoteStatus, QuoteStatus[]> = {
      [QuoteStatus.PENDING]: [QuoteStatus.APPROVED, QuoteStatus.REJECTED, QuoteStatus.EXPIRED],
      [QuoteStatus.APPROVED]: [], // No transitions allowed from approved
      [QuoteStatus.REJECTED]: [], // No transitions allowed from rejected
      [QuoteStatus.EXPIRED]: [], // No transitions allowed from expired
    }

    return validTransitions[currentStatus].includes(newStatus)
  }

  private isQuoteExpired(quote: FreightQuote): boolean {
    return quote.expiresAt && quote.expiresAt < new Date()
  }

  private async calculateDistance(origin: string, destination: string): Promise<number> {
    // This is a simplified distance calculation
    // In a real application, you would integrate with a geocoding service like Google Maps API
    // For now, we'll return a random distance between 50-2000 km based on string similarity
    const originHash = this.simpleHash(origin.toLowerCase())
    const destinationHash = this.simpleHash(destination.toLowerCase())
    const difference = Math.abs(originHash - destinationHash)

    // Scale the difference to a reasonable distance range (50-2000 km)
    const distance = 50 + (difference % 1950)

    this.logger.log(`Calculated distance from ${origin} to ${destination}: ${distance}km`)
    return distance
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}
