import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsuranceController } from './controllers/insurance.controller';
import { InsuranceService } from './services/insurance.service';
import { InsurancePolicy } from './entities/insurance-policy.entity';
import { ClaimHistory } from './entities/claim-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InsurancePolicy, ClaimHistory]),
  ],
  controllers: [InsuranceController],
  providers: [InsuranceService],
  exports: [InsuranceService],
})
export class InsuranceModule {}
