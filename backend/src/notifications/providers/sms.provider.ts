import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INotificationProvider } from './notification-provider.interface';

@Injectable()
export class SmsProvider implements INotificationProvider {
  private readonly logger = new Logger(SmsProvider.name);
  private twilioClient: any;

  constructor(private configService: ConfigService) {
    this.initializeTwilio();
  }

  private initializeTwilio(): void {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken) {
      try {
        // Lazy import for optional dependency
        const twilio = require('twilio');
        this.twilioClient = twilio(accountSid, authToken);
      } catch (error) {
        this.logger.warn(
          'Twilio not installed. SMS notifications will be skipped.',
        );
      }
    }
  }

  async send(
    recipient: string,
    subject: string,
    body: string,
    metadata?: Record<string, any>,
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      this.logger.warn('SMS provider not configured, skipping SMS send');
      return false;
    }

    try {
      const message = await this.twilioClient.messages.create({
        body: `${subject}: ${body}`,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: recipient,
      });

      this.logger.log(`SMS sent successfully: ${message.sid}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to ${recipient}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  isConfigured(): boolean {
    return (
      !!this.configService.get('TWILIO_ACCOUNT_SID') &&
      !!this.configService.get('TWILIO_AUTH_TOKEN') &&
      !!this.configService.get('TWILIO_PHONE_NUMBER') &&
      !!this.twilioClient
    );
  }
}
