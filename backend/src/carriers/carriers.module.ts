import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarriersService } from './carriers.service';
import { CarriersController } from './carriers.controller';
import { Carrier } from './entities/carrier.entity';
import { Shipment } from '../shipments/entities/shipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Carrier, Shipment])],
  controllers: [CarriersController],
  providers: [CarriersService],
  exports: [CarriersService],
})
export class CarriersModule {}
