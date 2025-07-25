import { Injectable, Logger, BadRequestException } from "@nestjs/common"
import { type Repository, MoreThan, Between } from "typeorm"
import type { ConfigService } from "@nestjs/config"
import type { EmailMessageEntity } from "../entities/email-message.entity"
import type { EmailUnsubscribeEntity } from "../entities/email-unsubscribe.entity"
import {
  type EmailMessage,
  type EmailConfiguration,
  type IEmailService,
  type EmailDeliveryStatus,
  type EmailMetrics,
  DeliveryStatus,
  type EmailCategory,
  EmailPriority,
} from "../interfaces/email.interface"
import type { TemplateService } from "./template.service"
import type { EmailProviderFactory } from "../factories/email-provider.factory"
import type { BaseEmailProvider } from "../providers/base-email.provider"
import type { Queue } from "bull"
import type { LoggerService } from "../../logger/services/logger.service"

@Injectable()
export class EmailService implements IEmailService {
  private readonly logger = new Logger(EmailService.name)
  private readonly config: EmailConfiguration
  private readonly provider: BaseEmailProvider

  constructor(
    private messageRepository: Repository<EmailMessageEntity>,
    private unsubscribeRepository: Repository<EmailUnsubscribeEntity>,
    private configService: ConfigService,
    private templateService: TemplateService,
    private emailProviderFactory: EmailProviderFactory,
    private emailQueue: Queue,
    private loggerService: LoggerService,
  ) {
    this.config = this.configService.get<EmailConfiguration>("email")
    this.provider = this.emailProviderFactory.createProvider(this.config.provider)
  }

  async sendEmail(message: EmailMessage): Promise<string> {
    try {
      // Validate message
      this.validateMessage(message)

      // Check unsubscribe status
      await this.checkUnsubscribeStatus(message)

      // Save message to database
      const savedMessage = await this.saveMessage(message)

      // Send immediately or queue based on priority and schedule
      if (message.scheduledAt && message.scheduledAt > new Date()) {
        await this.scheduleEmail(savedMessage)
        return savedMessage.id
      }

      if (message.priority === EmailPriority.URGENT) {
        return await this.sendImmediately(savedMessage)
      } else {
        await this.queueEmail(savedMessage)
        return savedMessage.id
      }
    } catch (error) {
      this.loggerService.error("Failed to send email", error, {
        module: "EmailService",
        operation: "sendEmail",
        to: message.to,
        category: message.category,
      })
      throw error
    }
  }

  async sendBulkEmails(messages: EmailMessage[]): Promise<string[]> {
    const results: string[] = []

    // Process in batches
    const batchSize = this.config.batchSize
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize)
      const batchResults = await Promise.allSettled(batch.map((message) => this.sendEmail(message)))

      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          results.push(result.value)
        } else {
          this.logger.error(`Failed to send bulk email ${i + index}`, result.reason)
          results.push(null) // or handle error differently
        }
      })

      // Rate limiting
      if (i + batchSize < messages.length) {
        await this.delay(1000 / this.config.rateLimitPerSecond)
      }
    }

    return results
  }

  async sendTemplateEmail(templateId: string, to: string | string[], data: Record<string, any>): Promise<string> {
    try {
      // Render template
      const rendered = await this.templateService.renderTemplate(templateId, data)
      const template = await this.templateService.getTemplate(templateId)

      const message: EmailMessage = {
        to,
        subject: rendered.subject,
        htmlContent: rendered.htmlContent,
        textContent: rendered.textContent,
        templateId,
        templateData: data,
        category: template.category,
        priority: template.priority,
        trackingEnabled: true,
        ...data.messageOverrides, // Allow overriding message properties
      }

      return await this.sendEmail(message)
    } catch (error) {
      this.loggerService.error("Failed to send template email", error, {
        module: "EmailService",
        operation: "sendTemplateEmail",
        templateId,
        to,
      })
      throw error
    }
  }

  async scheduleEmail(message: EmailMessage, scheduledAt: Date): Promise<string> {
    message.scheduledAt = scheduledAt
    return await this.sendEmail(message)
  }

  async cancelScheduledEmail(messageId: string): Promise<boolean> {
    try {
      const message = await this.messageRepository.findOne({ where: { id: messageId } })
      if (!message) {
        return false
      }

      if (message.status !== DeliveryStatus.PENDING || !message.scheduledAt) {
        return false
      }

      message.status = DeliveryStatus.CANCELLED
      await this.messageRepository.save(message)

      // Remove from queue if queued
      await this.emailQueue.removeJobs(messageId)

      this.loggerService.info("Cancelled scheduled email", {
        module: "EmailService",
        messageId,
        originalScheduledAt: message.scheduledAt,
      })

      return true
    } catch (error) {
      this.loggerService.error("Failed to cancel scheduled email", error, {
        module: "EmailService",
        messageId,
      })
      return false
    }
  }

  async getDeliveryStatus(messageId: string): Promise<EmailDeliveryStatus> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } })
    if (!message) {
      throw new BadRequestException(`Message with ID ${messageId} not found`)
    }

    return {
      messageId: message.id,
      status: message.status,
      deliveredAt: message.deliveredAt,
      openedAt: message.openedAt,
      clickedAt: message.clickedAt,
      bouncedAt: message.bouncedAt,
      bounceReason: message.bounceReason,
      unsubscribedAt: message.unsubscribedAt,
      spamReportedAt: message.spamReportedAt,
      errorMessage: message.errorMessage,
      attempts: message.attempts,
      lastAttemptAt: message.lastAttemptAt,
      nextRetryAt: message.nextRetryAt,
    }
  }

  async getMetrics(startDate?: Date, endDate?: Date): Promise<EmailMetrics> {
    const whereClause: any = {}

    if (startDate && endDate) {
      whereClause.createdAt = Between(startDate, endDate)
    } else if (startDate) {
      whereClause.createdAt = MoreThan(startDate)
    }

    const [totalSent, totalDelivered, totalOpened, totalClicked, totalBounced, totalSpamReports, totalUnsubscribed] =
      await Promise.all([
        this.messageRepository.count({ where: { ...whereClause, status: DeliveryStatus.SENT } }),
        this.messageRepository.count({ where: { ...whereClause, status: DeliveryStatus.DELIVERED } }),
        this.messageRepository.count({ where: { ...whereClause, openedAt: MoreThan(new Date(0)) } }),
        this.messageRepository.count({ where: { ...whereClause, clickedAt: MoreThan(new Date(0)) } }),
        this.messageRepository.count({ where: { ...whereClause, status: DeliveryStatus.BOUNCED } }),
        this.messageRepository.count({ where: { ...whereClause, status: DeliveryStatus.SPAM_REPORTED } }),
        this.messageRepository.count({ where: { ...whereClause, status: DeliveryStatus.UNSUBSCRIBED } }),
      ])

    // Calculate average delivery time
    const deliveredMessages = await this.messageRepository.find({
      where: { ...whereClause, status: DeliveryStatus.DELIVERED },
      select: ["sentAt", "deliveredAt"],
    })

    const averageDeliveryTime =
      deliveredMessages.length > 0
        ? deliveredMessages.reduce((sum, msg) => {
            if (msg.sentAt && msg.deliveredAt) {
              return sum + (msg.deliveredAt.getTime() - msg.sentAt.getTime())
            }
            return sum
          }, 0) / deliveredMessages.length
        : 0

    return {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalBounced,
      totalSpamReports,
      totalUnsubscribed,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
      clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
      bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
      spamRate: totalSent > 0 ? (totalSpamReports / totalSent) * 100 : 0,
      unsubscribeRate: totalDelivered > 0 ? (totalUnsubscribed / totalDelivered) * 100 : 0,
      averageDeliveryTime,
    }
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  async unsubscribe(email: string, category?: EmailCategory): Promise<boolean> {
    try {
      const unsubscribe = this.unsubscribeRepository.create({
        email: email.toLowerCase().trim(),
        category,
        unsubscribedAt: new Date(),
      })

      await this.unsubscribeRepository.save(unsubscribe)

      this.loggerService.audit("EMAIL_UNSUBSCRIBE", "email_unsubscribes", {
        email,
        category,
        operation: "unsubscribe",
      })

      return true
    } catch (error) {
      this.loggerService.error("Failed to unsubscribe email", error, {
        module: "EmailService",
        email,
        category,
      })
      return false
    }
  }

  async isUnsubscribed(email: string, category?: EmailCategory): Promise<boolean> {
    const whereClause: any = { email: email.toLowerCase().trim() }
    if (category) {
      whereClause.category = category
    }

    const unsubscribe = await this.unsubscribeRepository.findOne({ where: whereClause })
    return !!unsubscribe
  }

  private async saveMessage(message: EmailMessage): Promise<EmailMessageEntity> {
    const entity = this.messageRepository.create({
      ...message,
      to: Array.isArray(message.to) ? message.to : [message.to],
      cc: message.cc ? (Array.isArray(message.cc) ? message.cc : [message.cc]) : undefined,
      bcc: message.bcc ? (Array.isArray(message.bcc) ? message.bcc : [message.bcc]) : undefined,
      from: message.from || this.config.fromEmail,
      status: DeliveryStatus.PENDING,
      attempts: 0,
    })

    return await this.messageRepository.save(entity)
  }

  private async sendImmediately(message: EmailMessageEntity): Promise<string> {
    try {
      const providerMessageId = await this.provider.sendSingle(message)

      message.providerMessageId = providerMessageId
      message.status = DeliveryStatus.SENT
      message.sentAt = new Date()
      message.attempts += 1
      message.lastAttemptAt = new Date()

      await this.messageRepository.save(message)

      this.loggerService.info("Email sent successfully", {
        module: "EmailService",
        messageId: message.id,
        providerMessageId,
        to: message.to,
        category: message.category,
      })

      return message.id
    } catch (error) {
      await this.handleSendError(message, error)
      throw error
    }
  }

  private async queueEmail(message: EmailMessageEntity): Promise<void> {
    const delay = message.scheduledAt ? message.scheduledAt.getTime() - Date.now() : 0

    await this.emailQueue.add(
      "send-email",
      { messageId: message.id },
      {
        delay: Math.max(0, delay),
        attempts: this.config.maxRetries,
        backoff: {
          type: "exponential",
          delay: this.config.retryDelay,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    )
  }

  private async scheduleEmail(message: EmailMessageEntity): Promise<void> {
    await this.queueEmail(message)
  }

  private async handleSendError(message: EmailMessageEntity, error: any): Promise<void> {
    message.status = DeliveryStatus.FAILED
    message.errorMessage = error.message
    message.attempts += 1
    message.lastAttemptAt = new Date()

    if (message.attempts < this.config.maxRetries) {
      message.nextRetryAt = new Date(Date.now() + this.config.retryDelay * Math.pow(2, message.attempts - 1))
      message.status = DeliveryStatus.PENDING
    }

    await this.messageRepository.save(message)

    this.loggerService.error("Email send failed", error, {
      module: "EmailService",
      messageId: message.id,
      attempts: message.attempts,
      nextRetryAt: message.nextRetryAt,
    })
  }

  private validateMessage(message: EmailMessage): void {
    if (!message.to || (Array.isArray(message.to) && message.to.length === 0)) {
      throw new BadRequestException("Email message must have at least one recipient")
    }

    if (!message.subject) {
      throw new BadRequestException("Email message must have a subject")
    }

    if (!message.htmlContent && !message.textContent && !message.templateId) {
      throw new BadRequestException("Email message must have content or template")
    }

    const recipients = Array.isArray(message.to) ? message.to : [message.to]
    for (const email of recipients) {
      if (!this.validateEmail(email)) {
        throw new BadRequestException(`Invalid email address: ${email}`)
      }
    }
  }

  private async checkUnsubscribeStatus(message: EmailMessage): Promise<void> {
    const recipients = Array.isArray(message.to) ? message.to : [message.to]

    for (const email of recipients) {
      const isUnsubscribed = await this.isUnsubscribed(email, message.category)
      if (isUnsubscribed) {
        throw new BadRequestException(`Recipient ${email} has unsubscribed from ${message.category} emails`)
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
