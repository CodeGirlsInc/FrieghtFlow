import { Process } from "@nestjs/bull"
import type { Job } from "bull"
import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { EmailMessageEntity } from "../entities/email-message.entity"
import type { EmailProviderFactory } from "../factories/email-provider.factory"
import type { ConfigService } from "@nestjs/config"
import { DeliveryStatus, type EmailConfiguration } from "../interfaces/email.interface"
import type { LoggerService } from "../../logger/services/logger.service"

@Injectable()
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name)
  private readonly config: EmailConfiguration
  private readonly provider: any
  private messageRepository: Repository<EmailMessageEntity>

  constructor(emailProviderFactory: EmailProviderFactory, configService: ConfigService, loggerService: LoggerService) {
    this.config = configService.get<EmailConfiguration>("email")
    this.provider = emailProviderFactory.createProvider(this.config.provider)
    this.messageRepository = emailProviderFactory.getMessageRepository()
  }

  @Process("send-email")
  async handleSendEmail(job: Job<{ messageId: string }>) {
    const { messageId } = job.data

    try {
      const message = await this.messageRepository.findOne({ where: { id: messageId } })
      if (!message) {
        throw new Error(`Message with ID ${messageId} not found`)
      }

      // Check if message is still pending
      if (message.status !== DeliveryStatus.PENDING) {
        this.logger.warn(`Message ${messageId} is not in pending status: ${message.status}`)
        return
      }

      // Check if message has expired
      if (message.expiresAt && message.expiresAt < new Date()) {
        message.status = DeliveryStatus.EXPIRED
        await this.messageRepository.save(message)
        this.logger.warn(`Message ${messageId} has expired`)
        return
      }

      // Send the email
      const providerMessageId = await this.provider.sendSingle(message)

      // Update message status
      message.providerMessageId = providerMessageId
      message.status = DeliveryStatus.SENT
      message.sentAt = new Date()
      message.attempts += 1
      message.lastAttemptAt = new Date()

      await this.messageRepository.save(message)

      this.logger.info("Email sent successfully via queue", {
        module: "EmailProcessor",
        messageId,
        providerMessageId,
        to: message.to,
        category: message.category,
      })
    } catch (error) {
      await this.handleJobError(messageId, error)
      throw error
    }
  }

  @Process("send-bulk-email")
  async handleSendBulkEmail(job: Job<{ messageIds: string[] }>) {
    const { messageIds } = job.data

    try {
      const messages = await this.messageRepository.findByIds(messageIds)
      const pendingMessages = messages.filter((msg) => msg.status === DeliveryStatus.PENDING)

      if (pendingMessages.length === 0) {
        this.logger.warn("No pending messages found for bulk send")
        return
      }

      // Send in batches
      const batchSize = this.config.batchSize
      for (let i = 0; i < pendingMessages.length; i += batchSize) {
        const batch = pendingMessages.slice(i, i + batchSize)

        try {
          const providerMessageIds = await this.provider.sendBulk(batch)

          // Update message statuses
          for (let j = 0; j < batch.length; j++) {
            const message = batch[j]
            message.providerMessageId = providerMessageIds[j]
            message.status = DeliveryStatus.SENT
            message.sentAt = new Date()
            message.attempts += 1
            message.lastAttemptAt = new Date()
          }

          await this.messageRepository.save(batch)

          this.logger.info("Bulk emails sent successfully", {
            module: "EmailProcessor",
            batchSize: batch.length,
            totalBatches: Math.ceil(pendingMessages.length / batchSize),
          })
        } catch (error) {
          // Handle batch error
          for (const message of batch) {
            await this.handleJobError(message.id, error)
          }
        }

        // Rate limiting between batches
        if (i + batchSize < pendingMessages.length) {
          await this.delay(1000 / this.config.rateLimitPerSecond)
        }
      }
    } catch (error) {
      this.logger.error("Bulk email job failed", error, {
        module: "EmailProcessor",
        messageIds,
      })
      throw error
    }
  }

  @Process("retry-failed-email")
  async handleRetryFailedEmail(job: Job<{ messageId: string }>) {
    const { messageId } = job.data

    try {
      const message = await this.messageRepository.findOne({ where: { id: messageId } })
      if (!message) {
        throw new Error(`Message with ID ${messageId} not found`)
      }

      if (message.status !== DeliveryStatus.FAILED && message.status !== DeliveryStatus.PENDING) {
        this.logger.warn(`Message ${messageId} is not in failed/pending status: ${message.status}`)
        return
      }

      if (message.attempts >= this.config.maxRetries) {
        this.logger.warn(`Message ${messageId} has exceeded max retry attempts`)
        return
      }

      // Reset status for retry
      message.status = DeliveryStatus.PENDING
      message.nextRetryAt = null

      // Send the email
      const providerMessageId = await this.provider.sendSingle(message)

      message.providerMessageId = providerMessageId
      message.status = DeliveryStatus.SENT
      message.sentAt = new Date()
      message.attempts += 1
      message.lastAttemptAt = new Date()

      await this.messageRepository.save(message)

      this.logger.info("Email retry successful", {
        module: "EmailProcessor",
        messageId,
        attempts: message.attempts,
      })
    } catch (error) {
      await this.handleJobError(messageId, error)
      throw error
    }
  }

  private async handleJobError(messageId: string, error: any): Promise<void> {
    try {
      const message = await this.messageRepository.findOne({ where: { id: messageId } })
      if (!message) return

      message.status = DeliveryStatus.FAILED
      message.errorMessage = error.message
      message.attempts += 1
      message.lastAttemptAt = new Date()

      if (message.attempts < this.config.maxRetries) {
        message.nextRetryAt = new Date(Date.now() + this.config.retryDelay * Math.pow(2, message.attempts - 1))
        message.status = DeliveryStatus.PENDING
      }

      await this.messageRepository.save(message)

      this.logger.error("Email job failed", error, {
        module: "EmailProcessor",
        messageId,
        attempts: message.attempts,
        nextRetryAt: message.nextRetryAt,
      })
    } catch (saveError) {
      this.logger.error("Failed to save error state", saveError, {
        module: "EmailProcessor",
        messageId,
      })
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
