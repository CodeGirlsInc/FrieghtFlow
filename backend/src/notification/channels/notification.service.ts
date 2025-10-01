import { Injectable } from '@nestjs/common';
import { EmailService } from './channels/email.service';
import { InAppService } from './channels/in-app.service';

export interface NotificationPayload {
  userId: string;
  userEmail: string; // The user's actual email address
  subject: string;
  emailBody: string; // HTML content for the email
  inAppMessage: string; // A shorter message for in-app notifications
  channels: ('email' | 'in-app')[];
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly emailService: EmailService,
    private readonly inAppService: InAppService,
  ) {}

  async send(payload: NotificationPayload) {
    if (payload.channels.includes('email')) {
      await this.emailService.sendEmail(
        payload.userEmail,
        payload.subject,
        payload.emailBody,
      );
    }
    if (payload.channels.includes('in-app')) {
      await this.inAppService.createInAppMessage(
        payload.userId,
        payload.inAppMessage,
      );
    }
  }
}