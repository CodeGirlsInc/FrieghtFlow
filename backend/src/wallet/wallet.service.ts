import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository, DataSource } from "typeorm"
import { Wallet } from "./entities/wallet.entity"
import { Transaction } from "./entities/transaction.entity"
import type { CreateWalletDto } from "./dto/create-wallet.dto"
import { TransactionType } from "./enums/transaction-type.enum"
import { TransactionStatus } from "./enums/transaction-status.enum"

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  async createWallet(createWalletDto: CreateWalletDto): Promise<Wallet> {
    const wallet = this.walletRepository.create({
      userId: createWalletDto.userId,
      currency: createWalletDto.currency.toUpperCase(),
      balance: 0,
    })

    return this.walletRepository.save(wallet)
  }

  async getWalletById(walletId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    })

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`)
    }

    return wallet
  }

  async deposit(walletId: string, amount: number): Promise<Transaction> {
    // Use a transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Get wallet with lock for update
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id: walletId },
        lock: { mode: "pessimistic_write" },
      })

      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${walletId} not found`)
      }

      // Create transaction record
      const transaction = this.transactionRepository.create({
        walletId,
        amount,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.PENDING,
      })

      // Save transaction first
      const savedTransaction = await queryRunner.manager.save(transaction)

      // Update wallet balance
      wallet.balance = Number(wallet.balance) + amount
      await queryRunner.manager.save(wallet)

      // Update transaction status to completed
      savedTransaction.status = TransactionStatus.COMPLETED
      await queryRunner.manager.save(savedTransaction)

      await queryRunner.commitTransaction()
      return savedTransaction
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async withdraw(walletId: string, amount: number): Promise<Transaction> {
    // Use a transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Get wallet with lock for update
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id: walletId },
        lock: { mode: "pessimistic_write" },
      })

      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${walletId} not found`)
      }

      // Check if wallet has sufficient balance
      if (Number(wallet.balance) < amount) {
        throw new BadRequestException("Insufficient balance")
      }

      // Create transaction record
      const transaction = this.transactionRepository.create({
        walletId,
        amount: -amount, // Negative amount for withdrawals
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING,
      })

      // Save transaction first
      const savedTransaction = await queryRunner.manager.save(transaction)

      // Update wallet balance
      wallet.balance = Number(wallet.balance) - amount
      await queryRunner.manager.save(wallet)

      // Update transaction status to completed
      savedTransaction.status = TransactionStatus.COMPLETED
      await queryRunner.manager.save(savedTransaction)

      await queryRunner.commitTransaction()
      return savedTransaction
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async getTransactions(walletId: string): Promise<Transaction[]> {
    // Check if wallet exists
    await this.getWalletById(walletId)

    return this.transactionRepository.find({
      where: { walletId },
      order: { createdAt: "DESC" },
    })
  }
}

