import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { EscrowSettlementService } from "../services/escrow-settlement.service"
import { StarkNetService } from "../services/starknet.service"
import { EscrowTransaction, TransactionType, TransactionStatus, Currency } from "../entities/escrow-transaction.entity"
import type { LockFundsDto } from "../dto/lock-funds.dto"
import type { ReleaseFundsDto } from "../dto/release-funds.dto"
import {
  EscrowTransactionNotFoundException,
  DuplicateTransactionException,
  InvalidTransactionStateException,
  TransactionExpiredException,
  MaxRetriesExceededException,
} from "../exceptions/escrow-settlement.exceptions"
import { jest } from "@jest/globals"

describe("EscrowSettlementService", () => {
  let service: EscrowSettlementService
  let repository: Repository<EscrowTransaction>
  let starkNetService: StarkNetService
  let eventEmitter: EventEmitter2

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockStarkNetService = {
    lockFunds: jest.fn(),
    releaseFunds: jest.fn(),
    refundFunds: jest.fn(),
    getTransactionReceipt: jest.fn(),
    isTransactionConfirmed: jest.fn(),
  }

  const mockEventEmitter = {
    emit: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EscrowSettlementService,
        {
          provide: getRepositoryToken(EscrowTransaction),
          useValue: mockRepository,
        },
        {
          provide: StarkNetService,
          useValue: mockStarkNetService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile()

    service = module.get<EscrowSettlementService>(EscrowSettlementService)
    repository = module.get<Repository<EscrowTransaction>>(getRepositoryToken(EscrowTransaction))
    starkNetService = module.get<StarkNetService>(StarkNetService)
    eventEmitter = module.get<EventEmitter2>(EventEmitter2)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("lockFunds", () => {
    const lockFundsDto: LockFundsDto = {
      transactionId: "tx-123",
      amount: "1000000000000000000",
      currency: Currency.ETH,
      senderAddress: "0xsender123",
      recipientAddress: "0xrecipient123",
      contractAddress: "0xcontract123",
    }

    it("should lock funds successfully", async () => {
      const mockTransaction = {
        id: "uuid-123",
        ...lockFundsDto,
        type: TransactionType.LOCK,
        status: TransactionStatus.PENDING,
      }

      const mockStarkNetResult = {
        transaction_hash: "0xabc123",
        execution_status: "PENDING",
        finality_status: "RECEIVED",
      }

      mockRepository.findOne.mockResolvedValue(null) // No duplicate
      mockRepository.create.mockReturnValue(mockTransaction)
      mockRepository.save.mockResolvedValue(mockTransaction)
      mockStarkNetService.lockFunds.mockResolvedValue(mockStarkNetResult)

      const result = await service.lockFunds(lockFundsDto)

      expect(result).toEqual(mockTransaction)
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...lockFundsDto,
        type: TransactionType.LOCK,
        status: TransactionStatus.PENDING,
        maxRetries: 3,
      })
      expect(mockStarkNetService.lockFunds).toHaveBeenCalledWith(
        lockFundsDto.contractAddress,
        lockFundsDto.transactionId,
        lockFundsDto.amount,
        lockFundsDto.senderAddress,
        lockFundsDto.recipientAddress,
      )
      expect(mockEventEmitter.emit).toHaveBeenCalledWith("escrow-transaction.created", expect.any(Object))
      expect(mockEventEmitter.emit).toHaveBeenCalledWith("escrow-transaction.submitted", expect.any(Object))
      expect(mockEventEmitter.emit).toHaveBeenCalledWith("funds.locked", expect.any(Object))
    })

    it("should throw DuplicateTransactionException when transaction exists", async () => {
      const existingTransaction = {
        id: "existing-uuid",
        transactionId: lockFundsDto.transactionId,
      }

      mockRepository.findOne.mockResolvedValue(existingTransaction)

      await expect(service.lockFunds(lockFundsDto)).rejects.toThrow(DuplicateTransactionException)
    })

    it("should handle StarkNet error and mark transaction as failed", async () => {
      const mockTransaction = {
        id: "uuid-123",
        ...lockFundsDto,
        type: TransactionType.LOCK,
        status: TransactionStatus.PENDING,
      }

      mockRepository.findOne.mockResolvedValue(null)
      mockRepository.create.mockReturnValue(mockTransaction)
      mockRepository.save.mockResolvedValue(mockTransaction)
      mockStarkNetService.lockFunds.mockRejectedValue(new Error("StarkNet error"))

      await expect(service.lockFunds(lockFundsDto)).rejects.toThrow("StarkNet error")

      expect(mockEventEmitter.emit).toHaveBeenCalledWith("escrow-transaction.failed", expect.any(Object))
    })
  })

  describe("releaseFunds", () => {
    const releaseFundsDto: ReleaseFundsDto = {
      transactionId: "tx-123",
      recipientAddress: "0xrecipient123",
    }

    it("should release funds successfully", async () => {
      const mockLockTransaction = {
        id: "lock-uuid",
        transactionId: "tx-123",
        type: TransactionType.LOCK,
        status: TransactionStatus.CONFIRMED,
        currency: Currency.ETH,
        amount: "1000000000000000000",
        senderAddress: "0xsender123",
        contractAddress: "0xcontract123",
      }

      const mockReleaseTransaction = {
        id: "release-uuid",
        transactionId: "tx-123-release",
        type: TransactionType.RELEASE,
        status: TransactionStatus.PENDING,
      }

      const mockStarkNetResult = {
        transaction_hash: "0xdef456",
        execution_status: "PENDING",
        finality_status: "RECEIVED",
      }

      mockRepository.findOne
        .mockResolvedValueOnce(mockLockTransaction) // findByTransactionId
        .mockResolvedValueOnce(null) // Check for existing release

      mockRepository.create.mockReturnValue(mockReleaseTransaction)
      mockRepository.save.mockResolvedValue(mockReleaseTransaction)
      mockStarkNetService.releaseFunds.mockResolvedValue(mockStarkNetResult)

      const result = await service.releaseFunds(releaseFundsDto)

      expect(result).toEqual(mockReleaseTransaction)
      expect(mockStarkNetService.releaseFunds).toHaveBeenCalledWith(
        mockLockTransaction.contractAddress,
        releaseFundsDto.transactionId,
        releaseFundsDto.recipientAddress,
      )
      expect(mockEventEmitter.emit).toHaveBeenCalledWith("funds.released", expect.any(Object))
    })

    it("should throw InvalidTransactionStateException for non-lock transaction", async () => {
      const mockTransaction = {
        id: "uuid-123",
        transactionId: "tx-123",
        type: TransactionType.RELEASE,
        status: TransactionStatus.CONFIRMED,
      }

      mockRepository.findOne.mockResolvedValue(mockTransaction)

      await expect(service.releaseFunds(releaseFundsDto)).rejects.toThrow(InvalidTransactionStateException)
    })

    it("should throw InvalidTransactionStateException for unconfirmed lock", async () => {
      const mockTransaction = {
        id: "uuid-123",
        transactionId: "tx-123",
        type: TransactionType.LOCK,
        status: TransactionStatus.PENDING,
      }

      mockRepository.findOne.mockResolvedValue(mockTransaction)

      await expect(service.releaseFunds(releaseFundsDto)).rejects.toThrow(InvalidTransactionStateException)
    })

    it("should throw InvalidTransactionStateException for already released funds", async () => {
      const mockLockTransaction = {
        id: "lock-uuid",
        transactionId: "tx-123",
        type: TransactionType.LOCK,
        status: TransactionStatus.CONFIRMED,
      }

      const mockReleaseTransaction = {
        id: "release-uuid",
        transactionId: "tx-123",
        type: TransactionType.RELEASE,
        status: TransactionStatus.CONFIRMED,
      }

      mockRepository.findOne.mockResolvedValueOnce(mockLockTransaction).mockResolvedValueOnce(mockReleaseTransaction)

      await expect(service.releaseFunds(releaseFundsDto)).rejects.toThrow(InvalidTransactionStateException)
    })
  })

  describe("refundFunds", () => {
    it("should refund funds successfully", async () => {
      const mockLockTransaction = {
        id: "lock-uuid",
        transactionId: "tx-123",
        type: TransactionType.LOCK,
        status: TransactionStatus.CONFIRMED,
        currency: Currency.ETH,
        amount: "1000000000000000000",
        senderAddress: "0xsender123",
        contractAddress: "0xcontract123",
      }

      const mockRefundTransaction = {
        id: "refund-uuid",
        transactionId: "tx-123-refund",
        type: TransactionType.REFUND,
        status: TransactionStatus.PENDING,
      }

      const mockStarkNetResult = {
        transaction_hash: "0xghi789",
        execution_status: "PENDING",
        finality_status: "RECEIVED",
      }

      mockRepository.findOne
        .mockResolvedValueOnce(mockLockTransaction) // findByTransactionId
        .mockResolvedValueOnce(null) // Check for existing release/refund

      mockRepository.create.mockReturnValue(mockRefundTransaction)
      mockRepository.save.mockResolvedValue(mockRefundTransaction)
      mockStarkNetService.refundFunds.mockResolvedValue(mockStarkNetResult)

      const result = await service.refundFunds("tx-123")

      expect(result).toEqual(mockRefundTransaction)
      expect(mockStarkNetService.refundFunds).toHaveBeenCalledWith(
        mockLockTransaction.contractAddress,
        "tx-123",
        mockLockTransaction.senderAddress,
      )
      expect(mockEventEmitter.emit).toHaveBeenCalledWith("funds.refunded", expect.any(Object))
    })
  })

  describe("findOne", () => {
    it("should return transaction when found", async () => {
      const mockTransaction = {
        id: "uuid-123",
        transactionId: "tx-123",
        isExpired: false,
      }

      mockRepository.findOne.mockResolvedValue(mockTransaction)

      const result = await service.findOne("uuid-123")

      expect(result).toEqual(mockTransaction)
    })

    it("should throw EscrowTransactionNotFoundException when not found", async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne("non-existent")).rejects.toThrow(EscrowTransactionNotFoundException)
    })

    it("should throw TransactionExpiredException when expired", async () => {
      const mockTransaction = {
        id: "uuid-123",
        transactionId: "tx-123",
        isExpired: true,
      }

      mockRepository.findOne.mockResolvedValue(mockTransaction)

      await expect(service.findOne("uuid-123")).rejects.toThrow(TransactionExpiredException)
    })
  })

  describe("getTransactionStatus", () => {
    it("should return transaction status with blockchain details", async () => {
      const mockTransaction = {
        id: "uuid-123",
        transactionId: "tx-123",
        type: TransactionType.LOCK,
        status: TransactionStatus.CONFIRMED,
        amount: "1000000000000000000",
        currency: Currency.ETH,
        senderAddress: "0xsender123",
        recipientAddress: "0xrecipient123",
        starknetTxHash: "0xabc123",
        blockNumber: "12345",
        createdAt: new Date(),
        confirmedAt: new Date(),
        retryCount: 0,
        lastError: null,
        isExpired: false,
      }

      mockRepository.findOne.mockResolvedValue(mockTransaction)
      mockStarkNetService.isTransactionConfirmed.mockResolvedValue(true)

      const result = await service.getTransactionStatus("tx-123")

      expect(result.status).toBe(TransactionStatus.CONFIRMED)
      expect(result.details.blockchain.confirmed).toBe(true)
      expect(result.details.blockchain.txHash).toBe("0xabc123")
    })

    it("should handle blockchain status check error gracefully", async () => {
      const mockTransaction = {
        id: "uuid-123",
        transactionId: "tx-123",
        status: TransactionStatus.CONFIRMED,
        starknetTxHash: "0xabc123",
        isExpired: false,
      }

      mockRepository.findOne.mockResolvedValue(mockTransaction)
      mockStarkNetService.isTransactionConfirmed.mockRejectedValue(new Error("Blockchain error"))

      const result = await service.getTransactionStatus("tx-123")

      expect(result.status).toBe(TransactionStatus.CONFIRMED)
      expect(result.details.blockchain).toBeNull()
    })
  })

  describe("retryFailedTransaction", () => {
    it("should retry failed lock transaction successfully", async () => {
      const mockTransaction = {
        id: "uuid-123",
        transactionId: "tx-123",
        type: TransactionType.LOCK,
        status: TransactionStatus.FAILED,
        retryCount: 1,
        maxRetries: 3,
        contractAddress: "0xcontract123",
        amount: "1000000000000000000",
        senderAddress: "0xsender123",
        recipientAddress: "0xrecipient123",
        canRetry: true,
        isExpired: false,
      }

      const mockStarkNetResult = {
        transaction_hash: "0xretry123",
        execution_status: "PENDING",
        finality_status: "RECEIVED",
      }

      mockRepository.findOne.mockResolvedValue(mockTransaction)
      mockRepository.save.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.SUBMITTED,
        starknetTxHash: "0xretry123",
        retryCount: 2,
      })
      mockStarkNetService.lockFunds.mockResolvedValue(mockStarkNetResult)

      const result = await service.retryFailedTransaction("uuid-123")

      expect(result.status).toBe(TransactionStatus.SUBMITTED)
      expect(result.starknetTxHash).toBe("0xretry123")
      expect(mockStarkNetService.lockFunds).toHaveBeenCalled()
    })

    it("should throw MaxRetriesExceededException when max retries reached", async () => {
      const mockTransaction = {
        id: "uuid-123",
        transactionId: "tx-123",
        canRetry: false,
        isExpired: false,
      }

      mockRepository.findOne.mockResolvedValue(mockTransaction)

      await expect(service.retryFailedTransaction("uuid-123")).rejects.toThrow(MaxRetriesExceededException)
    })

    it("should throw InvalidTransactionStateException for non-failed transaction", async () => {
      const mockTransaction = {
        id: "uuid-123",
        transactionId: "tx-123",
        status: TransactionStatus.CONFIRMED,
        canRetry: true,
        isExpired: false,
      }

      mockRepository.findOne.mockResolvedValue(mockTransaction)

      await expect(service.retryFailedTransaction("uuid-123")).rejects.toThrow(InvalidTransactionStateException)
    })
  })

  describe("getStatistics", () => {
    it("should return transaction statistics", async () => {
      const mockStats = {
        total: "10",
        pending: "2",
        submitted: "3",
        confirmed: "4",
        failed: "1",
        locks: "6",
        releases: "3",
        refunds: "1",
        totalLocked: "5000000000000000000",
        totalReleased: "3000000000000000000",
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
        pending: 2,
        submitted: 3,
        confirmed: 4,
        failed: 1,
        locks: 6,
        releases: 3,
        refunds: 1,
        totalLocked: 5,
        totalReleased: 3,
      })
    })
  })
})
