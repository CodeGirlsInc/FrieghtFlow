import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from '../shipments/entities/shipment.entity';
import { CarrierCertification } from './entities/carrier-certification.entity';
import { CarriersService } from './carriers.service';
import { CarrierCertificationsService } from './carrier-certifications.service';
import { CarriersController } from './carriers.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { DocumentsModule } from '../documents/documents.module';
import { CarrierCertificationExpiryScheduler } from './carrier-certification-expiry.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, CarrierCertification]),
    AuditLogModule,
    DocumentsModule,
  ],
  controllers: [CarriersController],
  providers: [
    CarriersService,
    CarrierCertificationsService,
    CarrierCertificationExpiryScheduler,
  ],
  exports: [CarrierCertificationsService],
})
export class CarriersModule {}
