import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Shipment } from "./shipment.entity";
import { ShipmentStatusHistory } from "./shipment-status-history.entity";
import { ShipmentService } from "./shipment.service";
import { ShipmentController } from "./shipment.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, ShipmentStatusHistory])],
  providers: [ShipmentService],
  controllers: [ShipmentController],
  exports: [ShipmentService],
})
export class ShipmentModule {}
