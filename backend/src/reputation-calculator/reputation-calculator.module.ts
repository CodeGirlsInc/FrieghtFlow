import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from '../reviews/entities/review.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ReputationCalculatorService } from './reputation-calculator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Shipment])],
  providers: [ReputationCalculatorService],
  exports: [ReputationCalculatorService],
})
export class ReputationCalculatorModule {}
