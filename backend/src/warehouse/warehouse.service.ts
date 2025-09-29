import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Warehouse } from "./entities/warehouse.entity"
import { type CargoMovement, MovementType, MovementStatus } from "./entities/cargo-movement.entity"
import type { CreateWarehouseDto } from "./dto/create-warehouse.dto"
import type { UpdateWarehouseDto } from "./dto/update-warehouse.dto"
import type { CreateCargoMovementDto } from "./dto/create-cargo-movement.dto"
import type { UpdateCargoMovementDto } from "./dto/update-cargo-movement.dto"

@Injectable()
export class WarehouseService {
  constructor(
    private warehouseRepository: Repository<Warehouse>,
    private cargoMovementRepository: Repository<CargoMovement>,
  ) {}

  // Warehouse CRUD operations
  async createWarehouse(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    const warehouse = this.warehouseRepository.create(createWarehouseDto)
    return await this.warehouseRepository.save(warehouse)
  }

  async findAllWarehouses(): Promise<Warehouse[]> {
    return await this.warehouseRepository.find({
      relations: ["cargoMovements"],
      order: { createdAt: "DESC" },
    })
  }

  async findWarehouseById(id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id },
      relations: ["cargoMovements"],
    })

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`)
    }

    return warehouse
  }

  async updateWarehouse(id: string, updateWarehouseDto: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.findWarehouseById(id)
    Object.assign(warehouse, updateWarehouseDto)
    return await this.warehouseRepository.save(warehouse)
  }

  async deleteWarehouse(id: string): Promise<void> {
    const warehouse = await this.findWarehouseById(id)
    await this.warehouseRepository.remove(warehouse)
  }

  // Cargo Movement operations
  async createCargoMovement(createCargoMovementDto: CreateCargoMovementDto): Promise<CargoMovement> {
    const warehouse = await this.findWarehouseById(createCargoMovementDto.warehouse_id)

    // Check capacity for inbound movements
    if (createCargoMovementDto.type === MovementType.INBOUND) {
      const availableCapacity = warehouse.availableCapacity
      if (createCargoMovementDto.quantity > availableCapacity) {
        throw new BadRequestException(
          `Insufficient warehouse capacity. Available: ${availableCapacity}, Requested: ${createCargoMovementDto.quantity}`,
        )
      }
    }

    const cargoMovement = this.cargoMovementRepository.create(createCargoMovementDto)
    return await this.cargoMovementRepository.save(cargoMovement)
  }

  async findAllCargoMovements(warehouseId?: string): Promise<CargoMovement[]> {
    const query = this.cargoMovementRepository
      .createQueryBuilder("movement")
      .leftJoinAndSelect("movement.warehouse", "warehouse")
      .orderBy("movement.createdAt", "DESC")

    if (warehouseId) {
      query.where("movement.warehouse_id = :warehouseId", { warehouseId })
    }

    return await query.getMany()
  }

  async updateCargoMovement(id: string, updateCargoMovementDto: UpdateCargoMovementDto): Promise<CargoMovement> {
    const movement = await this.cargoMovementRepository.findOne({
      where: { id },
      relations: ["warehouse"],
    })

    if (!movement) {
      throw new NotFoundException(`Cargo movement with ID ${id} not found`)
    }

    Object.assign(movement, updateCargoMovementDto)
    return await this.cargoMovementRepository.save(movement)
  }

  async completeCargoMovement(id: string): Promise<CargoMovement> {
    const movement = await this.cargoMovementRepository.findOne({
      where: { id },
      relations: ["warehouse"],
    })

    if (!movement) {
      throw new NotFoundException(`Cargo movement with ID ${id} not found`)
    }

    // Update warehouse occupancy
    const warehouse = movement.warehouse
    if (movement.type === MovementType.INBOUND) {
      warehouse.currentOccupancy += movement.quantity
    } else {
      warehouse.currentOccupancy = Math.max(0, warehouse.currentOccupancy - movement.quantity)
    }

    movement.status = MovementStatus.COMPLETED
    movement.actualDateTime = new Date()

    await this.warehouseRepository.save(warehouse)
    return await this.cargoMovementRepository.save(movement)
  }

  // Analytics and reporting
  async getWarehouseCapacityReport(): Promise<any[]> {
    return await this.warehouseRepository
      .createQueryBuilder("warehouse")
      .select([
        "warehouse.id",
        "warehouse.name",
        "warehouse.totalCapacity",
        "warehouse.currentOccupancy",
        "warehouse.capacityUnit",
      ])
      .addSelect("(warehouse.currentOccupancy::float / warehouse.totalCapacity::float * 100)", "occupancyPercentage")
      .getRawMany()
  }

  async getMovementsByDateRange(startDate: Date, endDate: Date): Promise<CargoMovement[]> {
    return await this.cargoMovementRepository
      .createQueryBuilder("movement")
      .leftJoinAndSelect("movement.warehouse", "warehouse")
      .where("movement.actualDateTime BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .orderBy("movement.actualDateTime", "DESC")
      .getMany()
  }
}
