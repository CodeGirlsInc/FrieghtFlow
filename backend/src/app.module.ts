import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationsModule } from './notifications/notifications.module';
import { NotificationModule } from './notification/notification.module';
import { InAppModule } from './in-app-/in-app-.module';
import { InAppNotificationModule } from './in-app-notification/in-app-notification.module';

@Module({
  imports: [NotificationsModule, NotificationModule, InAppModule, InAppNotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
