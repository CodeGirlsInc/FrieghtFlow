import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type Shipment, ShipmentStatus } from "../entities/shipment.entity"
import type { CreateShipmentDto } from "../dto/create-shipment.dto"
import type { UpdateShipmentStatusDto } from "../dto/update-shipment-status.dto"

@Injectable()
export class ShipmentService {
  private readonly shipmentRepository: Repository<Shipment>

  constructor(shipmentRepository: Repository<Shipment>) {
    this.shipmentRepository = shipmentRepository
  }

  /**
   * Create a new shipment
   */
  async createShipment(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    // Check if tracking number already exists
    const existingShipment = await this.shipmentRepository.findOne({
      where: { trackingNumber: createShipmentDto.trackingNumber },
    })

    if (existingShipment) {
      throw new ConflictException(`Shipment with tracking number ${createShipmentDto.trackingNumber} already exists`)
    }

    const shipment = this.shipmentRepository.create({
      ...createShipmentDto,
      expectedDeliveryAt: new Date(createShipmentDto.expectedDeliveryAt),
      status: ShipmentStatus.CREATED,
    })

    return this.shipmentRepository.save(shipment)
  }

  /**
   * Update shipment status
   */
  async updateShipmentStatus(shipmentId: string, updateDto: UpdateShipmentStatusDto): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    })

    if (!shipment) {
      throw new NotFoundException(`Shipment not found: ${shipmentId}`)
    }

    const timestamp = updateDto.timestamp ? new Date(updateDto.timestamp) : new Date()

    // Update status-specific timestamps
    switch (updateDto.status) {
      case ShipmentStatus.PICKED_UP:
        shipment.pickedUpAt = timestamp
        break
      case ShipmentStatus.DELIVERED:
        shipment.actualDeliveryAt = timestamp
        break
    }

    shipment.status = updateDto.status
    shipment.updatedAt = timestamp

    return this.shipmentRepository.save(shipment)
  }

  /**
   * Get shipment by ID
   */
  async getShipmentById(shipmentId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    })

    if (!shipment) {
      throw new NotFoundException(`Shipment not found: ${shipmentId}`)
    }

    return shipment
  }

  /**
   * Get shipment by tracking number
   */
  async getShipmentByTrackingNumber(trackingNumber: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { trackingNumber },
    })

    if (!shipment) {
      throw new NotFoundException(`Shipment not found: ${trackingNumber}`)
    }

    return shipment
  }

  /**
   * Get all shipments with optional filtering
   */
  async getAllShipments(
    status?: ShipmentStatus,
    customerId?: string,
    limit = 50,
    offset = 0,
  ): Promise<{ shipments: Shipment[]; total: number }> {
    const queryBuilder = this.shipmentRepository.createQueryBuilder("shipment")

    if (status) {
      queryBuilder.andWhere("shipment.status = :status", { status })
    }

    if (customerId) {
      queryBuilder.andWhere("shipment.customerId = :customerId", { customerId })
    }

    queryBuilder.orderBy("shipment.createdAt", "DESC").limit(limit).offset(offset)

    const [shipments, total] = await queryBuilder.getManyAndCount()

    return { shipments, total }
  }

  /**
   * Simulate shipment status updates for testing
   */
  async simulateShipmentProgress(shipmentId: string): Promise<Shipment[]> {
    const shipment = await this.getShipmentById(shipmentId)
    const updates: Shipment[] = []

    // Simulate pickup after 1 hour
    if (shipment.status === ShipmentStatus.CREATED) {
      const pickedUpShipment = await this.updateShipmentStatus(shipmentId, {
        status: ShipmentStatus.PICKED_UP,
        timestamp: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      })
      updates.push(pickedUpShipment)
    }

    // Simulate in transit after 2 hours
    const inTransitShipment = await this.updateShipmentStatus(shipmentId, {
      status: ShipmentStatus.IN_TRANSIT,
      timestamp: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    })
    updates.push(inTransitShipment)

    // Simulate out for delivery after 1 day
    const outForDeliveryShipment = await this.updateShipmentStatus(shipmentId, {
      status: ShipmentStatus.OUT_FOR_DELIVERY,
      timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    updates.push(outForDeliveryShipment)

    return updates
  }

  /**
   * Create test shipments for SLA testing
   */
  async createTestShipments(): Promise<Shipment[]> {
    const testShipments: CreateShipmentDto[] = [
      {
        trackingNumber: "TEST001",
        customerId: "123e4567-e89b-12d3-a456-426614174000",
        origin: "New York, NY",
        destination: "Los Angeles, CA",
        priority: "standard" as any,
        expectedDeliveryAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day overdue
        metadata: { testCase: "overdue_delivery" },
      },
      {
        trackingNumber: "TEST002",
        customerId: "123e4567-e89b-12d3-a456-426614174001",
        origin: "Chicago, IL",
        destination: "Miami, FL",
        priority: "express" as any,
        expectedDeliveryAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days future
        metadata: { testCase: "on_time_delivery" },
      },
      {
        trackingNumber: "TEST003",
        customerId: "123e4567-e89b-12d3-a456-426614174002",
        origin: "Seattle, WA",
        destination: "Boston, MA",
        priority: "overnight" as any,
        expectedDeliveryAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours overdue
        metadata: { testCase: "critical_delay" },
      },
    ]

    const createdShipments: Shipment[] = []
    for (const shipmentDto of testShipments) {
      try {
        const shipment = await this.createShipment(shipmentDto)
        createdShipments.push(shipment)
      } catch (error) {
        // Skip if already exists
        if (error instanceof ConflictException) {
          const existing = await this.getShipmentByTrackingNumber(shipmentDto.trackingNumber)
          createdShipments.push(existing)
        }
      }
    }

    return createdShipments
  }
}
