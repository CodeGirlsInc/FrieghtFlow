import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { INotificationProvider } from './notification-provider.interface';

@Injectable()
export class EmailProvider implements INotificationProvider {
  private readonly logger = new Logger(EmailProvider.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const emailConfig = {
      host: this.configService.get('SMTP_HOST'),
      port: parseInt(this.configService.get('SMTP_PORT', '587')),
      secure: this.configService.get('SMTP_SECURE', 'false') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    };

    // Allow testing with null transporter
    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(emailConfig);
    }
  }

  async send(
    recipient: string,
    subject: string,
    body: string,
    metadata?: Record<string, any>,
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      this.logger.warn('Email provider not configured, skipping email send');
      return false;
    }

    try {
      const mailOptions = {
        from: this.configService.get('SMTP_FROM_EMAIL'),
        to: recipient,
        subject,
        html: body,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${recipient}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  isConfigured(): boolean {
    return (
      !!this.configService.get('SMTP_HOST') &&
      !!this.configService.get('SMTP_USER') &&
      !!this.configService.get('SMTP_PASSWORD') &&
      !!this.transporter
    );
  }
}
