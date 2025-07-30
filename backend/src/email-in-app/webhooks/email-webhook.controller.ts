import { Controller, Post, Body, Headers, HttpCode, HttpStatus, BadRequestException } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"
import type { Repository } from "typeorm"
import type { EmailMessageEntity } from "../entities/email-message.entity"
import type { EmailProviderFactory } from "../factories/email-provider.factory"
import type { ConfigService } from "@nestjs/config"
import { DeliveryStatus, type EmailConfiguration, type EmailWebhookPayload } from "../interfaces/email.interface"
import type { LoggerService } from "../../logger/services/logger.service"

@ApiTags("Email Webhooks")
@Controller("webhooks/email")
export class EmailWebhookController {
  private readonly config: EmailConfiguration
  private readonly provider: any
  private messageRepository: Repository<EmailMessageEntity>

  constructor(emailProviderFactory: EmailProviderFactory, configService: ConfigService, loggerService: LoggerService) {
    this.config = configService.get<EmailConfiguration>("email")
    this.provider = this.emailProviderFactory.createProvider(this.config.provider)
    this.messageRepository = emailProviderFactory.getMessageRepository()
  }

  @Post("sendgrid")
  @ApiOperation({ summary: "Handle SendGrid webhook events" })
  @ApiResponse({ status: 200, description: "Webhook processed successfully" })
  @HttpCode(HttpStatus.OK)
  async handleSendGridWebhook(
    @Body() events: any[],
    @Headers('x-twilio-email-event-webhook-signature') signature: string,
  ) {
    try {
      // Validate webhook signature
      const isValid = await this.provider.validateWebhook(JSON.stringify(events), signature)
      if (!isValid) {
        throw new BadRequestException("Invalid webhook signature")
      }

      for (const event of events) {
        await this.processWebhookEvent({
          messageId: event.sg_message_id,
          event: event.event,
          timestamp: event.timestamp,
          email: event.email,
          category: event.category,
          reason: event.reason,
          url: event.url,
          userAgent: event.useragent,
          ip: event.ip,
          metadata: event,
        })
      }

      return { processed: events.length }
    } catch (error) {
      this.loggerService.error("SendGrid webhook processing failed", error, {
        module: "EmailWebhookController",
        eventsCount: events?.length,
      })
      throw error
    }
  }

  @Post("mailgun")
  @ApiOperation({ summary: "Handle Mailgun webhook events" })
  @ApiResponse({ status: 200, description: "Webhook processed successfully" })
  @HttpCode(HttpStatus.OK)
  async handleMailgunWebhook(@Body() event: any, @Headers('x-mailgun-signature-256') signature: string) {
    try {
      // Validate webhook signature
      const isValid = await this.provider.validateWebhook(JSON.stringify(event), signature)
      if (!isValid) {
        throw new BadRequestException("Invalid webhook signature")
      }

      await this.processWebhookEvent({
        messageId: event["message-id"],
        event: event.event,
        timestamp: event.timestamp,
        email: event.recipient,
        reason: event.reason,
        url: event.url,
        userAgent: event["user-agent"],
        ip: event["client-ip"],
        metadata: event,
      })

      return { processed: 1 }
    } catch (error) {
      this.loggerService.error("Mailgun webhook processing failed", error, {
        module: "EmailWebhookController",
      })
      throw error
    }
  }

  private async processWebhookEvent(payload: EmailWebhookPayload): Promise<void> {
    try {
      // Find message by provider message ID
      const message = await this.messageRepository.findOne({
        where: { providerMessageId: payload.messageId },
      })

      if (!message) {
        this.loggerService.warn("Message not found for webhook event", {
          module: "EmailWebhookController",
          providerMessageId: payload.messageId,
          event: payload.event,
        })
        return
      }

      // Update message based on event type
      const eventDate = new Date(payload.timestamp * 1000)

      switch (payload.event) {
        case "delivered":
          message.status = DeliveryStatus.DELIVERED
          message.deliveredAt = eventDate
          break

        case "open":
        case "opened":
          if (!message.openedAt) {
            message.openedAt = eventDate
          }
          break

        case "click":
        case "clicked":
          if (!message.clickedAt) {
            message.clickedAt = eventDate
          }
          break

        case "bounce":
        case "bounced":
          message.status = DeliveryStatus.BOUNCED
          message.bouncedAt = eventDate
          message.bounceReason = payload.reason
          break

        case "dropped":
        case "failed":
          message.status = DeliveryStatus.FAILED
          message.errorMessage = payload.reason
          break

        case "spam":
        case "spamreport":
          message.status = DeliveryStatus.SPAM_REPORTED
          message.spamReportedAt = eventDate
          break

        case "unsubscribe":
        case "unsubscribed":
          message.status = DeliveryStatus.UNSUBSCRIBED
          message.unsubscribedAt = eventDate
          break

        default:
          this.loggerService.debug("Unknown webhook event type", {
            module: "EmailWebhookController",
            event: payload.event,
            messageId: message.id,
          })
          return
      }

      await this.messageRepository.save(message)

      this.loggerService.info("Webhook event processed", {
        module: "EmailWebhookController",
        messageId: message.id,
        event: payload.event,
        status: message.status,
        email: payload.email,
      })
    } catch (error) {
      this.loggerService.error("Failed to process webhook event", error, {
        module: "EmailWebhookController",
        event: payload.event,
        messageId: payload.messageId,
      })
      throw error
    }
  }
}
