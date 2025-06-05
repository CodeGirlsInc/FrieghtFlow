import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { StellarTransaction } from "../entities/stellar-transaction.entity"
import { TransactionStatus } from "../types/stellar.types"

@Injectable()
export class StellarTransactionRepository {
  private readonly repository: Repository<StellarTransaction>
  constructor(
    @InjectRepository(StellarTransaction)
    repository: Repository<StellarTransaction>,
  ) {
    this.repository = repository;
  }

  async create(transactionData: Partial<StellarTransaction>): Promise<StellarTransaction> {
    const transaction = this.repository.create(transactionData)
    return this.repository.save(transaction)
  }

  async findByHash(transactionHash: string): Promise<StellarTransaction | null> {
    return this.repository.findOne({ where: { transactionHash } })
  }

  async findByAccount(accountId: string): Promise<StellarTransaction[]> {
    return this.repository.find({
      where: [{ sourceAccountId: accountId }, { destinationAccountId: accountId }],
      order: { createdAt: "DESC" },
    })
  }

  async updateStatus(transactionHash: string, status: TransactionStatus, additionalData?: any): Promise<void> {
    const updateData: any = { status }
    if (additionalData) {
      Object.assign(updateData, additionalData)
    }
    await this.repository.update({ transactionHash }, updateData)
  }

  async findPendingTransactions(): Promise<StellarTransaction[]> {
    return this.repository.find({ where: { status: TransactionStatus.PENDING } })
  }
}
