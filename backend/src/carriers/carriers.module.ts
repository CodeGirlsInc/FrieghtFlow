import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from '../shipments/entities/shipment.entity';
import { CarrierCertification } from './entities/carrier-certification.entity';
import { CarriersService } from './carriers.service';
import { CarrierCertificationsService } from './carrier-certifications.service';
import { CarriersController } from './carriers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, CarrierCertification])],
  controllers: [CarriersController],
  providers: [CarriersService, CarrierCertificationsService],
  exports: [CarrierCertificationsService],
})
export class CarriersModule {}
