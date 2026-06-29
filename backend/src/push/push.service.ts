import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(private readonly config: ConfigService) {
    webpush.setVapidDetails(
      'mailto:' + this.config.get<string>('WEB_PUSH_EMAIL', ''),
      this.config.get<string>('WEB_PUSH_PUBLIC_KEY', ''),
      this.config.get<string>('WEB_PUSH_PRIVATE_KEY', ''),
    );
  }

  getPublicKey(): string {
    return this.config.get<string>('WEB_PUSH_PUBLIC_KEY', '');
  }

  async sendNotification(
    subscription: webpush.PushSubscription,
    payload: object,
  ): Promise<void> {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn('Failed to send push notification: ' + msg);
    }
  }
}
