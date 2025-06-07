import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type Vehicle, VehicleStatus } from "../entities/vehicle.entity"
import type { OperationalHistoryService } from "./operational-history.service"
import { OperationType } from "../entities/operational-history.entity"
import type { CreateVehicleDto, UpdateVehicleDto, VehicleQueryDto } from "../dto/vehicle.dto"
import type { Express } from "express"

@Injectable()
export class VehicleService {
  private readonly vehicleRepository: Repository<Vehicle>
  private readonly historyService: OperationalHistoryService

  constructor(vehicleRepository: Repository<Vehicle>, historyService: OperationalHistoryService) {
    this.vehicleRepository = vehicleRepository
    this.historyService = historyService
  }

  async create(carrierId: string, createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    // Check if license plate already exists
    const existingVehicle = await this.vehicleRepository.findOne({
      where: { licensePlate: createVehicleDto.licensePlate },
    })

    if (existingVehicle) {
      throw new ConflictException("Vehicle with this license plate already exists")
    }

    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      carrierId,
      status: VehicleStatus.AVAILABLE,
      issueDate: createVehicleDto.issueDate ? new Date(createVehicleDto.issueDate) : undefined,
      expiryDate: createVehicleDto.expiryDate ? new Date(createVehicleDto.expiryDate) : undefined,
      insuranceExpiryDate: createVehicleDto.insuranceExpiryDate
        ? new Date(createVehicleDto.insuranceExpiryDate)
        : undefined,
      registrationExpiryDate: createVehicleDto.registrationExpiryDate
        ? new Date(createVehicleDto.registrationExpiryDate)
        : undefined,
      inspectionExpiryDate: createVehicleDto.inspectionExpiryDate
        ? new Date(createVehicleDto.inspectionExpiryDate)
        : undefined,
      lastMaintenanceDate: createVehicleDto.lastMaintenanceDate
        ? new Date(createVehicleDto.lastMaintenanceDate)
        : undefined,
      nextMaintenanceDate: createVehicleDto.nextMaintenanceDate
        ? new Date(createVehicleDto.nextMaintenanceDate)
        : undefined,
    })

    const savedVehicle = await this.vehicleRepository.save(vehicle)

    // Log the addition
    await this.historyService.logOperation(carrierId, {
      operationType: OperationType.VEHICLE_ADDED,
      description: `Vehicle added: ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
      relatedEntityId: savedVehicle.id,
      metadata: { vehicleType: vehicle.vehicleType, licensePlate: vehicle.licensePlate },
    })

    return savedVehicle
  }

  async findByCarrier(carrierId: string, query: VehicleQueryDto) {
    const { page = 1, limit = 10, vehicleType, status, isActive } = query
    const skip = (page - 1) * limit

    const queryBuilder = this.vehicleRepository.createQueryBuilder("vehicle").where("vehicle.carrierId = :carrierId", {
      carrierId,
    })

    if (vehicleType) {
      queryBuilder.andWhere("vehicle.vehicleType = :vehicleType", { vehicleType })
    }

    if (status) {
      queryBuilder.andWhere("vehicle.status = :status", { status })
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere("vehicle.isActive = :isActive", { isActive })
    }

    const [vehicles, total] = await queryBuilder
      .orderBy("vehicle.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return {
      data: vehicles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findAvailable(query: VehicleQueryDto) {
    const { page = 1, limit = 10, vehicleType } = query
    const skip = (page - 1) * limit

    const queryBuilder = this.vehicleRepository
      .createQueryBuilder("vehicle")
      .leftJoinAndSelect("vehicle.carrier", "carrier")
      .where("vehicle.status = :status", { status: VehicleStatus.AVAILABLE })
      .andWhere("vehicle.isActive = :isActive", { isActive: true })
      .andWhere("carrier.status = :carrierStatus", { carrierStatus: "verified" })

    if (vehicleType) {
      queryBuilder.andWhere("vehicle.vehicleType = :vehicleType", { vehicleType })
    }

    const [vehicles, total] = await queryBuilder
      .orderBy("vehicle.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return {
      data: vehicles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async update(vehicleId: string, updateVehicleDto: UpdateVehicleDto, carrierId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId, carrierId },
    })

    if (!vehicle) {
      throw new NotFoundException("Vehicle not found")
    }

    // Handle date conversions
    const updateData = {
      ...updateVehicleDto,
      insuranceExpiryDate: updateVehicleDto.insuranceExpiryDate
        ? new Date(updateVehicleDto.insuranceExpiryDate)
        : vehicle.insuranceExpiryDate,
      registrationExpiryDate: updateVehicleDto.registrationExpiryDate
        ? new Date(updateVehicleDto.registrationExpiryDate)
        : vehicle.registrationExpiryDate,
      inspectionExpiryDate: updateVehicleDto.inspectionExpiryDate
        ? new Date(updateVehicleDto.inspectionExpiryDate)
        : vehicle.inspectionExpiryDate,
      lastMaintenanceDate: updateVehicleDto.lastMaintenanceDate
        ? new Date(updateVehicleDto.lastMaintenanceDate)
        : vehicle.lastMaintenanceDate,
      nextMaintenanceDate: updateVehicleDto.nextMaintenanceDate
        ? new Date(updateVehicleDto.nextMaintenanceDate)
        : vehicle.nextMaintenanceDate,
    }

    // Update current location with timestamp
    if (updateVehicleDto.currentLocation) {
      updateData.currentLocation = {
        ...updateVehicleDto.currentLocation,
        lastUpdated: new Date(),
      }
    }

    Object.assign(vehicle, updateData)
    return this.vehicleRepository.save(vehicle)
  }

  async uploadImages(vehicleId: string, files: Express.Multer.File[], carrierId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId, carrierId },
    })

    if (!vehicle) {
      throw new NotFoundException("Vehicle not found")
    }

    const imageUrls = files.map((file) => `/uploads/${file.filename}`)
    vehicle.imageUrls = [...(vehicle.imageUrls || []), ...imageUrls]

    return this.vehicleRepository.save(vehicle)
  }

  async remove(vehicleId: string, carrierId: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId, carrierId },
    })

    if (!vehicle) {
      throw new NotFoundException("Vehicle not found")
    }

    await this.vehicleRepository.remove(vehicle)

    // Log the removal
    await this.historyService.logOperation(carrierId, {
      operationType: OperationType.VEHICLE_REMOVED,
      description: `Vehicle removed: ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
      metadata: { vehicleType: vehicle.vehicleType, licensePlate: vehicle.licensePlate },
    })
  }

  async updateStatus(vehicleId: string, status: VehicleStatus): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
    })

    if (!vehicle) {
      throw new NotFoundException("Vehicle not found")
    }

    vehicle.status = status
    return this.vehicleRepository.save(vehicle)
  }

  async getExpiringDocuments(days = 30): Promise<Vehicle[]> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    return this.vehicleRepository
      .createQueryBuilder("vehicle")
      .leftJoinAndSelect("vehicle.carrier", "carrier")
      .where(
        "(vehicle.insuranceExpiryDate <= :futureDate AND vehicle.insuranceExpiryDate > :now) OR " +
          "(vehicle.registrationExpiryDate <= :futureDate AND vehicle.registrationExpiryDate > :now) OR " +
          "(vehicle.inspectionExpiryDate <= :futureDate AND vehicle.inspectionExpiryDate > :now)",
        { futureDate, now: new Date() },
      )
      .orderBy("vehicle.insuranceExpiryDate", "ASC")
      .getMany()
  }
}
