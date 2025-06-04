import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository, EntitySubscriberInterface, UpdateEvent, DataSource } from "typeorm"
import { Transaction } from "../entities/transaction.entity"
import { TransactionHistory } from "../entities/transaction-history.entity"

@Injectable()
export class TransactionHistorySubscriber implements EntitySubscriberInterface<Transaction> {
  private transactionHistoryRepository: Repository<TransactionHistory>

  constructor(
    @InjectRepository(TransactionHistory)
    transactionHistoryRepository: Repository<TransactionHistory>,
    dataSource: DataSource,
  ) {
    this.transactionHistoryRepository = transactionHistoryRepository
    dataSource.subscribers.push(this)
  }

  listenTo() {
    return Transaction
  }

  async afterUpdate(event: UpdateEvent<Transaction>): Promise<void> {
    if (!event.entity || !event.databaseEntity) {
      return
    }

    const changes = {}
    let hasChanges = false

    // Compare old and new values to detect changes
    for (const key in event.entity) {
      if (event.entity[key] !== undefined && event.databaseEntity[key] !== event.entity[key] && key !== "updatedAt") {
        changes[key] = {
          from: event.databaseEntity[key],
          to: event.entity[key],
        }
        hasChanges = true
      }
    }

    // If there are changes, create a history entry
    if (hasChanges) {
      const historyEntry = new TransactionHistory()
      historyEntry.transactionId = event.databaseEntity.id
      historyEntry.previousStatus = event.databaseEntity.status
      historyEntry.newStatus = event.entity.status || event.databaseEntity.status
      historyEntry.changes = changes
      historyEntry.changedBy = "system" // This would ideally come from context
      historyEntry.reason = "Transaction updated"

      await this.transactionHistoryRepository.save(historyEntry)
    }
  }
}
