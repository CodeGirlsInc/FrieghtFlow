import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Transaction } from "../entities/transaction.entity"
import type { SearchTransactionDto } from "../dto/search-transaction.dto"
import type { PaginatedTransactionsResponseDto } from "../dto/transaction-response.dto"

@Injectable()
export class TransactionSearchService {
  private readonly logger = new Logger(TransactionSearchService.name)

  constructor(private transactionRepository: Repository<Transaction>) {}

  async searchTransactions(searchDto: SearchTransactionDto): Promise<PaginatedTransactionsResponseDto> {
    try {
      const queryBuilder = this.transactionRepository.createQueryBuilder("transaction")

      // Apply filters
      if (searchDto.transactionId) {
        queryBuilder.andWhere("transaction.transactionId = :transactionId", {
          transactionId: searchDto.transactionId,
        })
      }

      if (searchDto.userId) {
        queryBuilder.andWhere("transaction.userId = :userId", {
          userId: searchDto.userId,
        })
      }

      if (searchDto.minAmount !== undefined) {
        queryBuilder.andWhere("transaction.amount >= :minAmount", {
          minAmount: searchDto.minAmount,
        })
      }

      if (searchDto.maxAmount !== undefined) {
        queryBuilder.andWhere("transaction.amount <= :maxAmount", {
          maxAmount: searchDto.maxAmount,
        })
      }

      if (searchDto.currency) {
        queryBuilder.andWhere("transaction.currency = :currency", {
          currency: searchDto.currency,
        })
      }

      if (searchDto.status && searchDto.status.length > 0) {
        queryBuilder.andWhere("transaction.status IN (:...status)", {
          status: searchDto.status,
        })
      }

      if (searchDto.gateway && searchDto.gateway.length > 0) {
        queryBuilder.andWhere("transaction.gateway IN (:...gateway)", {
          gateway: searchDto.gateway,
        })
      }

      if (searchDto.startDate) {
        queryBuilder.andWhere("transaction.createdAt >= :startDate", {
          startDate: new Date(searchDto.startDate),
        })
      }

      if (searchDto.endDate) {
        queryBuilder.andWhere("transaction.createdAt <= :endDate", {
          endDate: new Date(searchDto.endDate),
        })
      }

      // Apply sorting
      const sortBy = searchDto.sortBy || "createdAt"
      const sortOrder = searchDto.sortOrder || "DESC"
      queryBuilder.orderBy(`transaction.${sortBy}`, sortOrder)

      // Apply pagination
      const limit = searchDto.limit || 20
      const offset = searchDto.offset || 0
      queryBuilder.take(limit).skip(offset)

      // Execute the query
      const [transactions, total] = await queryBuilder.getManyAndCount()

      // Map to response DTOs
      const data = transactions.map((transaction) => ({
        id: transaction.id,
        transactionId: transaction.transactionId,
        userId: transaction.userId,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        status: transaction.status,
        gateway: transaction.gateway,
        gatewayTransactionId: transaction.gatewayTransactionId,
        metadata: transaction.metadata,
        description: transaction.description,
        reference: transaction.reference,
        processedAt: transaction.processedAt,
        failedAt: transaction.failedAt,
        refundedAt: transaction.refundedAt,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      }))

      return {
        data,
        total,
        limit,
        offset,
      }
    } catch (error) {
      this.logger.error(`Error searching transactions: ${error.message}`, error.stack)
      throw error
    }
  }
}
