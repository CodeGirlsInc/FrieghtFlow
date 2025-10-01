import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrier } from './entities/carrier.entity';
import { Vehicle } from './entities/vehicle.entity';
import { MaintenanceRecord } from './entities/maintenance-record.entity';
import { CarrierService } from './services/carrier.service';
import { VehicleService } from './services/vehicle.service';
import { MaintenanceService } from './services/maintenance.service';
import { CarrierController } from './controllers/carrier.controller';
import { VehicleController } from './controllers/vehicle.controller';
import { MaintenanceController } from './controllers/maintenance.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Carrier, Vehicle, MaintenanceRecord]),
  ],
  controllers: [CarrierController, VehicleController, MaintenanceController],
  providers: [CarrierService, VehicleService, MaintenanceService],
  exports: [CarrierService, VehicleService, MaintenanceService],
})
export class FleetModule {}