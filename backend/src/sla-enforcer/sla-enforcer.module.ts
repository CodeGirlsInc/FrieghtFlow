import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { HttpModule } from "@nestjs/axios"
import { ScheduleModule } from "@nestjs/schedule"

// Entities
import { SLARule } from "./entities/sla-rule.entity"
import { Shipment } from "./entities/shipment.entity"
import { SLAViolation } from "./entities/sla-violation.entity"

// Services
import { SLAMonitoringService } from "./services/sla-monitoring.service"
import { SLAActionService } from "./services/sla-action.service"
import { ShipmentService } from "./services/shipment.service"

// Controllers
import { SLARulesController } from "./controllers/sla-rules.controller"
import { ShipmentsController } from "./controllers/shipments.controller"
import { SLAMonitoringController } from "./controllers/sla-monitoring.controller"

@Module({
  imports: [TypeOrmModule.forFeature([SLARule, Shipment, SLAViolation]), HttpModule, ScheduleModule.forRoot()],
  controllers: [SLARulesController, ShipmentsController, SLAMonitoringController],
  providers: [SLAMonitoringService, SLAActionService, ShipmentService],
  exports: [SLAMonitoringService, SLAActionService, ShipmentService],
})
export class SLAEnforcerModule {}
