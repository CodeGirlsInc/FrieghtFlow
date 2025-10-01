import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { EmailService } from './channels/email.service';
import { InAppService } from './channels/in-app.service';
import { NotificationEventListener } from './listeners/notification.listener';

@Module({
  imports: [ConfigModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    EmailService,
    InAppService,
    NotificationEventListener,
  ],
})
export class NotificationsModule {}