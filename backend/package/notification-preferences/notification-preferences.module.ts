import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationPreferencesController } from './notification-preferences.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationPreference])],
  controllers: [NotificationPreferencesController],
  providers: [NotificationPreferencesService],
  exports: [NotificationPreferencesService],
})
export class NotificationPreferencesModule {}
