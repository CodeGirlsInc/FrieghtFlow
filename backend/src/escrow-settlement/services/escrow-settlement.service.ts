import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { EventEmitter2 } from "@nestjs/event-emitter"
import { Cron, CronExpression } from "@nestjs/schedule"
import { type EscrowTransaction, TransactionType, TransactionStatus } from "../entities/escrow-transaction.entity"
import type { LockFundsDto } from "../dto/lock-funds.dto"
import type { ReleaseFundsDto } from "../dto/release-funds.dto"
import type { QueryEscrowTransactionDto } from "../dto/query-escrow-transaction.dto"
import type { StarkNetService } from "./starknet.service"
import {
  EscrowTransactionCreatedEvent,
  EscrowTransactionSubmittedEvent,
  EscrowTransactionConfirmedEvent,
  EscrowTransactionFailedEvent,
  EscrowTransactionExpiredEvent,
  FundsLockedEvent,
  FundsReleasedEvent,
  FundsRefundedEvent,
} from "../events/escrow-transaction.events"
import {
  EscrowTransactionNotFoundException,
  DuplicateTransactionException,
  InvalidTransactionStateException,
  TransactionExpiredException,
  MaxRetriesExceededException,
} from "../exceptions/escrow-settlement.exceptions"

@Injectable()
export class EscrowSettlementService {
  private readonly logger = new Logger(EscrowSettlementService.name)

  constructor(
    private readonly escrowTransactionRepository: Repository<EscrowTransaction>,
    private readonly starkNetService: StarkNetService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async lockFunds(lockFundsDto: LockFundsDto): Promise<EscrowTransaction> {
    this.logger.log(`Initiating fund lock for transaction: ${lockFundsDto.transactionId}`)

    // Check for duplicate transaction
    await this.checkForDuplicateTransaction(lockFundsDto.transactionId)

    // Create transaction record
    const transaction = this.escrowTransactionRepository.create({
      transactionId: lockFundsDto.transactionId,
      type: TransactionType.LOCK,
      status: TransactionStatus.PENDING,
      currency: lockFundsDto.currency,
      amount: lockFundsDto.amount,
      senderAddress: lockFundsDto.senderAddress,
      recipientAddress: lockFundsDto.recipientAddress,
      contractAddress: lockFundsDto.contractAddress,
      metadata: lockFundsDto.metadata,
      expiresAt: lockFundsDto.expiresAt,
      maxRetries: lockFundsDto.maxRetries || 3,
    })

    const savedTransaction = await this.escrowTransactionRepository.save(transaction)

    // Emit creation event
    this.eventEmitter.emit("escrow-transaction.created", new EscrowTransactionCreatedEvent(savedTransaction))

    try {
      // Execute StarkNet transaction
      const result = await this.starkNetService.lockFunds(
        lockFundsDto.contractAddress,
        lockFundsDto.transactionId,
        lockFundsDto.amount,
        lockFundsDto.senderAddress,
        lockFundsDto.recipientAddress,
      )

      // Update transaction with StarkNet details
      savedTransaction.starknetTxHash = result.transaction_hash
      savedTransaction.status = TransactionStatus.SUBMITTED
      savedTransaction.executionStatus = result.execution_status
      savedTransaction.finalityStatus = result.finality_status

      const updatedTransaction = await this.escrowTransactionRepository.save(savedTransaction)

      // Emit events
      this.eventEmitter.emit(
        "escrow-transaction.submitted",
        new EscrowTransactionSubmittedEvent(updatedTransaction, result.transaction_hash),
      )
      this.eventEmitter.emit("funds.locked", new FundsLockedEvent(updatedTransaction, result.transaction_hash))

      this.logger.log(`Fund lock submitted successfully: ${result.transaction_hash}`)
      return updatedTransaction
    } catch (error) {
      await this.handleTransactionError(savedTransaction, error.message)
      throw error
    }
  }

  async releaseFunds(releaseFundsDto: ReleaseFundsDto): Promise<EscrowTransaction> {
    this.logger.log(`Initiating fund release for transaction: ${releaseFundsDto.transactionId}`)

    // Find the original lock transaction
    const lockTransaction = await this.findByTransactionId(releaseFundsDto.transactionId)

    if (lockTransaction.type !== TransactionType.LOCK) {
      throw new InvalidTransactionStateException("Can only release funds from lock transactions")
    }

    if (lockTransaction.status !== TransactionStatus.CONFIRMED) {
      throw new InvalidTransactionStateException("Lock transaction must be confirmed before release")
    }

    // Check if already released
    const existingRelease = await this.escrowTransactionRepository.findOne({
      where: {
        transactionId: releaseFundsDto.transactionId,
        type: TransactionType.RELEASE,
        status: TransactionStatus.CONFIRMED,
      },
    })

    if (existingRelease) {
      throw new InvalidTransactionStateException("Funds have already been released for this transaction")
    }

    // Create release transaction record
    const releaseTransaction = this.escrowTransactionRepository.create({
      transactionId: `${releaseFundsDto.transactionId}-release`,
      type: TransactionType.RELEASE,
      status: TransactionStatus.PENDING,
      currency: lockTransaction.currency,
      amount: lockTransaction.amount,
      senderAddress: lockTransaction.senderAddress,
      recipientAddress: releaseFundsDto.recipientAddress,
      contractAddress: lockTransaction.contractAddress,
      metadata: {
        ...lockTransaction.metadata,
        ...releaseFundsDto.metadata,
        originalTransactionId: releaseFundsDto.transactionId,
      },
    })

    const savedTransaction = await this.escrowTransactionRepository.save(releaseTransaction)

    // Emit creation event
    this.eventEmitter.emit("escrow-transaction.created", new EscrowTransactionCreatedEvent(savedTransaction))

    try {
      // Execute StarkNet transaction
      const result = await this.starkNetService.releaseFunds(
        lockTransaction.contractAddress,
        releaseFundsDto.transactionId,
        releaseFundsDto.recipientAddress,
      )

      // Update transaction with StarkNet details
      savedTransaction.starknetTxHash = result.transaction_hash
      savedTransaction.status = TransactionStatus.SUBMITTED
      savedTransaction.executionStatus = result.execution_status
      savedTransaction.finalityStatus = result.finality_status

      const updatedTransaction = await this.escrowTransactionRepository.save(savedTransaction)

      // Emit events
      this.eventEmitter.emit(
        "escrow-transaction.submitted",
        new EscrowTransactionSubmittedEvent(updatedTransaction, result.transaction_hash),
      )
      this.eventEmitter.emit("funds.released", new FundsReleasedEvent(updatedTransaction, result.transaction_hash))

      this.logger.log(`Fund release submitted successfully: ${result.transaction_hash}`)
      return updatedTransaction
    } catch (error) {
      await this.handleTransactionError(savedTransaction, error.message)
      throw error
    }
  }

  async refundFunds(transactionId: string): Promise<EscrowTransaction> {
    this.logger.log(`Initiating fund refund for transaction: ${transactionId}`)

    // Find the original lock transaction
    const lockTransaction = await this.findByTransactionId(transactionId)

    if (lockTransaction.type !== TransactionType.LOCK) {
      throw new InvalidTransactionStateException("Can only refund funds from lock transactions")
    }

    if (lockTransaction.status !== TransactionStatus.CONFIRMED) {
      throw new InvalidTransactionStateException("Lock transaction must be confirmed before refund")
    }

    // Check if already released or refunded
    const existingTransaction = await this.escrowTransactionRepository.findOne({
      where: [
        { transactionId, type: TransactionType.RELEASE, status: TransactionStatus.CONFIRMED },
        { transactionId: `${transactionId}-refund`, type: TransactionType.REFUND, status: TransactionStatus.CONFIRMED },
      ],
    })

    if (existingTransaction) {
      throw new InvalidTransactionStateException("Funds have already been released or refunded for this transaction")
    }

    // Create refund transaction record
    const refundTransaction = this.escrowTransactionRepository.create({
      transactionId: `${transactionId}-refund`,
      type: TransactionType.REFUND,
      status: TransactionStatus.PENDING,
      currency: lockTransaction.currency,
      amount: lockTransaction.amount,
      senderAddress: lockTransaction.senderAddress,
      recipientAddress: lockTransaction.senderAddress, // Refund to sender
      contractAddress: lockTransaction.contractAddress,
      metadata: {
        ...lockTransaction.metadata,
        originalTransactionId: transactionId,
      },
    })

    const savedTransaction = await this.escrowTransactionRepository.save(refundTransaction)

    // Emit creation event
    this.eventEmitter.emit("escrow-transaction.created", new EscrowTransactionCreatedEvent(savedTransaction))

    try {
      // Execute StarkNet transaction
      const result = await this.starkNetService.refundFunds(
        lockTransaction.contractAddress,
        transactionId,
        lockTransaction.senderAddress,
      )

      // Update transaction with StarkNet details
      savedTransaction.starknetTxHash = result.transaction_hash
      savedTransaction.status = TransactionStatus.SUBMITTED
      savedTransaction.executionStatus = result.execution_status
      savedTransaction.finalityStatus = result.finality_status

      const updatedTransaction = await this.escrowTransactionRepository.save(savedTransaction)

      // Emit events
      this.eventEmitter.emit(
        "escrow-transaction.submitted",
        new EscrowTransactionSubmittedEvent(updatedTransaction, result.transaction_hash),
      )
      this.eventEmitter.emit("funds.refunded", new FundsRefundedEvent(updatedTransaction, result.transaction_hash))

      this.logger.log(`Fund refund submitted successfully: ${result.transaction_hash}`)
      return updatedTransaction
    } catch (error) {
      await this.handleTransactionError(savedTransaction, error.message)
      throw error
    }
  }

  async findAll(queryDto: QueryEscrowTransactionDto): Promise<{ data: EscrowTransaction[]; total: number }> {
    const {
      transactionId,
      type,
      status,
      currency,
      senderAddress,
      recipientAddress,
      fromDate,
      toDate,
      limit,
      offset,
      sortBy,
      sortOrder,
    } = queryDto

    const queryBuilder = this.escrowTransactionRepository.createQueryBuilder("transaction")

    if (transactionId) {
      queryBuilder.andWhere("transaction.transactionId ILIKE :transactionId", {
        transactionId: `%${transactionId}%`,
      })
    }

    if (type) {
      queryBuilder.andWhere("transaction.type = :type", { type })
    }

    if (status) {
      queryBuilder.andWhere("transaction.status = :status", { status })
    }

    if (currency) {
      queryBuilder.andWhere("transaction.currency = :currency", { currency })
    }

    if (senderAddress) {
      queryBuilder.andWhere("transaction.senderAddress = :senderAddress", { senderAddress })
    }

    if (recipientAddress) {
      queryBuilder.andWhere("transaction.recipientAddress = :recipientAddress", { recipientAddress })
    }

    if (fromDate) {
      queryBuilder.andWhere("transaction.createdAt >= :fromDate", { fromDate })
    }

    if (toDate) {
      queryBuilder.andWhere("transaction.createdAt <= :toDate", { toDate })
    }

    queryBuilder.orderBy(`transaction.${sortBy}`, sortOrder).skip(offset).take(limit)

    const [data, total] = await queryBuilder.getManyAndCount()

    return { data, total }
  }

  async findOne(id: string): Promise<EscrowTransaction> {
    const transaction = await this.escrowTransactionRepository.findOne({
      where: { id },
    })

    if (!transaction) {
      throw new EscrowTransactionNotFoundException(id)
    }

    if (transaction.isExpired) {
      throw new TransactionExpiredException(transaction.transactionId)
    }

    return transaction
  }

  async findByTransactionId(transactionId: string): Promise<EscrowTransaction> {
    const transaction = await this.escrowTransactionRepository.findOne({
      where: { transactionId },
    })

    if (!transaction) {
      throw new EscrowTransactionNotFoundException(transactionId)
    }

    if (transaction.isExpired) {
      throw new TransactionExpiredException(transactionId)
    }

    return transaction
  }

  async getTransactionStatus(transactionId: string): Promise<{ status: TransactionStatus; details: any }> {
    const transaction = await this.findByTransactionId(transactionId)

    let blockchainStatus = null
    if (transaction.starknetTxHash) {
      try {
        const isConfirmed = await this.starkNetService.isTransactionConfirmed(transaction.starknetTxHash)
        blockchainStatus = {
          confirmed: isConfirmed,
          txHash: transaction.starknetTxHash,
          blockNumber: transaction.blockNumber,
        }
      } catch (error) {
        this.logger.warn(`Could not fetch blockchain status: ${error.message}`)
      }
    }

    return {
      status: transaction.status,
      details: {
        id: transaction.id,
        transactionId: transaction.transactionId,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        senderAddress: transaction.senderAddress,
        recipientAddress: transaction.recipientAddress,
        createdAt: transaction.createdAt,
        confirmedAt: transaction.confirmedAt,
        blockchain: blockchainStatus,
        retryCount: transaction.retryCount,
        lastError: transaction.lastError,
      },
    }
  }

  async retryFailedTransaction(id: string): Promise<EscrowTransaction> {
    const transaction = await this.findOne(id)

    if (!transaction.canRetry) {
      throw new MaxRetriesExceededException(transaction.transactionId)
    }

    if (transaction.status !== TransactionStatus.FAILED) {
      throw new InvalidTransactionStateException("Can only retry failed transactions")
    }

    this.logger.log(`Retrying failed transaction: ${transaction.transactionId}`)

    // Reset transaction status
    transaction.status = TransactionStatus.PENDING
    transaction.retryCount += 1
    transaction.lastError = null
    transaction.starknetTxHash = null

    const updatedTransaction = await this.escrowTransactionRepository.save(transaction)

    // Re-execute based on transaction type
    try {
      let result
      switch (transaction.type) {
        case TransactionType.LOCK:
          result = await this.starkNetService.lockFunds(
            transaction.contractAddress,
            transaction.transactionId,
            transaction.amount,
            transaction.senderAddress,
            transaction.recipientAddress,
          )
          break
        case TransactionType.RELEASE:
          result = await this.starkNetService.releaseFunds(
            transaction.contractAddress,
            transaction.transactionId,
            transaction.recipientAddress,
          )
          break
        case TransactionType.REFUND:
          result = await this.starkNetService.refundFunds(
            transaction.contractAddress,
            transaction.transactionId,
            transaction.senderAddress,
          )
          break
        default:
          throw new InvalidTransactionStateException(`Unknown transaction type: ${transaction.type}`)
      }

      // Update with new transaction hash
      updatedTransaction.starknetTxHash = result.transaction_hash
      updatedTransaction.status = TransactionStatus.SUBMITTED

      const finalTransaction = await this.escrowTransactionRepository.save(updatedTransaction)

      this.eventEmitter.emit(
        "escrow-transaction.submitted",
        new EscrowTransactionSubmittedEvent(finalTransaction, result.transaction_hash),
      )

      return finalTransaction
    } catch (error) {
      await this.handleTransactionError(updatedTransaction, error.message)
      throw error
    }
  }

  async getStatistics(): Promise<any> {
    const stats = await this.escrowTransactionRepository
      .createQueryBuilder("transaction")
      .select([
        "COUNT(*) as total",
        "COUNT(CASE WHEN status = :pending THEN 1 END) as pending",
        "COUNT(CASE WHEN status = :submitted THEN 1 END) as submitted",
        "COUNT(CASE WHEN status = :confirmed THEN 1 END) as confirmed",
        "COUNT(CASE WHEN status = :failed THEN 1 END) as failed",
        "COUNT(CASE WHEN type = :lock THEN 1 END) as locks",
        "COUNT(CASE WHEN type = :release THEN 1 END) as releases",
        "COUNT(CASE WHEN type = :refund THEN 1 END) as refunds",
        "SUM(CASE WHEN status = :confirmed AND type = :lock THEN CAST(amount AS DECIMAL) ELSE 0 END) as totalLocked",
        "SUM(CASE WHEN status = :confirmed AND type = :release THEN CAST(amount AS DECIMAL) ELSE 0 END) as totalReleased",
      ])
      .setParameters({
        pending: TransactionStatus.PENDING,
        submitted: TransactionStatus.SUBMITTED,
        confirmed: TransactionStatus.CONFIRMED,
        failed: TransactionStatus.FAILED,
        lock: TransactionType.LOCK,
        release: TransactionType.RELEASE,
        refund: TransactionType.REFUND,
      })
      .getRawOne()

    return {
      total: Number.parseInt(stats.total),
      pending: Number.parseInt(stats.pending),
      submitted: Number.parseInt(stats.submitted),
      confirmed: Number.parseInt(stats.confirmed),
      failed: Number.parseInt(stats.failed),
      locks: Number.parseInt(stats.locks),
      releases: Number.parseInt(stats.releases),
      refunds: Number.parseInt(stats.refunds),
      totalLocked: Number.parseFloat(stats.totalLocked || "0"),
      totalReleased: Number.parseFloat(stats.totalReleased || "0"),
    }
  }

  // Cron job to check transaction confirmations
  @Cron(CronExpression.EVERY_MINUTE)
  async checkPendingTransactions(): Promise<void> {
    this.logger.debug("Checking pending transactions for confirmation")

    const pendingTransactions = await this.escrowTransactionRepository.find({
      where: { status: TransactionStatus.SUBMITTED },
      take: 50, // Process in batches
    })

    for (const transaction of pendingTransactions) {
      try {
        if (transaction.starknetTxHash) {
          const receipt = await this.starkNetService.getTransactionReceipt(transaction.starknetTxHash)

          if (receipt.execution_status === "SUCCEEDED") {
            transaction.status = TransactionStatus.CONFIRMED
            transaction.blockNumber = receipt.block_number.toString()
            transaction.blockHash = receipt.block_hash
            transaction.gasConsumed = receipt.gas_consumed
            transaction.gasPrice = receipt.gas_price
            transaction.executionStatus = receipt.execution_status
            transaction.finalityStatus = receipt.finality_status
            transaction.confirmedAt = new Date()

            await this.escrowTransactionRepository.save(transaction)

            this.eventEmitter.emit("escrow-transaction.confirmed", new EscrowTransactionConfirmedEvent(transaction))

            this.logger.log(`Transaction confirmed: ${transaction.transactionId}`)
          } else if (receipt.execution_status === "REVERTED") {
            await this.handleTransactionError(transaction, "Transaction reverted on StarkNet")
          }
        }
      } catch (error) {
        this.logger.warn(`Could not check transaction ${transaction.transactionId}: ${error.message}`)
      }
    }
  }

  // Cron job to handle expired transactions
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredTransactions(): Promise<void> {
    this.logger.debug("Checking for expired transactions")

    const expiredTransactions = await this.escrowTransactionRepository.find({
      where: {
        status: TransactionStatus.PENDING,
      },
    })

    const now = new Date()
    for (const transaction of expiredTransactions) {
      if (transaction.expiresAt && transaction.expiresAt < now) {
        transaction.status = TransactionStatus.CANCELLED
        transaction.lastError = "Transaction expired"

        await this.escrowTransactionRepository.save(transaction)

        this.eventEmitter.emit("escrow-transaction.expired", new EscrowTransactionExpiredEvent(transaction))

        this.logger.log(`Transaction expired: ${transaction.transactionId}`)
      }
    }
  }

  private async checkForDuplicateTransaction(transactionId: string): Promise<void> {
    const existingTransaction = await this.escrowTransactionRepository.findOne({
      where: { transactionId },
    })

    if (existingTransaction) {
      throw new DuplicateTransactionException(transactionId)
    }
  }

  private async handleTransactionError(transaction: EscrowTransaction, error: string): Promise<void> {
    transaction.status = TransactionStatus.FAILED
    transaction.lastError = error
    transaction.retryCount += 1

    await this.escrowTransactionRepository.save(transaction)

    this.eventEmitter.emit("escrow-transaction.failed", new EscrowTransactionFailedEvent(transaction, error))

    this.logger.error(`Transaction failed: ${transaction.transactionId}, Error: ${error}`)
  }
}
