import { Injectable } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import { EmailProvider, type EmailConfiguration } from "../interfaces/email.interface"
import type { BaseEmailProvider } from "../providers/base-email.provider"
import { SendGridProvider } from "../providers/sendgrid.provider"
import { MailgunProvider } from "../providers/mailgun.provider"

@Injectable()
export class EmailProviderFactory {
  constructor(private configService: ConfigService) {}

  createProvider(providerType: EmailProvider): BaseEmailProvider {
    const config = this.configService.get<EmailConfiguration>("email")

    switch (providerType) {
      case EmailProvider.SENDGRID:
        return new SendGridProvider(config)
      case EmailProvider.MAILGUN:
        return new MailgunProvider(config)
      case EmailProvider.SES:
        // return new SESProvider(config)
        throw new Error("SES provider not implemented yet")
      case EmailProvider.POSTMARK:
        // return new PostmarkProvider(config)
        throw new Error("Postmark provider not implemented yet")
      case EmailProvider.RESEND:
        // return new ResendProvider(config)
        throw new Error("Resend provider not implemented yet")
      case EmailProvider.SMTP:
        // return new SMTPProvider(config)
        throw new Error("SMTP provider not implemented yet")
      default:
        throw new Error(`Unsupported email provider: ${providerType}`)
    }
  }
}
