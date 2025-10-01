import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type Shipment, ShipmentStatus } from "./entities/shipment.entity"
import type { CreateShipmentDto } from "./dto/create-shipment.dto"
import type { UpdateShipmentDto } from "./dto/update-shipment.dto"
import type { TrackingUpdateDto } from "./dto/tracking-update.dto"
import type { ArchiveShipmentDto } from "./dto/archive-shipment.dto"

@Injectable()
export class ShipmentService {
  constructor(private shipmentRepository: Repository<Shipment>) {}

  async create(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    const trackingNumber = await this.generateTrackingNumber()

    const shipment = this.shipmentRepository.create({
      ...createShipmentDto,
      trackingNumber,
      scheduledPickupDate: createShipmentDto.scheduledPickupDate
        ? new Date(createShipmentDto.scheduledPickupDate)
        : null,
      estimatedDeliveryDate: createShipmentDto.estimatedDeliveryDate
        ? new Date(createShipmentDto.estimatedDeliveryDate)
        : null,
    })

    return await this.shipmentRepository.save(shipment)
  }

  async findAll(includeArchived = false): Promise<Shipment[]> {
    const whereCondition = includeArchived ? {} : { isArchived: false }
    return await this.shipmentRepository.find({
      where: whereCondition,
      order: { createdAt: "DESC" },
    })
  }

  async findOne(id: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({ where: { id } })
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`)
    }
    return shipment
  }

  async findByTrackingNumber(trackingNumber: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({ where: { trackingNumber } })
    if (!shipment) {
      throw new NotFoundException(`Shipment with tracking number ${trackingNumber} not found`)
    }
    return shipment
  }

  async update(id: string, updateShipmentDto: UpdateShipmentDto): Promise<Shipment> {
    const shipment = await this.findOne(id)

    if (shipment.isArchived) {
      throw new BadRequestException("Cannot update archived shipment")
    }

    const updateData = {
      ...updateShipmentDto,
      actualPickupDate: updateShipmentDto.actualPickupDate
        ? new Date(updateShipmentDto.actualPickupDate)
        : shipment.actualPickupDate,
      actualDeliveryDate: updateShipmentDto.actualDeliveryDate
        ? new Date(updateShipmentDto.actualDeliveryDate)
        : shipment.actualDeliveryDate,
    }

    await this.shipmentRepository.update(id, updateData)
    return await this.findOne(id)
  }

  async updateTracking(id: string, trackingUpdateDto: TrackingUpdateDto): Promise<Shipment> {
    const shipment = await this.findOne(id)

    if (shipment.isArchived) {
      throw new BadRequestException("Cannot update tracking for archived shipment")
    }

    const currentNotes = shipment.trackingNotes || ""
    const timestamp = trackingUpdateDto.timestamp ? new Date(trackingUpdateDto.timestamp) : new Date()
    const location = trackingUpdateDto.location ? ` at ${trackingUpdateDto.location}` : ""

    const newNote = `[${timestamp.toISOString()}] Status: ${trackingUpdateDto.status}${location} - ${trackingUpdateDto.updateNote}`
    const updatedNotes = currentNotes ? `${currentNotes}\n${newNote}` : newNote

    const updateData: Partial<Shipment> = {
      status: trackingUpdateDto.status,
      trackingNotes: updatedNotes,
    }

    // Auto-update delivery date if status is delivered
    if (trackingUpdateDto.status === ShipmentStatus.DELIVERED && !shipment.actualDeliveryDate) {
      updateData.actualDeliveryDate = timestamp
    }

    await this.shipmentRepository.update(id, updateData)
    return await this.findOne(id)
  }

  async archive(id: string, archiveDto: ArchiveShipmentDto): Promise<Shipment> {
    const shipment = await this.findOne(id)

    if (shipment.isArchived) {
      throw new BadRequestException("Shipment is already archived")
    }

    const archiveNote = archiveDto.archiveReason ? ` - Reason: ${archiveDto.archiveReason}` : ""
    const currentNotes = shipment.trackingNotes || ""
    const archiveTimestamp = new Date()
    const newNote = `[${archiveTimestamp.toISOString()}] Shipment archived by ${archiveDto.archivedBy}${archiveNote}`
    const updatedNotes = currentNotes ? `${currentNotes}\n${newNote}` : newNote

    await this.shipmentRepository.update(id, {
      isArchived: true,
      archivedAt: archiveTimestamp,
      archivedBy: archiveDto.archivedBy,
      trackingNotes: updatedNotes,
    })

    return await this.findOne(id)
  }

  async unarchive(id: string): Promise<Shipment> {
    const shipment = await this.findOne(id)

    if (!shipment.isArchived) {
      throw new BadRequestException("Shipment is not archived")
    }

    await this.shipmentRepository.update(id, {
      isArchived: false,
      archivedAt: null,
      archivedBy: null,
    })

    return await this.findOne(id)
  }

  async remove(id: string): Promise<void> {
    const shipment = await this.findOne(id)
    await this.shipmentRepository.remove(shipment)
  }

  async findByStatus(status: ShipmentStatus[]): Promise<Shipment[]> {
    return await this.shipmentRepository.find({
      where: {
        status: status,
        isArchived: false,
      },
      order: { createdAt: "DESC" },
    })
  }

  async findByCarrier(carrier: string): Promise<Shipment[]> {
    return await this.shipmentRepository.find({
      where: {
        assignedCarrier: carrier,
        isArchived: false,
      },
      order: { createdAt: "DESC" },
    })
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Shipment[]> {
    return await this.shipmentRepository.find({
      where: {
        createdAt: { $gte: startDate, $lte: endDate },
        isArchived: false,
      },
      order: { createdAt: "DESC" },
    })
  }

  async getShipmentStats() {
    const total = await this.shipmentRepository.count({ where: { isArchived: false } })
    const inTransit = await this.shipmentRepository.count({
      where: { status: ShipmentStatus.IN_TRANSIT, isArchived: false },
    })
    const delivered = await this.shipmentRepository.count({
      where: { status: ShipmentStatus.DELIVERED, isArchived: false },
    })
    const pending = await this.shipmentRepository.count({
      where: { status: [ShipmentStatus.CREATED, ShipmentStatus.CONFIRMED], isArchived: false },
    })
    const archived = await this.shipmentRepository.count({ where: { isArchived: true } })

    return {
      total,
      inTransit,
      delivered,
      pending,
      archived,
      deliveryRate: total > 0 ? ((delivered / total) * 100).toFixed(2) : "0.00",
    }
  }

  private async generateTrackingNumber(): Promise<string> {
    const prefix = "SHP"
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${prefix}${timestamp}${random}`
  }
}
