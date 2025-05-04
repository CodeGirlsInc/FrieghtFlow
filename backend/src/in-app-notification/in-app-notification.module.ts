import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationListener } from './notification.listener';
import { Notification } from './entities/notification.entity';
import { NotificationGateway } from './websocket/notification.gateway';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([Notification]),
  ],
  providers: [NotificationService, NotificationListener, NotificationGateway],
  exports: [NotificationService],
})
export class NotificationModule {}