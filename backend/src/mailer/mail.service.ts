import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

export interface MailContext {
  recipientName?: string;
  trackingNumber?: string;
  origin?: string;
  destination?: string;
  ctaUrl?: string;
  ctaLabel?: string;
  unsubscribeUrl?: string;
  [key: string]: unknown;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async send(
    to: string,
    subject: string,
    template: string,
    context: MailContext,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Failed to send email "${template}" to ${to}: ${message}`,
      );
      throw err;
    }
  }

  sendAsync(
    to: string,
    subject: string,
    template: string,
    context: MailContext,
  ): void {
    this.send(to, subject, template, context).catch(() => void 0);
  }
}
