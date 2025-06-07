import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type Carrier, CarrierStatus } from "./entities/carrier.entity"
import type { OperationalHistoryService } from "./services/operational-history.service"
import { OperationType } from "./entities/operational-history.entity"
import type { CreateCarrierDto, UpdateCarrierDto, UpdateCarrierStatusDto, CarrierQueryDto } from "./dto/carrier.dto"

@Injectable()
export class CarrierService {
  private readonly carrierRepository: Repository<Carrier>
  private readonly historyService: OperationalHistoryService

  constructor(carrierRepository: Repository<Carrier>, historyService: OperationalHistoryService) {
    this.carrierRepository = carrierRepository
    this.historyService = historyService
  }

  async create(createCarrierDto: CreateCarrierDto, userId: string): Promise<Carrier> {
    // Check if carrier already exists with this email or license
    const existingCarrier = await this.carrierRepository.findOne({
      where: [{ email: createCarrierDto.email }, { licenseNumber: createCarrierDto.licenseNumber }],
    })

    if (existingCarrier) {
      throw new ConflictException("Carrier with this email or license number already exists")
    }

    const carrier = this.carrierRepository.create({
      ...createCarrierDto,
      status: CarrierStatus.PENDING,
    })

    const savedCarrier = await this.carrierRepository.save(carrier)

    // Log the creation
    await this.historyService.logOperation(savedCarrier.id, {
      operationType: OperationType.STATUS_CHANGED,
      description: "Carrier profile created",
      performedBy: userId,
      metadata: { status: CarrierStatus.PENDING },
    })

    return savedCarrier
  }

  async findAll(query: CarrierQueryDto) {
    const { page = 1, limit = 10, status, carrierType, search, city, state, isActive } = query
    const skip = (page - 1) * limit

    const queryBuilder = this.carrierRepository
      .createQueryBuilder("carrier")
      .leftJoinAndSelect("carrier.vehicles", "vehicles")
      .leftJoinAndSelect("carrier.verification", "verification")

    if (status) {
      queryBuilder.andWhere("carrier.status = :status", { status })
    }

    if (carrierType) {
      queryBuilder.andWhere("carrier.carrierType = :carrierType", { carrierType })
    }

    if (search) {
      queryBuilder.andWhere(
        "(carrier.companyName ILIKE :search OR carrier.contactPerson ILIKE :search OR carrier.email ILIKE :search)",
        { search: `%${search}%` },
      )
    }

    if (city) {
      queryBuilder.andWhere("carrier.city ILIKE :city", { city: `%${city}%` })
    }

    if (state) {
      queryBuilder.andWhere("carrier.state ILIKE :state", { state: `%${state}%` })
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere("carrier.isActive = :isActive", { isActive })
    }

    const [carriers, total] = await queryBuilder
      .orderBy("carrier.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return {
      data: carriers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: string): Promise<Carrier> {
    const carrier = await this.carrierRepository.findOne({
      where: { id },
      relations: ["vehicles", "documents", "verification", "operationalHistory"],
    })

    if (!carrier) {
      throw new NotFoundException("Carrier not found")
    }

    return carrier
  }

  async findByUserId(userId: string): Promise<Carrier> {
    const carrier = await this.carrierRepository.findOne({
      where: { id: userId }, // Assuming userId maps to carrier ID
      relations: ["vehicles", "documents", "verification"],
    })

    if (!carrier) {
      throw new NotFoundException("Carrier profile not found")
    }

    return carrier
  }

  async update(id: string, updateCarrierDto: UpdateCarrierDto, userId: string): Promise<Carrier> {
    const carrier = await this.findOne(id)

    Object.assign(carrier, updateCarrierDto)
    const updatedCarrier = await this.carrierRepository.save(carrier)

    // Log the update
    await this.historyService.logOperation(id, {
      operationType: OperationType.STATUS_CHANGED,
      description: "Carrier profile updated",
      performedBy: userId,
      metadata: updateCarrierDto,
    })

    return updatedCarrier
  }

  async updateStatus(id: string, updateStatusDto: UpdateCarrierStatusDto, userId: string): Promise<Carrier> {
    const carrier = await this.findOne(id)

    const oldStatus = carrier.status
    carrier.status = updateStatusDto.status

    const updatedCarrier = await this.carrierRepository.save(carrier)

    // Log the status change
    await this.historyService.logOperation(id, {
      operationType: OperationType.STATUS_CHANGED,
      description: `Status changed from ${oldStatus} to ${updateStatusDto.status}`,
      performedBy: userId,
      metadata: {
        oldStatus,
        newStatus: updateStatusDto.status,
        reason: updateStatusDto.reason,
      },
    })

    return updatedCarrier
  }

  async remove(id: string): Promise<void> {
    const carrier = await this.findOne(id)
    await this.carrierRepository.remove(carrier)
  }

  async updateRating(carrierId: string, newRating: number): Promise<void> {
    await this.carrierRepository.update(carrierId, { rating: newRating })
  }

  async incrementShipmentCount(carrierId: string, completed = false): Promise<void> {
    const carrier = await this.findOne(carrierId)
    carrier.totalShipments += 1
    if (completed) {
      carrier.completedShipments += 1
    }
    await this.carrierRepository.save(carrier)
  }
}
