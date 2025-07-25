import { Injectable, type OnModuleDestroy } from "@nestjs/common"
import type { Repository } from "typeorm"
import { LogEntity } from "../entities/log.entity"
import type { LogEntry } from "../interfaces/logger.interface"
import * as os from "os"

@Injectable()
export class DatabaseTransport implements OnModuleDestroy {
  private buffer: LogEntity[] = []
  private flushTimer: NodeJS.Timeout
  private readonly batchSize: number
  private readonly flushInterval: number
  private readonly logRepository: Repository<LogEntity>

  constructor(logRepository: Repository<LogEntity>, batchSize = 100, flushInterval = 5000) {
    this.logRepository = logRepository
    this.batchSize = batchSize
    this.flushInterval = flushInterval
    this.startFlushTimer()
  }

  async log(entry: LogEntry): Promise<void> {
    const logEntity = this.createLogEntity(entry)
    this.buffer.push(logEntity)

    if (this.buffer.length >= this.batchSize) {
      await this.flush()
    }
  }

  private createLogEntity(entry: LogEntry): LogEntity {
    const entity = new LogEntity()

    entity.level = entry.level
    entity.message = entry.message
    entity.context = entry.context || {}
    entity.error = entry.error
      ? JSON.stringify({
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack,
        })
      : null
    entity.timestamp = new Date()
    entity.userId = entry.context?.userId
    entity.sessionId = entry.context?.sessionId
    entity.requestId = entry.context?.requestId
    entity.traceId = entry.context?.traceId
    entity.spanId = entry.context?.spanId
    entity.module = entry.context?.module
    entity.component = entry.context?.component
    entity.duration = entry.duration
    entity.tags = entry.tags || []
    entity.metadata = entry.context?.metadata || {}
    entity.environment = process.env.NODE_ENV || "development"
    entity.version = process.env.APP_VERSION || "1.0.0"
    entity.hostname = os.hostname()
    entity.processId = process.pid
    entity.threadId = this.getThreadId()
    entity.memoryUsage = process.memoryUsage().heapUsed
    entity.cpuUsage = process.cpuUsage().user

    return entity
  }

  private getThreadId(): string {
    // In Node.js, we can use worker_threads if available
    try {
      const { threadId } = require("worker_threads")
      return threadId?.toString() || "main"
    } catch {
      return "main"
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(async () => {
      if (this.buffer.length > 0) {
        await this.flush()
      }
    }, this.flushInterval)
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return
    }

    const logsToSave = [...this.buffer]
    this.buffer = []

    try {
      await this.logRepository.save(logsToSave)
    } catch (error) {
      console.error("Failed to save logs to database:", error)
      // Re-add failed logs to buffer for retry
      this.buffer.unshift(...logsToSave)
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    await this.flush()
  }

  async archiveOldLogs(daysOld = 30): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await this.logRepository
      .createQueryBuilder()
      .update(LogEntity)
      .set({ archived: true, archivedAt: new Date() })
      .where("timestamp < :cutoffDate AND archived = false", { cutoffDate })
      .execute()

    return result.affected || 0
  }

  async deleteArchivedLogs(daysOld = 90): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await this.logRepository
      .createQueryBuilder()
      .delete()
      .from(LogEntity)
      .where("archived = true AND archivedAt < :cutoffDate", { cutoffDate })
      .execute()

    return result.affected || 0
  }

  async getLogStatistics(): Promise<any> {
    const stats = await this.logRepository
      .createQueryBuilder("log")
      .select(["log.level", "COUNT(*) as count", "DATE(log.timestamp) as date"])
      .where("log.timestamp >= :startDate", {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      })
      .groupBy("log.level, DATE(log.timestamp)")
      .orderBy("date", "DESC")
      .getRawMany()

    return stats
  }
}
