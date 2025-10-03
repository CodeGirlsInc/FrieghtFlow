import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { Invoice } from './entities/invoice.entity';
import { Shipment } from 'src/shipment';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Shipment])],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
