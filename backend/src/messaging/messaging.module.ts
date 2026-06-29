import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { Shipment } from '../shipments/entities/shipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, Shipment])],
  controllers: [MessagingController],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
