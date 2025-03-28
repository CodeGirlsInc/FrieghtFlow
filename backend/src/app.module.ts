import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [NotificationsModule, PaymentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
