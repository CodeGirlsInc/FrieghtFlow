import { Controller, Get, Post, Patch, Delete } from "@nestjs/common"
import type { WarehouseService } from "./warehouse.service"
import type { CreateWarehouseDto } from "./dto/create-warehouse.dto"
import type { UpdateWarehouseDto } from "./dto/update-warehouse.dto"
import type { CreateCargoMovementDto } from "./dto/create-cargo-movement.dto"
import type { UpdateCargoMovementDto } from "./dto/update-cargo-movement.dto"

@Controller("warehouses")
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  createWarehouse(createWarehouseDto: CreateWarehouseDto) {
    return this.warehouseService.createWarehouse(createWarehouseDto)
  }

  @Get()
  findAllWarehouses() {
    return this.warehouseService.findAllWarehouses()
  }

  @Get("capacity-report")
  getCapacityReport() {
    return this.warehouseService.getWarehouseCapacityReport()
  }

  @Get(":id")
  findWarehouse(id: string) {
    return this.warehouseService.findWarehouseById(id)
  }

  @Patch(":id")
  updateWarehouse(id: string, updateWarehouseDto: UpdateWarehouseDto) {
    return this.warehouseService.updateWarehouse(id, updateWarehouseDto)
  }

  @Delete(":id")
  deleteWarehouse(id: string) {
    return this.warehouseService.deleteWarehouse(id)
  }

  @Post("movements")
  createCargoMovement(createCargoMovementDto: CreateCargoMovementDto) {
    return this.warehouseService.createCargoMovement(createCargoMovementDto)
  }

  @Get("movements/all")
  findAllCargoMovements(warehouseId?: string) {
    return this.warehouseService.findAllCargoMovements(warehouseId)
  }

  @Get("movements/date-range")
  getMovementsByDateRange(startDate: string, endDate: string) {
    return this.warehouseService.getMovementsByDateRange(new Date(startDate), new Date(endDate))
  }

  @Patch("movements/:id")
  updateCargoMovement(id: string, updateCargoMovementDto: UpdateCargoMovementDto) {
    return this.warehouseService.updateCargoMovement(id, updateCargoMovementDto)
  }

  @Patch("movements/:id/complete")
  completeCargoMovement(id: string) {
    return this.warehouseService.completeCargoMovement(id)
  }
}
