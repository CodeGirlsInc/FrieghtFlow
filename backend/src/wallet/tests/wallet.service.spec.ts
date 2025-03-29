import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { DataSource, Repository } from "typeorm"
import { WalletService } from "../wallet.service"
import { Wallet } from "../entities/wallet.entity"
import { Transaction } from "../entities/transaction.entity"
import { NotFoundException, BadRequestException } from "@nestjs/common"
import { TransactionType } from "../enums/transaction-type.enum"
import { TransactionStatus } from "../enums/transaction-status.enum"

// Mock QueryRunner
const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    findOne: jest.fn(),
    save: jest.fn(),
  },
}

// Mock DataSource
const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
}

describe("WalletService", () => {
  let service: WalletService
  let walletRepository: Repository<Wallet>
  let transactionRepository: Repository<Transaction>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useClass: Repository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile()

    service = module.get<WalletService>(WalletService)
    walletRepository = module.get<Repository<Wallet>>(getRepositoryToken(Wallet))
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction))
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("createWallet", () => {
    it("should create a new wallet", async () => {
      const createWalletDto = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        currency: "USD",
      }

      const newWallet = {
        id: "123e4567-e89b-12d3-a456-426614174001",
        userId: createWalletDto.userId,
        currency: createWalletDto.currency,
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(walletRepository, "create").mockReturnValue(newWallet as any)
      jest.spyOn(walletRepository, "save").mockResolvedValue(newWallet as any)

      const result = await service.createWallet(createWalletDto)
      expect(result).toEqual(newWallet)
      expect(walletRepository.create).toHaveBeenCalledWith({
        userId: createWalletDto.userId,
        currency: createWalletDto.currency.toUpperCase(),
        balance: 0,
      })
      expect(walletRepository.save).toHaveBeenCalledWith(newWallet)
    })
  })

  describe("getWalletById", () => {
    it("should return a wallet if it exists", async () => {
      const walletId = "123e4567-e89b-12d3-a456-426614174001"
      const wallet = {
        id: walletId,
        userId: "123e4567-e89b-12d3-a456-426614174000",
        currency: "USD",
        balance: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      jest.spyOn(walletRepository, "findOne").mockResolvedValue(wallet as any)

      const result = await service.getWalletById(walletId)
      expect(result).toEqual(wallet)
      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { id: walletId },
      })
    })

    it("should throw NotFoundException if wallet does not exist", async () => {
      const walletId = "123e4567-e89b-12d3-a456-426614174001"

      jest.spyOn(walletRepository, "findOne").mockResolvedValue(null)

      await expect(service.getWalletById(walletId)).rejects.toThrow(NotFoundException)
    })
  })

  describe("deposit", () => {
    it("should deposit funds to a wallet", async () => {
      const walletId = "123e4567-e89b-12d3-a456-426614174001"
      const amount = 50

      const wallet = {
        id: walletId,
        userId: "123e4567-e89b-12d3-a456-426614174000",
        currency: "USD",
        balance: 100,
      }

      const transaction = {
        id: "123e4567-e89b-12d3-a456-426614174002",
        walletId,
        amount,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.PENDING,
      }

      const completedTransaction = {
        ...transaction,
        status: TransactionStatus.COMPLETED,
      }

      mockQueryRunner.manager.findOne.mockResolvedValue(wallet)
      jest.spyOn(transactionRepository, "create").mockReturnValue(transaction as any)
      mockQueryRunner.manager.save
        .mockResolvedValueOnce(transaction) // Save transaction
        .mockResolvedValueOnce({ ...wallet, balance: 150 }) // Save wallet
        .mockResolvedValueOnce(completedTransaction) // Update transaction status

      const result = await service.deposit(walletId, amount)

      expect(result).toEqual(completedTransaction)
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled()
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled()
      expect(mockQueryRunner.release).toHaveBeenCalled()
    })
  })

  describe("withdraw", () => {
    it("should withdraw funds from a wallet with sufficient balance", async () => {
      const walletId = "123e4567-e89b-12d3-a456-426614174001"
      const amount = 50

      const wallet = {
        id: walletId,
        userId: "123e4567-e89b-12d3-a456-426614174000",
        currency: "USD",
        balance: 100,
      }

      const transaction = {
        id: "123e4567-e89b-12d3-a456-426614174002",
        walletId,
        amount: -amount,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING,
      }

      const completedTransaction = {
        ...transaction,
        status: TransactionStatus.COMPLETED,
      }

      mockQueryRunner.manager.findOne.mockResolvedValue(wallet)
      jest.spyOn(transactionRepository, "create").mockReturnValue(transaction as any)
      mockQueryRunner.manager.save
        .mockResolvedValueOnce(transaction) // Save transaction
        .mockResolvedValueOnce({ ...wallet, balance: 50 }) // Save wallet
        .mockResolvedValueOnce(completedTransaction) // Update transaction status

      const result = await service.withdraw(walletId, amount)

      expect(result).toEqual(completedTransaction)
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled()
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled()
      expect(mockQueryRunner.release).toHaveBeenCalled()
    })

    it("should throw BadRequestException if wallet has insufficient balance", async () => {
      const walletId = "123e4567-e89b-12d3-a456-426614174001"
      const amount = 150

      const wallet = {
        id: walletId,
        userId: "123e4567-e89b-12d3-a456-426614174000",
        currency: "USD",
        balance: 100,
      }

      mockQueryRunner.manager.findOne.mockResolvedValue(wallet)

      await expect(service.withdraw(walletId, amount)).rejects.toThrow(BadRequestException)
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled()
      expect(mockQueryRunner.release).toHaveBeenCalled()
    })
  })

  describe("getTransactions", () => {
    it("should return transactions for a wallet", async () => {
      const walletId = "123e4567-e89b-12d3-a456-426614174001"
      const transactions = [
        {
          id: "123e4567-e89b-12d3-a456-426614174002",
          walletId,
          amount: 100,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "123e4567-e89b-12d3-a456-426614174003",
          walletId,
          amount: -50,
          type: TransactionType.WITHDRAWAL,
          status: TransactionStatus.COMPLETED,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      jest.spyOn(service, "getWalletById").mockResolvedValue({ id: walletId } as any)
      jest.spyOn(transactionRepository, "find").mockResolvedValue(transactions as any)

      const result = await service.getTransactions(walletId)
      expect(result).toEqual(transactions)
      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: { walletId },
        order: { createdAt: "DESC" },
      })
    })
  })
})

