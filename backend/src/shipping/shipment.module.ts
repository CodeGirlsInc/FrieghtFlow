import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ShipmentService } from "./shipment.service"
import { ShipmentController } from "./shipment.controller"
import { Shipment } from "./entities/shipment.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Shipment])],
  controllers: [ShipmentController],
  providers: [ShipmentService],
  exports: [ShipmentService],
})
export class ShipmentModule {}
