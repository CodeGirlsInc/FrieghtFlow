import { Module } from '@nestjs/common';
import { StellarContractService } from './stellar-contract.service';

@Module({
  providers: [StellarContractService],
  exports: [StellarContractService],
})
export class StellarModule {}
