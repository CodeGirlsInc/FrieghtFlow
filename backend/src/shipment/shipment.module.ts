import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Shipment } from "./shipment.entity";
import { ShipmentStatusHistory } from "./shipment-status-history.entity";
import { ShipmentService } from "./shipment.service";
import { ShipmentController } from "./shipment.controller";
import { CustomsComplianceModule } from "../customs/customs-complaince.module";

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, ShipmentStatusHistory]), CustomsComplianceModule],
  providers: [ShipmentService],
  controllers: [ShipmentController],
  exports: [ShipmentService],
})
export class ShipmentModule {}
