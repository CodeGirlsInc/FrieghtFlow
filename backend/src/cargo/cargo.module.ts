import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CargoService } from './cargo.service';
import { CargoController } from './cargo.controller';
import { Cargo } from './entities/cargo.entity';
import { Shipment } from 'src/shipment';

@Module({
  imports: [TypeOrmModule.forFeature([Cargo, Shipment])],
  controllers: [CargoController],
  providers: [CargoService],
  exports: [CargoService],
})
export class CargoModule {}