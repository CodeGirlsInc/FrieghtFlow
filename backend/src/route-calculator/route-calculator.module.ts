import { Module } from '@nestjs/common';
import { RouteCalculatorService } from './route-calculator.service';
import { RouteCalculatorController } from './route-calculator.controller';
import { ShipmentsModule } from '../shipments/shipments.module';

@Module({
  imports: [ShipmentsModule],
  providers: [RouteCalculatorService],
  controllers: [RouteCalculatorController],
})
export class RouteCalculatorModule {}
