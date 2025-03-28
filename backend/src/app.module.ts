import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './Admin/Admin.module';

@Module({
  imports: [NotificationsModule,AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
