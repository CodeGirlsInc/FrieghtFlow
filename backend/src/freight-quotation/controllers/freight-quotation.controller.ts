import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  Query,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from "@nestjs/swagger"
import type { FreightQuotationService } from "../services/freight-quotation.service"
import type { CreateQuoteRequestDto } from "../dto/create-quote-request.dto"
import type { UpdateQuoteDto } from "../dto/update-quote.dto"
import { QuoteResponseDto } from "../dto/quote-response.dto"
import { QuoteStatus } from "../entities/freight-quote.entity"

@ApiTags("Freight Quotations")
@Controller("freight-quotes")
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class FreightQuotationController {
  constructor(private readonly freightQuotationService: FreightQuotationService) {}

  @Post()
  @ApiOperation({ summary: "Create a new freight quote request" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Quote created successfully",
    type: QuoteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data",
  })
  async createQuote(createQuoteDto: CreateQuoteRequestDto) {
    return this.freightQuotationService.createQuote(createQuoteDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all freight quotes with optional filtering" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Quotes retrieved successfully",
  })
  @ApiQuery({ name: "requesterId", required: false, description: "Filter by requester ID" })
  @ApiQuery({ name: "status", required: false, enum: QuoteStatus, description: "Filter by status" })
  @ApiQuery({ name: "cargoType", required: false, description: "Filter by cargo type" })
  @ApiQuery({ name: "fromDate", required: false, description: "Filter from date (ISO string)" })
  @ApiQuery({ name: "toDate", required: false, description: "Filter to date (ISO string)" })
  @ApiQuery({ name: "page", required: false, description: "Page number (default: 1)" })
  @ApiQuery({ name: "limit", required: false, description: "Items per page (default: 10)" })
  async findQuotes(
    @Query("requesterId") requesterId?: string,
    @Query("status") status?: QuoteStatus,
    @Query("cargoType") cargoType?: string,
    @Query("fromDate") fromDate?: string,
    @Query("toDate") toDate?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    const filters = {
      requesterId,
      status,
      cargoType,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    }

    const pagination = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    }

    return this.freightQuotationService.findQuotes(filters, pagination)
  }

  @Get("statistics")
  @ApiOperation({ summary: "Get quote statistics" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Statistics retrieved successfully",
  })
  @ApiQuery({ name: "requesterId", required: false, description: "Get statistics for specific requester" })
  async getStatistics(@Query("requesterId") requesterId?: string) {
    return this.freightQuotationService.getQuoteStatistics(requesterId)
  }

  @Get("requester/:requesterId")
  @ApiOperation({ summary: "Get quotes by requester ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Quotes retrieved successfully",
  })
  @ApiParam({ name: "requesterId", description: "Requester ID" })
  @ApiQuery({ name: "page", required: false, description: "Page number (default: 1)" })
  @ApiQuery({ name: "limit", required: false, description: "Items per page (default: 10)" })
  async getQuotesByRequester(
    @Param("requesterId") requesterId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    const pagination = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    }

    return this.freightQuotationService.getQuotesByRequester(requesterId, pagination)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a freight quote by ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Quote retrieved successfully",
    type: QuoteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Quote not found",
  })
  @ApiParam({ name: "id", description: "Quote ID" })
  async findQuoteById(@Param("id", ParseUUIDPipe) id: string) {
    return this.freightQuotationService.findQuoteById(id)
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a freight quote" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Quote updated successfully",
    type: QuoteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Quote not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid update data or status transition",
  })
  @ApiParam({ name: "id", description: "Quote ID" })
  async updateQuote(@Param("id", ParseUUIDPipe) id: string, updateQuoteDto: UpdateQuoteDto) {
    return this.freightQuotationService.updateQuote(id, updateQuoteDto)
  }

  @Patch(":id/approve")
  @ApiOperation({ summary: "Approve a freight quote" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Quote approved successfully",
    type: QuoteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Quote not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Quote cannot be approved (wrong status or expired)",
  })
  @ApiParam({ name: "id", description: "Quote ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        notes: { type: "string", description: "Approver notes" },
      },
    },
    required: false,
  })
  async approveQuote(@Param("id", ParseUUIDPipe) id: string, @Body("notes") notes?: string) {
    return this.freightQuotationService.approveQuote(id, notes)
  }

  @Patch(":id/reject")
  @ApiOperation({ summary: "Reject a freight quote" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Quote rejected successfully",
    type: QuoteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Quote not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Quote cannot be rejected (wrong status)",
  })
  @ApiParam({ name: "id", description: "Quote ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        reason: { type: "string", description: "Rejection reason" },
      },
    },
    required: false,
  })
  async rejectQuote(@Param("id", ParseUUIDPipe) id: string, @Body("reason") reason?: string) {
    return this.freightQuotationService.rejectQuote(id, reason)
  }

  @Patch("expire-old")
  @ApiOperation({ summary: "Expire old pending quotes" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Old quotes expired successfully",
    schema: {
      type: "object",
      properties: {
        expiredCount: { type: "number" },
      },
    },
  })
  async expireOldQuotes() {
    const expiredCount = await this.freightQuotationService.expireOldQuotes()
    return { expiredCount }
  }
}
