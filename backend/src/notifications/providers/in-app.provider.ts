import { Injectable, Logger } from '@nestjs/common';
import { INotificationProvider } from './notification-provider.interface';

@Injectable()
export class InAppProvider implements INotificationProvider {
  private readonly logger = new Logger(InAppProvider.name);

  async send(
    recipient: string,
    subject: string,
    body: string,
    metadata?: Record<string, any>,
  ): Promise<boolean> {
    try {
      // In-app notifications are stored directly in the database
      // This provider doesn't need to do anything as the notification
      // is already persisted by the notification service
      this.logger.log(`In-app notification recorded for user ${recipient}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to store in-app notification: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  isConfigured(): boolean {
    // In-app notifications are always available
    return true;
  }
}
