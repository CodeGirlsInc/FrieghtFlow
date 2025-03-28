import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './Admin/Admin.module';
import { PaymentsModule } from './payments/payments.module';
import { UsersModule } from './users/users.module';
import { ShipmentsModule } from './shipments/shipments.module';

@Module({
  imports: [NotificationsModule, PaymentsModule, AdminModule, UsersModule, ShipmentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
