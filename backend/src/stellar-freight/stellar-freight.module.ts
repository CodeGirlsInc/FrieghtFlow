import { Module } from '@nestjs/common';
import { StellarFreightService } from './stellar-freight.service';
import { StellarFreightController } from './stellar-freight.controller';
import { StellarContractService } from './stellar-contract.service';
import { BookingRepository } from './booking.repository';

@Module({
  controllers: [StellarFreightController],
  providers: [
    StellarFreightService,
    StellarContractService,
    BookingRepository,
  ],
  exports: [StellarFreightService],
})
export class StellarFreightModule {}