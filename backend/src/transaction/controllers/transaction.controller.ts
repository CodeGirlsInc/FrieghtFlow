import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common"
import type { TransactionService } from "../services/transaction.service"
import type { TransactionSearchService } from "../services/transaction-search.service"
import type { CreateTransactionDto } from "../dto/create-transaction.dto"
import type { SearchTransactionDto } from "../dto/search-transaction.dto"
import type { UpdateTransactionStatusDto } from "../dto/update-transaction-status.dto"
import { ApiKeyGuard } from "../../common/guards/api-key.guard"

@Controller("transactions")
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly transactionSearchService: TransactionSearchService,
  ) {}

  @Post()
  @UseGuards(ApiKeyGuard)
  async createTransaction(createTransactionDto: CreateTransactionDto) {
    try {
      return await this.transactionService.createTransaction(createTransactionDto)
    } catch (error) {
      if (error.code === "23505") {
        // Unique violation in PostgreSQL
        throw new BadRequestException("Transaction with this ID already exists")
      }
      throw error
    }
  }

  @Get(":id")
  async getTransactionById(@Param("id") id: string) {
    const transaction = await this.transactionService.findById(id)
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`)
    }
    return transaction
  }

  @Get("reference/:reference")
  async getTransactionByReference(@Param("reference") reference: string) {
    const transaction = await this.transactionService.findByReference(reference)
    if (!transaction) {
      throw new NotFoundException(`Transaction with reference ${reference} not found`)
    }
    return transaction
  }

  @Get("user/:userId")
  async getTransactionsByUserId(@Param("userId") userId: string, @Query() query: SearchTransactionDto) {
    query.userId = userId
    return this.transactionSearchService.searchTransactions(query)
  }

  @Get()
  async searchTransactions(@Query() query: SearchTransactionDto) {
    return this.transactionSearchService.searchTransactions(query)
  }

  @Patch(":id/status")
  @UseGuards(ApiKeyGuard)
  async updateTransactionStatus(@Param("id") id: string, @Body() updateStatusDto: UpdateTransactionStatusDto) {
    const transaction = await this.transactionService.updateTransactionStatus(id, updateStatusDto)
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`)
    }
    return transaction
  }

  @Get(":id/history")
  async getTransactionHistory(@Param("id") id: string) {
    const history = await this.transactionService.getTransactionHistory(id)
    if (!history || history.length === 0) {
      throw new NotFoundException(`History for transaction with ID ${id} not found`)
    }
    return history
  }
}
