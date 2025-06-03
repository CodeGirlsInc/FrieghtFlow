import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ShipperController } from "./shipper.controller"
import { ShipperService } from "./shipper.service"
import { Shipper } from "./entities/shipper.entity"
import { Shipment } from "./entities/shipment.entity"
import { ShipmentStatus } from "./entities/shipment-status.entity"
import { TrackingModule } from "../tracking/tracking.module"
import { PaymentModule } from "../payment/payment.module"
import { AuthModule } from "../auth/auth.module"

@Module({
  imports: [TypeOrmModule.forFeature([Shipper, Shipment, ShipmentStatus]), TrackingModule, PaymentModule, AuthModule],
  controllers: [ShipperController],
  providers: [ShipperService],
  exports: [ShipperService],
})
export class ShipperModule {}
