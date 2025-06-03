import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { Ticket } from './entities/ticket.entity';
import { TicketResponse } from './entities/ticket-response.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TicketResponse])],
  providers: [SupportService],
  controllers: [SupportController],
})
export class SupportModule {}
