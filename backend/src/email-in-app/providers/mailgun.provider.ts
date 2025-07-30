import { Injectable, Logger } from "@nestjs/common"
import * as Mailgun from "mailgun.js"
import type { EmailMessage, EmailConfiguration } from "../interfaces/email.interface"
import { BaseEmailProvider } from "./base-email.provider"

@Injectable()
export class MailgunProvider extends BaseEmailProvider {
  private readonly logger = new Logger(MailgunProvider.name)
  private mailgun: any

  constructor(config: EmailConfiguration) {
    super(config)
    const mg = new Mailgun.default(FormData)
    this.mailgun = mg.client({
      username: "api",
      key: config.apiKey,
      url: config.region === "eu" ? "https://api.eu.mailgun.net" : "https://api.mailgun.net",
    })
  }

  async sendSingle(message: EmailMessage): Promise<string> {
    try {
      const mgMessage = this.transformMessage(message)
      const response = await this.mailgun.messages.create(this.config.domain, mgMessage)

      this.logger.debug(`Email sent via Mailgun`, {
        messageId: response.id,
        to: message.to,
        subject: message.subject,
      })

      return response.id
    } catch (error) {
      this.logger.error("Failed to send email via Mailgun", error)
      throw error
    }
  }

  async sendBulk(messages: EmailMessage[]): Promise<string[]> {
    const results = await Promise.allSettled(messages.map((message) => this.sendSingle(message)))

    return results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value
      } else {
        this.logger.error(`Failed to send bulk email ${index}`, result.reason)
        throw result.reason
      }
    })
  }

  private transformMessage(message: EmailMessage): any {
    const mgMessage: any = {
      from: `${this.config.fromName} <${message.from || this.config.fromEmail}>`,
      to: Array.isArray(message.to) ? message.to.join(",") : message.to,
      subject: message.subject,
      html: message.htmlContent,
      text: message.textContent,
      "h:Reply-To": message.replyTo || this.config.replyToEmail,
      "o:tag": [message.category],
      "v:messageId": message.id,
      "v:userId": message.userId,
      "v:organizationId": message.organizationId,
    }

    if (message.cc?.length) {
      mgMessage.cc = Array.isArray(message.cc) ? message.cc.join(",") : message.cc
    }

    if (message.bcc?.length) {
      mgMessage.bcc = Array.isArray(message.bcc) ? message.bcc.join(",") : message.bcc
    }

    if (message.scheduledAt) {
      mgMessage["o:deliverytime"] = message.scheduledAt.toISOString()
    }

    if (message.trackingEnabled) {
      mgMessage["o:tracking"] = "yes"
      mgMessage["o:tracking-clicks"] = "yes"
      mgMessage["o:tracking-opens"] = "yes"
    }

    return mgMessage
  }

  async validateWebhook(payload: string, signature: string): Promise<boolean> {
    // Mailgun webhook validation logic
    const crypto = require("crypto")
    const hmac = crypto.createHmac("sha256", this.config.webhookSecret)
    hmac.update(payload)
    const expectedSignature = hmac.digest("hex")

    return signature === expectedSignature
  }
}
