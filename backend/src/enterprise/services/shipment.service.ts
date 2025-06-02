import { Injectable, NotFoundException } from "@nestjs/common"
import { type Repository, Between } from "typeorm"
import { type Shipment, ShipmentStatus } from "../entities/shipment.entity"
import type { CreateShipmentDto } from "../dto/create-shipment.dto"

@Injectable()
export class ShipmentService {
  constructor(private shipmentRepository: Repository<Shipment>) {}

  async create(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    const trackingNumber = this.generateTrackingNumber()

    const shipment = this.shipmentRepository.create({
      ...createShipmentDto,
      trackingNumber,
      estimatedDeliveryDate: createShipmentDto.estimatedDeliveryDate
        ? new Date(createShipmentDto.estimatedDeliveryDate)
        : null,
    })

    return await this.shipmentRepository.save(shipment)
  }

  async findAll(organizationId?: string, departmentId?: string): Promise<Shipment[]> {
    const query = this.shipmentRepository
      .createQueryBuilder("shipment")
      .leftJoinAndSelect("shipment.organization", "organization")
      .leftJoinAndSelect("shipment.department", "department")
      .leftJoinAndSelect("shipment.assignedUser", "assignedUser")
      .leftJoinAndSelect("shipment.route", "route")

    if (organizationId) {
      query.andWhere("shipment.organizationId = :organizationId", { organizationId })
    }

    if (departmentId) {
      query.andWhere("shipment.departmentId = :departmentId", { departmentId })
    }

    return await query.getMany()
  }

  async findOne(id: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: ["organization", "department", "assignedUser", "route"],
    })

    if (!shipment) {
      throw new NotFoundException("Shipment not found")
    }

    return shipment
  }

  async findByTrackingNumber(trackingNumber: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { trackingNumber },
      relations: ["organization", "department", "assignedUser", "route"],
    })

    if (!shipment) {
      throw new NotFoundException("Shipment not found")
    }

    return shipment
  }

  async updateStatus(id: string, status: ShipmentStatus): Promise<Shipment> {
    const shipment = await this.findOne(id)
    shipment.status = status

    if (status === ShipmentStatus.DELIVERED) {
      shipment.actualDeliveryDate = new Date()
    }

    return await this.shipmentRepository.save(shipment)
  }

  async assignToUser(shipmentId: string, userId: string): Promise<Shipment> {
    const shipment = await this.findOne(shipmentId)
    shipment.assignedUserId = userId
    return await this.shipmentRepository.save(shipment)
  }

  async getShipmentsByDateRange(organizationId: string, startDate: Date, endDate: Date): Promise<Shipment[]> {
    return await this.shipmentRepository.find({
      where: {
        organizationId,
        createdAt: Between(startDate, endDate),
      },
      relations: ["department", "assignedUser", "route"],
    })
  }

  async getDepartmentShipmentStats(departmentId: string) {
    const stats = await this.shipmentRepository
      .createQueryBuilder("shipment")
      .select([
        "shipment.status",
        "COUNT(*) as count",
        "AVG(shipment.cost) as avgCost",
        "SUM(shipment.cost) as totalCost",
      ])
      .where("shipment.departmentId = :departmentId", { departmentId })
      .groupBy("shipment.status")
      .getRawMany()

    return stats.map((stat) => ({
      status: stat.shipment_status,
      count: Number.parseInt(stat.count),
      averageCost: Number.parseFloat(stat.avgCost) || 0,
      totalCost: Number.parseFloat(stat.totalCost) || 0,
    }))
  }

  private generateTrackingNumber(): string {
    const prefix = "TRK"
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}${timestamp}${random}`
  }
}
