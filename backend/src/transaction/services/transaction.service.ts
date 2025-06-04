import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import type { DataSource } from "typeorm"
import { Transaction, TransactionStatus } from "../entities/transaction.entity"
import { TransactionHistory } from "../entities/transaction-history.entity"
import type { CreateTransactionDto } from "../dto/create-transaction.dto"
import type { UpdateTransactionStatusDto } from "../dto/update-transaction-status.dto"
import type { TransactionResponseDto, TransactionHistoryResponseDto } from "../dto/transaction-response.dto"

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name)

  constructor(private dataSource: DataSource) {}

  async createTransaction(createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    const transaction = this.transactionRepository.create(createTransactionDto)

    // Save the transaction
    const savedTransaction = await this.transactionRepository.save(transaction)

    // Create initial history entry
    await this.createHistoryEntry({
      transactionId: savedTransaction.id,
      previousStatus: null,
      newStatus: savedTransaction.status,
      changes: { created: true },
      changedBy: "system",
      reason: "Transaction created",
    })

    return this.mapToResponseDto(savedTransaction)
  }

  async findById(id: string): Promise<TransactionResponseDto | null> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    })

    if (!transaction) {
      return null
    }

    return this.mapToResponseDto(transaction)
  }

  async findByTransactionId(transactionId: string): Promise<TransactionResponseDto | null> {
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId },
    })

    if (!transaction) {
      return null
    }

    return this.mapToResponseDto(transaction)
  }

  async findByReference(reference: string): Promise<TransactionResponseDto | null> {
    const transaction = await this.transactionRepository.findOne({
      where: { reference },
    })

    if (!transaction) {
      return null
    }

    return this.mapToResponseDto(transaction)
  }

  async updateTransactionStatus(
    id: string,
    updateStatusDto: UpdateTransactionStatusDto,
  ): Promise<TransactionResponseDto | null> {
    // Use a transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Get the current transaction
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { id },
      })

      if (!transaction) {
        await queryRunner.rollbackTransaction()
        return null
      }

      // Store the previous status
      const previousStatus = transaction.status

      // Update status-specific timestamps
      if (updateStatusDto.status === TransactionStatus.COMPLETED && !transaction.processedAt) {
        transaction.processedAt = new Date()
      } else if (updateStatusDto.status === TransactionStatus.FAILED && !transaction.failedAt) {
        transaction.failedAt = new Date()
      } else if (
        (updateStatusDto.status === TransactionStatus.REFUNDED ||
          updateStatusDto.status === TransactionStatus.PARTIALLY_REFUNDED) &&
        !transaction.refundedAt
      ) {
        transaction.refundedAt = new Date()
      }

      // Update the status
      transaction.status = updateStatusDto.status

      // Save the updated transaction
      const updatedTransaction = await queryRunner.manager.save(transaction)

      // Create a history entry
      const historyEntry = new TransactionHistory()
      historyEntry.transactionId = transaction.id
      historyEntry.previousStatus = previousStatus
      historyEntry.newStatus = updateStatusDto.status
      historyEntry.changes = {
        status: {
          from: previousStatus,
          to: updateStatusDto.status,
        },
      }
      historyEntry.changedBy = updateStatusDto.changedBy || "system"
      historyEntry.reason = updateStatusDto.reason || `Status updated to ${updateStatusDto.status}`

      await queryRunner.manager.save(historyEntry)

      // Commit the transaction
      await queryRunner.commitTransaction()

      return this.mapToResponseDto(updatedTransaction)
    } catch (error) {
      // Rollback in case of error
      await queryRunner.rollbackTransaction()
      this.logger.error(`Error updating transaction status: ${error.message}`, error.stack)
      throw error
    } finally {
      // Release the query runner
      await queryRunner.release()
    }
  }

  async getTransactionHistory(transactionId: string): Promise<TransactionHistoryResponseDto[]> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    })

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${transactionId} not found`)
    }

    const history = await this.transactionHistoryRepository.find({
      where: { transactionId },
      order: { createdAt: "DESC" },
    })

    return history.map((entry) => ({
      id: entry.id,
      transactionId: entry.transactionId,
      previousStatus: entry.previousStatus,
      newStatus: entry.newStatus,
      changes: entry.changes,
      changedBy: entry.changedBy,
      reason: entry.reason,
      createdAt: entry.createdAt,
    }))
  }

  private async createHistoryEntry(historyData: Partial<TransactionHistory>): Promise<TransactionHistory> {
    const historyEntry = this.transactionHistoryRepository.create(historyData)
    return this.transactionHistoryRepository.save(historyEntry)
  }

  private mapToResponseDto(transaction: Transaction): TransactionResponseDto {
    return {
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
    }
  }
}
