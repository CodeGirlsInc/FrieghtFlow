import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationsModule } from './notifications/notifications.module';
import { PricingModule } from './pricing/pricing.module';

@Module({
  imports: [NotificationsModule, PricingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
