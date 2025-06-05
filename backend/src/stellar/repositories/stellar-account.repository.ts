import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { StellarAccount } from "../entities/stellar-account.entity"

@Injectable()
export class StellarAccountRepository {
  constructor(private readonly repository: Repository<StellarAccount>) {}

  async create(accountData: Partial<StellarAccount>): Promise<StellarAccount> {
    const account = this.repository.create(accountData)
    return this.repository.save(account)
  }

  async findByPublicKey(publicKey: string): Promise<StellarAccount | null> {
    return this.repository.findOne({ where: { publicKey } })
  }

  async findByUserId(userId: string): Promise<StellarAccount[]> {
    return this.repository.find({ where: { userId } })
  }

  async updateAccountInfo(publicKey: string, accountInfo: Partial<StellarAccount>): Promise<void> {
    await this.repository.update({ publicKey }, accountInfo)
  }

  async findAll(): Promise<StellarAccount[]> {
    return this.repository.find()
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id)
  }
}
