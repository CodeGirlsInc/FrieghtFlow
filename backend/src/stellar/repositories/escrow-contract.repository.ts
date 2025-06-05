import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { EscrowContract } from "../entities/escrow-contract.entity"
import { EscrowStatus } from "../types/stellar.types"

@Injectable()
export class EscrowContractRepository {
  constructor(private readonly repository: Repository<EscrowContract>) {}

  async create(escrowData: Partial<EscrowContract>): Promise<EscrowContract> {
    const escrow = this.repository.create(escrowData)
    return this.repository.save(escrow)
  }

  async findById(id: string): Promise<EscrowContract | null> {
    return this.repository.findOne({ where: { id } })
  }

  async findByAccount(accountId: string): Promise<EscrowContract[]> {
    return this.repository.find({
      where: [{ sourceAccountId: accountId }, { destinationAccountId: accountId }],
      order: { createdAt: "DESC" },
    })
  }

  async updateStatus(id: string, status: EscrowStatus, additionalData?: any): Promise<void> {
    const updateData: any = { status }
    if (additionalData) {
      Object.assign(updateData, additionalData)
    }
    await this.repository.update({ id }, updateData)
  }

  async findExpiredContracts(): Promise<EscrowContract[]> {
    return this.repository
      .createQueryBuilder("escrow")
      .where("escrow.status = :status", { status: EscrowStatus.PENDING })
      .andWhere("escrow.expiresAt < :now", { now: new Date() })
      .getMany()
  }

  async findPendingContracts(): Promise<EscrowContract[]> {
    return this.repository.find({ where: { status: EscrowStatus.PENDING } })
  }
}
