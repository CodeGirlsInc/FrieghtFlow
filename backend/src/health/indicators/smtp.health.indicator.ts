import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorResult } from '@nestjs/terminus';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SmtpHealthIndicator {
  constructor(private configService: ConfigService) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const transporter = nodemailer.createTransport({
        host: this.configService.get<string>(
          'MAIL_HOST',
          'sandbox.smtp.mailtrap.io',
        ),
        port: this.configService.get<number>('MAIL_PORT', 2525),
        auth: {
          user: this.configService.get<string>('MAIL_USER'),
          pass: this.configService.get<string>('MAIL_PASS'),
        },
      });

      await transporter.verify();
      return {
        [key]: {
          status: 'up',
        },
      };
    } catch (error) {
      return {
        [key]: {
          status: 'down',
          message:
            error instanceof Error ? error.message : 'SMTP connection failed',
        },
      };
    }
  }
}
