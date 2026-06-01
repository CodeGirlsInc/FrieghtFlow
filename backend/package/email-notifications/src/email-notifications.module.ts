import { Module } from '@nestjs/common';
import { EmailNotificationsService } from './email-notifications.service';

@Module({
  providers: [EmailNotificationsService],
  exports: [EmailNotificationsService],
})
export class EmailNotificationsModule {}
