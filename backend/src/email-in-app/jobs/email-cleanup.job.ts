import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { type Repository, LessThan } from "typeorm"
import { EmailMessageEntity } from "../entities/email-message.entity"
import { DeliveryStatus } from "../interfaces/email.interface"
import type { LoggerService } from "../../logger/services/logger.service"

@Injectable()
export class EmailCleanupJob {
  private readonly logger = new Logger(EmailCleanupJob.name)

  constructor(
    private messageRepository: Repository<EmailMessageEntity>,
    private loggerService: LoggerService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldEmails(): Promise<void> {
    try {
      this.logger.log("Starting email cleanup job...")

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      // Archive old delivered emails (30+ days)
      const archivedResult = await this.messageRepository
        .createQueryBuilder()
        .update(EmailMessageEntity)
        .set({
          metadata: () => "jsonb_set(COALESCE(metadata, '{}'), '{archived}', 'true')",
          updatedAt: new Date(),
        })
        .where("status = :status", { status: DeliveryStatus.DELIVERED })
        .andWhere("deliveredAt < :thirtyDaysAgo", { thirtyDaysAgo })
        .andWhere("(metadata->>'archived')::boolean IS NOT TRUE")
        .execute()

      // Delete very old emails (90+ days) except failed ones for debugging
      const deletedResult = await this.messageRepository
        .createQueryBuilder()
        .delete()
        .from(EmailMessageEntity)
        .where("createdAt < :ninetyDaysAgo", { ninetyDaysAgo })
        .andWhere("status NOT IN (:...keepStatuses)", {
          keepStatuses: [DeliveryStatus.FAILED, DeliveryStatus.BOUNCED],
        })
        .execute()

      // Clean up expired scheduled emails
      const expiredResult = await this.messageRepository
        .createQueryBuilder()
        .update(EmailMessageEntity)
        .set({
          status: DeliveryStatus.EXPIRED,
          updatedAt: new Date(),
        })
        .where("status = :status", { status: DeliveryStatus.PENDING })
        .andWhere("expiresAt < :now", { now: new Date() })
        .execute()

      this.loggerService.info("Email cleanup job completed", {
        module: "EmailCleanupJob",
        operation: "cleanupOldEmails",
        archivedEmails: archivedResult.affected || 0,
        deletedEmails: deletedResult.affected || 0,
        expiredEmails: expiredResult.affected || 0,
      })

      this.logger.log(
        `Email cleanup completed: ${archivedResult.affected || 0} archived, ${deletedResult.affected || 0} deleted, ${expiredResult.affected || 0} expired`,
      )
    } catch (error) {
      this.loggerService.error("Email cleanup job failed", error, {
        module: "EmailCleanupJob",
        operation: "cleanupOldEmails",
      })
      throw error
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async retryFailedEmails(): Promise<void> {
    try {
      const now = new Date()

      // Find failed emails that are ready for retry
      const emailsToRetry = await this.messageRepository.find({
        where: {
          status: DeliveryStatus.PENDING,
          nextRetryAt: LessThan(now),
        },
        take: 100, // Limit to prevent overwhelming the system
      })

      if (emailsToRetry.length === 0) {
        return
      }

      this.logger.log(`Found ${emailsToRetry.length} emails ready for retry`)

      // Reset retry timestamp to prevent immediate re-processing
      for (const email of emailsToRetry) {
        email.nextRetryAt = null
        await this.messageRepository.save(email)
      }

      // Add to queue for retry (this would integrate with your queue system)
      // For now, we'll just log the action
      this.loggerService.info("Emails queued for retry", {
        module: "EmailCleanupJob",
        operation: "retryFailedEmails",
        count: emailsToRetry.length,
        messageIds: emailsToRetry.map((e) => e.id),
      })
    } catch (error) {
      this.loggerService.error("Failed email retry job failed", error, {
        module: "EmailCleanupJob",
        operation: "retryFailedEmails",
      })
    }
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async generateEmailMetrics(): Promise<void> {
    try {
      const last24Hours = new Date()
      last24Hours.setHours(last24Hours.getHours() - 24)

      const metrics = await this.messageRepository
        .createQueryBuilder("email")
        .select([
          "COUNT(*) as total_sent",
          "COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered",
          "COUNT(CASE WHEN status = 'bounced' THEN 1 END) as bounced",
          "COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed",
          "COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened",
          "COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked",
        ])
        .where("created_at >= :last24Hours", { last24Hours })
        .getRawOne()

      this.loggerService.info("Email metrics generated", {
        module: "EmailCleanupJob",
        operation: "generateEmailMetrics",
        period: "last_24_hours",
        metrics: {
          totalSent: Number.parseInt(metrics.total_sent),
          delivered: Number.parseInt(metrics.delivered),
          bounced: Number.parseInt(metrics.bounced),
          failed: Number.parseInt(metrics.failed),
          opened: Number.parseInt(metrics.opened),
          clicked: Number.parseInt(metrics.clicked),
          deliveryRate: metrics.total_sent > 0 ? ((metrics.delivered / metrics.total_sent) * 100).toFixed(2) : 0,
          openRate: metrics.delivered > 0 ? ((metrics.opened / metrics.delivered) * 100).toFixed(2) : 0,
          clickRate: metrics.opened > 0 ? ((metrics.clicked / metrics.opened) * 100).toFixed(2) : 0,
        },
      })
    } catch (error) {
      this.loggerService.error("Email metrics generation failed", error, {
        module: "EmailCleanupJob",
        operation: "generateEmailMetrics",
      })
    }
  }
}
