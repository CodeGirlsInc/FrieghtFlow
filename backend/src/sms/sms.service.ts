import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client: ReturnType<typeof Twilio>;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const accountSid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.config.get<string>('TWILIO_AUTH_TOKEN');
    this.from = this.config.get<string>('TWILIO_PHONE_NUMBER', '');
    this.client = Twilio(accountSid, authToken);
  }

  async send(to: string, body: string): Promise<void> {
    try {
      await this.client.messages.create({ from: this.from, to, body });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to send SMS to ${to}: ${msg}`);
    }
  }
}
