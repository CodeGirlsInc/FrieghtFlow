import type { EmailMessage, EmailConfiguration } from "../interfaces/email.interface"

export abstract class BaseEmailProvider {
  protected config: EmailConfiguration

  constructor(config: EmailConfiguration) {
    this.config = config
  }

  abstract sendSingle(message: EmailMessage): Promise<string>
  abstract sendBulk(messages: EmailMessage[]): Promise<string[]>
  abstract validateWebhook(payload: string, signature: string): Promise<boolean>

  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  protected sanitizeEmail(email: string): string {
    return email.toLowerCase().trim()
  }

  protected validateMessage(message: EmailMessage): void {
    if (!message.to || (Array.isArray(message.to) && message.to.length === 0)) {
      throw new Error("Email message must have at least one recipient")
    }

    if (!message.subject) {
      throw new Error("Email message must have a subject")
    }

    if (!message.htmlContent && !message.textContent) {
      throw new Error("Email message must have either HTML or text content")
    }

    const recipients = Array.isArray(message.to) ? message.to : [message.to]
    for (const email of recipients) {
      if (!this.validateEmail(email)) {
        throw new Error(`Invalid email address: ${email}`)
      }
    }
  }
}
