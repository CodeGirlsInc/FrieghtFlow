import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FreightJob } from './entities/freight-job.entity';
import { FreightJobsService } from './services/freight-jobs.service';
import { FreightJobsController } from './controllers/freight-jobs.controller';
import { CostCalculationService } from './services/cost-calculation.service';

@Module({
  imports: [TypeOrmModule.forFeature([FreightJob])],
  controllers: [FreightJobsController],
  providers: [FreightJobsService, CostCalculationService],
  exports: [FreightJobsService, CostCalculationService],
})
export class FreightJobsModule {}
