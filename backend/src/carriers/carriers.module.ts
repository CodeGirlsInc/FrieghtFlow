import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from '../shipments/entities/shipment.entity';
import { CarrierCertification } from './entities/carrier-certification.entity';
import { CarriersService } from './carriers.service';
import { CarrierCertificationsService } from './carrier-certifications.service';
import { CarriersController } from './carriers.controller';
import { CacheModule } from '../cache/cache.module';
import { CarrierCacheService } from '../cache/carrier-cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, CarrierCertification]),
    CacheModule,
  ],
  controllers: [CarriersController],
  providers: [CarriersService, CarrierCertificationsService, CarrierCacheService],
  exports: [CarrierCertificationsService, CarrierCacheService],
})
export class CarriersModule {}