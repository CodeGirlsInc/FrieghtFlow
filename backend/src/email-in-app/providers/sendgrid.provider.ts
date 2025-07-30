import { Injectable, Logger } from "@nestjs/common"
import * as sgMail from "@sendgrid/mail"
import type { EmailMessage, EmailAttachment, EmailConfiguration } from "../interfaces/email.interface"
import { BaseEmailProvider } from "./base-email.provider"

@Injectable()
export class SendGridProvider extends BaseEmailProvider {
  private readonly logger = new Logger(SendGridProvider.name)

  constructor(config: EmailConfiguration) {
    super(config)
    sgMail.setApiKey(config.apiKey)
  }

  async sendSingle(message: EmailMessage): Promise<string> {
    try {
      const sgMessage = this.transformMessage(message)
      const [response] = await sgMail.send(sgMessage)

      this.logger.debug(`Email sent via SendGrid`, {
        messageId: response.headers["x-message-id"],
        to: message.to,
        subject: message.subject,
      })

      return response.headers["x-message-id"] as string
    } catch (error) {
      this.logger.error("Failed to send email via SendGrid", error)
      throw error
    }
  }

  async sendBulk(messages: EmailMessage[]): Promise<string[]> {
    try {
      const sgMessages = messages.map((msg) => this.transformMessage(msg))
      const responses = await sgMail.send(sgMessages)

      return responses.map((response) => response[0].headers["x-message-id"] as string)
    } catch (error) {
      this.logger.error("Failed to send bulk emails via SendGrid", error)
      throw error
    }
  }

  private transformMessage(message: EmailMessage): sgMail.MailDataRequired {
    const sgMessage: sgMail.MailDataRequired = {
      to: Array.isArray(message.to) ? message.to : [message.to],
      from: {
        email: message.from || this.config.fromEmail,
        name: this.config.fromName,
      },
      subject: message.subject,
      html: message.htmlContent,
      text: message.textContent,
      replyTo: message.replyTo || this.config.replyToEmail,
      categories: [message.category],
      customArgs: {
        messageId: message.id,
        userId: message.userId,
        organizationId: message.organizationId,
        shipmentId: message.shipmentId,
        orderId: message.orderId,
        ...message.metadata,
      },
    }

    if (message.cc?.length) {
      sgMessage.cc = Array.isArray(message.cc) ? message.cc : [message.cc]
    }

    if (message.bcc?.length) {
      sgMessage.bcc = Array.isArray(message.bcc) ? message.bcc : [message.bcc]
    }

    if (message.attachments?.length) {
      sgMessage.attachments = message.attachments.map(this.transformAttachment)
    }

    if (message.scheduledAt) {
      sgMessage.sendAt = Math.floor(message.scheduledAt.getTime() / 1000)
    }

    if (message.trackingEnabled) {
      sgMessage.trackingSettings = {
        clickTracking: { enable: true },
        openTracking: { enable: true },
        subscriptionTracking: { enable: true },
      }
    }

    return sgMessage
  }

  private transformAttachment(attachment: EmailAttachment): sgMail.AttachmentData {
    return {
      filename: attachment.filename,
      content: Buffer.isBuffer(attachment.content)
        ? attachment.content.toString("base64")
        : Buffer.from(attachment.content).toString("base64"),
      type: attachment.contentType,
      disposition: attachment.disposition || "attachment",
      contentId: attachment.contentId,
    }
  }

  async validateWebhook(payload: string, signature: string): Promise<boolean> {
    // SendGrid webhook validation logic
    const crypto = require("crypto")
    const expectedSignature = crypto.createHmac("sha256", this.config.webhookSecret).update(payload).digest("base64")

    return signature === expectedSignature
  }
}
