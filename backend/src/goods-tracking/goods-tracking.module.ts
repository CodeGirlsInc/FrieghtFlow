import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GoodsTrackingService } from "./goods-tracking.service";
import { GoodsTrackingController } from "./goods-tracking.controller";
import { GoodsItem } from "./entities/goods-item.entity";
import { Warehouse } from "../warehouse/entities/warehouse.entity";
import { Shipment } from "../shipment/shipment.entity";

@Module({
  imports: [TypeOrmModule.forFeature([GoodsItem, Warehouse, Shipment])],
  controllers: [GoodsTrackingController],
  providers: [GoodsTrackingService],
  exports: [GoodsTrackingService],
})
export class GoodsTrackingModule {}
