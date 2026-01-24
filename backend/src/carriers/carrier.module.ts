import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrier } from './entities/carrier.entity';
import { Vehicle } from './entities/vehicle.entity';
import { CarrierRating } from './entities/carrier-rating.entity';
import { CarrierService } from './services/carrier.service';
import { CarrierController } from './controllers/carrier.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Carrier, Vehicle, CarrierRating]),
  ],
  controllers: [CarrierController],
  providers: [CarrierService],
  exports: [CarrierService],
})
export class CarrierModule {}