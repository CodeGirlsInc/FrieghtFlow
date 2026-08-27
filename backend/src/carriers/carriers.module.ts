import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from '../shipments/entities/shipment.entity';
import { CarrierCertification } from './entities/carrier-certification.entity';
import { CarriersService } from './carriers.service';
import { CarrierCertificationsService } from './carrier-certifications.service';
import { CarriersController } from './carriers.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, CarrierCertification]),
    AuditLogModule,
  ],
  controllers: [CarriersController],
  providers: [CarriersService, CarrierCertificationsService],
  exports: [CarrierCertificationsService],
})
export class CarriersModule {}
