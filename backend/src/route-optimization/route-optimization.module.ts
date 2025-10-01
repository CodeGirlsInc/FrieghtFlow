import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';
import { RouteSegment } from './entities/route-segment.entity';
import { Carrier } from './entities/carrier.entity';
import { RouteOptimizationRequest } from './entities/route-optimization-request.entity';
import { RouteOptimizationService } from './services/route-optimization.service';
import { RouteService } from './services/route.service';
import { CarrierService } from './services/carrier.service';
import { RulesEngineService } from './rules/rules-engine.service';
import { CostOptimizationRule } from './rules/cost-optimization.rule';
import { TimeOptimizationRule } from './rules/time-optimization.rule';
import { ReliabilityRule } from './rules/reliability.rule';
import { SafetyRule } from './rules/safety.rule';
import { CarbonFootprintRule } from './rules/carbon-footprint.rule';
import { CarrierAvailabilityRule } from './rules/carrier-availability.rule';
import { RouteOptimizationController } from './controllers/route-optimization.controller';
import { RouteController } from './controllers/route.controller';
import { CarrierController } from './controllers/carrier.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Route,
      RouteSegment,
      Carrier,
      RouteOptimizationRequest,
    ]),
  ],
  controllers: [
    RouteOptimizationController,
    RouteController,
    CarrierController,
  ],
  providers: [
    RouteOptimizationService,
    RouteService,
    CarrierService,
    RulesEngineService,
    CostOptimizationRule,
    TimeOptimizationRule,
    ReliabilityRule,
    SafetyRule,
    CarbonFootprintRule,
    CarrierAvailabilityRule,
  ],
  exports: [
    RouteOptimizationService,
    RouteService,
    CarrierService,
    RulesEngineService,
  ],
})
export class RouteOptimizationModule {}
