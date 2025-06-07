import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { OperationalHistory, OperationType } from "../entities/operational-history.entity"

interface LogOperationDto {
  operationType: OperationType
  description: string
  metadata?: Record<string, any>
  relatedEntityId?: string
  performedBy?: string
}

@Injectable()
export class OperationalHistoryService {
  private readonly historyRepository: Repository<OperationalHistory>

  constructor(historyRepository: Repository<OperationalHistory>) {
    this.historyRepository = historyRepository
  }

  async logOperation(carrierId: string, logData: LogOperationDto): Promise<OperationalHistory> {
    const historyEntry = this.historyRepository.create({
      carrierId,
      ...logData,
    })

    return this.historyRepository.save(historyEntry)
  }

  async getCarrierHistory(carrierId: string, pagination: { page: number; limit: number }) {
    const { page = 1, limit = 20 } = pagination
    const skip = (page - 1) * limit

    const [history, total] = await this.historyRepository.findAndCount({
      where: { carrierId },
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    })

    return {
      data: history,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async getRecentActivity(carrierId: string, limit = 10): Promise<OperationalHistory[]> {
    return this.historyRepository.find({
      where: { carrierId },
      order: { createdAt: "DESC" },
      take: limit,
    })
  }

  async getOperationsByType(carrierId: string, operationType: OperationType): Promise<OperationalHistory[]> {
    return this.historyRepository.find({
      where: { carrierId, operationType },
      order: { createdAt: "DESC" },
    })
  }
}
