import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { WarehouseService } from "./warehouse.service"
import { WarehouseController } from "./warehouse.controller"
import { Warehouse } from "./entities/warehouse.entity"
import { CargoMovement } from "./entities/cargo-movement.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse, CargoMovement])],
  controllers: [WarehouseController],
  providers: [WarehouseService],
  exports: [WarehouseService],
})
export class WarehouseModule {}
