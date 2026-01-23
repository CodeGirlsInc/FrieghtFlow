import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { Notification, NotificationPreference } from './entities';
import {
  EmailProvider,
  SmsProvider,
  InAppProvider,
} from './providers';
import { NotificationTemplateService } from './templates/notification-template.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, NotificationPreference])],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    EmailProvider,
    SmsProvider,
    InAppProvider,
    NotificationTemplateService,
  ],
  exports: [NotificationService, NotificationTemplateService],
})
export class NotificationModule {}
