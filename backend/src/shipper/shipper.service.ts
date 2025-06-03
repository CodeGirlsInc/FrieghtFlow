import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from "@nestjs/common"
import type { Repository } from "typeorm"
import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
import { type Shipper, ShipperStatus } from "./entities/shipper.entity"
import type { Shipment } from "./entities/shipment.entity"
import { type ShipmentStatus, DeliveryStatus } from "./entities/shipment-status.entity"
import type { CreateShipperDto } from "./dto/create-shipper.dto"
import type { UpdateShipperDto } from "./dto/update-shipper.dto"
import type { CreateShipmentDto } from "./dto/create-shipment.dto"
import type { UpdateShipmentStatusDto } from "./dto/update-shipment-status.dto"

@Injectable()
export class ShipperService {
  private shipperRepository: Repository<Shipper>
  private shipmentRepository: Repository<Shipment>
  private shipmentStatusRepository: Repository<ShipmentStatus>

  constructor(
    shipperRepository: Repository<Shipper>,
    shipmentRepository: Repository<Shipment>,
    shipmentStatusRepository: Repository<ShipmentStatus>,
  ) {
    this.shipperRepository = shipperRepository
    this.shipmentRepository = shipmentRepository
    this.shipmentStatusRepository = shipmentStatusRepository
  }

  async register(createShipperDto: CreateShipperDto): Promise<Shipper> {
    const existingShipper = await this.shipperRepository.findOne({
      where: { email: createShipperDto.email },
    })

    if (existingShipper) {
      throw new BadRequestException("Email already registered")
    }

    const hashedPassword = await bcrypt.hash(createShipperDto.password, 10)
    const verificationToken = crypto.randomBytes(32).toString("hex")

    const shipper = this.shipperRepository.create({
      ...createShipperDto,
      password: hashedPassword,
      verificationToken,
      status: ShipperStatus.PENDING,
    })

    const savedShipper = await this.shipperRepository.save(shipper)

    // TODO: Send verification email
    // await this.emailService.sendVerificationEmail(savedShipper.email, verificationToken);

    // Remove sensitive data from response
    delete savedShipper.password
    delete savedShipper.verificationToken

    return savedShipper
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const shipper = await this.shipperRepository.findOne({
      where: { verificationToken: token },
    })

    if (!shipper) {
      throw new BadRequestException("Invalid verification token")
    }

    shipper.isEmailVerified = true
    shipper.verificationToken = null
    shipper.status = ShipperStatus.VERIFIED

    await this.shipperRepository.save(shipper)

    return { message: "Email verified successfully" }
  }

  async findById(id: string): Promise<Shipper> {
    const shipper = await this.shipperRepository.findOne({
      where: { id },
      relations: ["shipments"],
    })

    if (!shipper) {
      throw new NotFoundException("Shipper not found")
    }

    delete shipper.password
    return shipper
  }

  async updateProfile(id: string, updateShipperDto: UpdateShipperDto): Promise<Shipper> {
    const shipper = await this.findById(id)

    Object.assign(shipper, updateShipperDto)
    const updatedShipper = await this.shipperRepository.save(shipper)

    delete updatedShipper.password
    return updatedShipper
  }

  async createShipment(shipperId: string, createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    const shipper = await this.findById(shipperId)

    if (shipper.status !== ShipperStatus.VERIFIED) {
      throw new UnauthorizedException("Shipper must be verified to create shipments")
    }

    const trackingNumber = this.generateTrackingNumber()

    const shipment = this.shipmentRepository.create({
      ...createShipmentDto,
      shipperId,
      trackingNumber,
    })

    const savedShipment = await this.shipmentRepository.save(shipment)

    // Create initial status
    await this.createShipmentStatus(savedShipment.id, {
      status: DeliveryStatus.PENDING,
      notes: "Shipment created",
    })

    return savedShipment
  }

  async getShipperShipments(
    shipperId: string,
    page = 1,
    limit = 10,
  ): Promise<{ shipments: Shipment[]; total: number; totalPages: number }> {
    const [shipments, total] = await this.shipmentRepository.findAndCount({
      where: { shipperId },
      relations: ["statusHistory"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    })

    return {
      shipments,
      total,
      totalPages: Math.ceil(total / limit),
    }
  }

  async getShipmentById(shipperId: string, shipmentId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId, shipperId },
      relations: ["statusHistory", "shipper"],
    })

    if (!shipment) {
      throw new NotFoundException("Shipment not found")
    }

    return shipment
  }

  async updateShipmentStatus(
    shipperId: string,
    shipmentId: string,
    updateStatusDto: UpdateShipmentStatusDto,
  ): Promise<ShipmentStatus> {
    const shipment = await this.getShipmentById(shipperId, shipmentId)

    const status = await this.createShipmentStatus(shipmentId, updateStatusDto)

    // Update shipment delivery date if delivered
    if (updateStatusDto.status === DeliveryStatus.DELIVERED) {
      shipment.actualDeliveryDate = new Date()
      await this.shipmentRepository.save(shipment)

      // Update shipper stats
      await this.updateShipperStats(shipperId)
    }

    return status
  }

  private async createShipmentStatus(shipmentId: string, statusData: UpdateShipmentStatusDto): Promise<ShipmentStatus> {
    const status = this.shipmentStatusRepository.create({
      shipmentId,
      ...statusData,
    })

    return await this.shipmentStatusRepository.save(status)
  }

  private async updateShipperStats(shipperId: string): Promise<void> {
    const shipper = await this.findById(shipperId)

    const deliveredCount = await this.shipmentRepository
      .createQueryBuilder("shipment")
      .innerJoin("shipment.statusHistory", "status")
      .where("shipment.shipperId = :shipperId", { shipperId })
      .andWhere("status.status = :status", { status: DeliveryStatus.DELIVERED })
      .getCount()

    shipper.totalDeliveries = deliveredCount
    await this.shipperRepository.save(shipper)
  }

  async getShipmentTracking(trackingNumber: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { trackingNumber },
      relations: ["statusHistory", "shipper"],
      order: { statusHistory: { createdAt: "ASC" } },
    })

    if (!shipment) {
      throw new NotFoundException("Shipment not found")
    }

    // Remove sensitive shipper data
    if (shipment.shipper) {
      delete shipment.shipper.password
      delete shipment.shipper.email
    }

    return shipment
  }

  private generateTrackingNumber(): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `SHP${timestamp.slice(-6)}${random}`
  }

  async getDashboardStats(shipperId: string): Promise<any> {
    const shipper = await this.findById(shipperId)

    const totalShipments = await this.shipmentRepository.count({
      where: { shipperId },
    })

    const pendingShipments = await this.shipmentRepository
      .createQueryBuilder("shipment")
      .innerJoin("shipment.statusHistory", "status")
      .where("shipment.shipperId = :shipperId", { shipperId })
      .andWhere("status.status IN (:...statuses)", {
        statuses: [DeliveryStatus.PENDING, DeliveryStatus.CONFIRMED, DeliveryStatus.PICKED_UP],
      })
      .getCount()

    const inTransitShipments = await this.shipmentRepository
      .createQueryBuilder("shipment")
      .innerJoin("shipment.statusHistory", "status")
      .where("shipment.shipperId = :shipperId", { shipperId })
      .andWhere("status.status IN (:...statuses)", {
        statuses: [DeliveryStatus.IN_TRANSIT, DeliveryStatus.OUT_FOR_DELIVERY],
      })
      .getCount()

    const deliveredShipments = shipper.totalDeliveries

    return {
      totalShipments,
      pendingShipments,
      inTransitShipments,
      deliveredShipments,
      rating: shipper.rating,
      isAvailable: shipper.isAvailable,
    }
  }
}
