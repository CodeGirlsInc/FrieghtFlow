import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Shipment } from "./shipment.entity";
import { ShipmentStatusHistory } from "./shipment-status-history.entity";
import { ShipmentService } from "./shipment.service";
import { ShipmentController } from "./shipment.controller";
import { RiskScoringService } from "./risk-scoring.service";
import { CustomsComplianceModule } from "../customs/customs-complaince.module";
import { CarriersModule } from "../carriers/carriers.module";
import { RouteOptimizationModule } from "../route-optimization/route-optimization.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, ShipmentStatusHistory]), 
    CustomsComplianceModule,
    CarriersModule,
    RouteOptimizationModule
  ],
  providers: [ShipmentService, RiskScoringService],
  controllers: [ShipmentController],
  exports: [ShipmentService, RiskScoringService],
})
export class ShipmentModule {}