import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import type { AuditService } from "../audit.service"
import type { AuditConfigService } from "../config/audit-config.service"

@Injectable()
export class AuditCleanupTask {
  private readonly logger = new Logger(AuditCleanupTask.name)

  constructor(
    private readonly auditService: AuditService,
    private readonly configService: AuditConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCleanupExpiredLogs() {
    if (!this.configService.enableAuditLogging) {
      return
    }

    try {
      this.logger.log("Starting cleanup of expired audit logs...")
      const deletedCount = await this.auditService.cleanupExpiredLogs()
      this.logger.log(`Cleanup completed. Deleted ${deletedCount} expired audit logs.`)
    } catch (error) {
      this.logger.error("Failed to cleanup expired audit logs", error)
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async handleCleanupOldLogs() {
    if (!this.configService.enableAuditLogging) {
      return
    }

    try {
      this.logger.log("Starting cleanup of old audit logs...")
      const deletedCount = await this.auditService.cleanupOldLogs()
      this.logger.log(`Cleanup completed. Deleted ${deletedCount} old audit logs.`)
    } catch (error) {
      this.logger.error("Failed to cleanup old audit logs", error)
    }
  }
}
