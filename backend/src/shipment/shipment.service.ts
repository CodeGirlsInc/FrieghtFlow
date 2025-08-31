import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Shipment, ShipmentStatus } from "./shipment.entity";
import { ShipmentStatusHistory } from "./shipment-status-history.entity";
import { CreateShipmentDto } from "./dto/create-shipment.dto";
import { UpdateShipmentDto } from "./dto/update-shipment.dto";
import { UpdateShipmentStatusDto } from "./dto/update-shipment-status.dto";

@Injectable()
export class ShipmentService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(ShipmentStatusHistory)
    private readonly statusHistoryRepo: Repository<ShipmentStatusHistory>
  ) {}

  private generateTrackingId(): string {
    // Generate a unique tracking ID with format: FF-YYYYMMDD-XXXXX
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `FF-${date}-${random}`;
  }

  async create(createDto: CreateShipmentDto): Promise<Shipment> {
    const trackingId = this.generateTrackingId();
    
    const shipment = this.shipmentRepo.create({
      ...createDto,
      trackingId,
      status: ShipmentStatus.PENDING,
      estimatedDelivery: createDto.estimatedDelivery ? new Date(createDto.estimatedDelivery) : undefined,
    });

    const savedShipment = await this.shipmentRepo.save(shipment);

    // Create initial status history entry
    await this.statusHistoryRepo.save({
      shipmentId: savedShipment.id,
      status: ShipmentStatus.PENDING,
      description: "Shipment created",
    });

    return savedShipment;
  }

  async findAll(): Promise<Shipment[]> {
    return this.shipmentRepo.find({
      order: { createdAt: "DESC" },
      relations: ["statusHistory"],
    });
  }

  async findOne(id: string): Promise<Shipment> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id },
      relations: ["statusHistory"],
    });
    
    if (!shipment) {
      throw new NotFoundException("Shipment not found");
    }
    
    return shipment;
  }

  async findByTrackingId(trackingId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepo.findOne({
      where: { trackingId },
      relations: ["statusHistory"],
    });
    
    if (!shipment) {
      throw new NotFoundException("Shipment not found");
    }
    
    return shipment;
  }

  async update(id: string, updateDto: UpdateShipmentDto): Promise<Shipment> {
    const shipment = await this.findOne(id);
    
    if (updateDto.estimatedDelivery) {
      updateDto.estimatedDelivery = new Date(updateDto.estimatedDelivery);
    }
    
    Object.assign(shipment, updateDto);
    return this.shipmentRepo.save(shipment);
  }

  async updateStatus(id: string, updateStatusDto: UpdateShipmentStatusDto): Promise<Shipment> {
    const shipment = await this.findOne(id);
    
    // Don't allow status updates for delivered or cancelled shipments
    if (shipment.status === ShipmentStatus.DELIVERED || shipment.status === ShipmentStatus.CANCELLED) {
      throw new BadRequestException("Cannot update status for delivered or cancelled shipments");
    }
    
    // Update shipment status
    shipment.status = updateStatusDto.status;
    await this.shipmentRepo.save(shipment);
    
    // Create status history entry
    await this.statusHistoryRepo.save({
      shipmentId: shipment.id,
      status: updateStatusDto.status,
      location: updateStatusDto.location,
      description: updateStatusDto.description,
    });
    
    return shipment;
  }

  async getStatusHistory(id: string): Promise<ShipmentStatusHistory[]> {
    const shipment = await this.findOne(id);
    return shipment.statusHistory.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async remove(id: string): Promise<void> {
    const shipment = await this.findOne(id);
    await this.shipmentRepo.remove(shipment);
  }

  async searchShipments(query: string): Promise<Shipment[]> {
    return this.shipmentRepo
      .createQueryBuilder("shipment")
      .leftJoinAndSelect("shipment.statusHistory", "statusHistory")
      .where("shipment.trackingId ILIKE :query", { query: `%${query}%` })
      .orWhere("shipment.origin ILIKE :query", { query: `%${query}%` })
      .orWhere("shipment.destination ILIKE :query", { query: `%${query}%` })
      .orWhere("shipment.carrier ILIKE :query", { query: `%${query}%` })
      .orderBy("shipment.createdAt", "DESC")
      .getMany();
  }
}
