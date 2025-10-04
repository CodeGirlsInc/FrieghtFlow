import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Shipment, ShipmentStatus } from "./shipment.entity";
import { ShipmentStatusHistory } from "./shipment-status-history.entity";
import { CreateShipmentDto } from "./dto/create-shipment.dto";
import { UpdateShipmentDto } from "./dto/update-shipment.dto";
import { UpdateShipmentStatusDto } from "./dto/update-shipment-status.dto";
import { UpdateShipmentLocationDto } from "./dto/update-shipment-location.dto";
import { ShipmentLocationHistory } from "./entities/shipment-location-history.entity";
import { CustomsComplianceService } from "../customs/customs-complaince.service";
import { RiskScoringService } from "./risk-scoring.service";
import { CarriersService } from "../carriers/carriers.service";
import { RouteService } from "../route-optimization/services/route.service";

@Injectable()
export class ShipmentService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(ShipmentStatusHistory)
    private readonly statusHistoryRepo: Repository<ShipmentStatusHistory>,
      @InjectRepository(ShipmentLocationHistory)
      private readonly locationHistoryRepo: Repository<ShipmentLocationHistory>,
    private readonly customsComplianceService: CustomsComplianceService,
    private readonly riskScoringService: RiskScoringService,
    private readonly carriersService: CarriersService,
    private readonly routeService: RouteService
  ) {}

  async updateLocation(id: string, dto: UpdateShipmentLocationDto): Promise<Shipment> {
    const shipment = await this.findOne(id);
    if (typeof dto.latitude !== 'number' || typeof dto.longitude !== 'number') {
      throw new BadRequestException('Latitude and longitude are required and must be numbers');
    }

    shipment.currentLatitude = dto.latitude;
    shipment.currentLongitude = dto.longitude;
    shipment.currentLocationTimestamp = dto.timestamp ? new Date(dto.timestamp) : new Date();
    shipment.currentLocationSource = dto.source || 'unknown';
    await this.shipmentRepo.save(shipment);

    // Log location history
    await this.locationHistoryRepo.save({
      shipment: shipment,
      latitude: dto.latitude,
      longitude: dto.longitude,
      accuracy: dto.accuracy,
      speed: dto.speed,
      heading: dto.heading,
      source: dto.source,
      timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
    });
    return shipment;
  }
  async getLatestLocation(id: string): Promise<ShipmentLocationHistory | null> {
    const shipment = await this.findOne(id);
    const latest = await this.locationHistoryRepo.findOne({
      where: { shipment: { id: shipment.id } },
      order: { timestamp: 'DESC' },
    });
    return latest || null;
  }

  async getLocationHistory(id: string): Promise<ShipmentLocationHistory[]> {
    const shipment = await this.findOne(id);
    return this.locationHistoryRepo.find({
      where: { shipment: { id: shipment.id } },
      order: { timestamp: "DESC" },
    });
  }

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

  async findByStatus(status: ShipmentStatus): Promise<Shipment[]> {
    return this.shipmentRepo.find({
      where: { status },
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
    
    // estimatedDelivery is a string, so no need to convert to Date
    
    Object.assign(shipment, updateDto);
    return this.shipmentRepo.save(shipment);
  }

  async updateStatus(id: string, updateStatusDto: UpdateShipmentStatusDto): Promise<Shipment> {
    const shipment = await this.findOne(id);
    
    // Don't allow status updates for delivered or cancelled shipments
    if (shipment.status === ShipmentStatus.DELIVERED || shipment.status === ShipmentStatus.CANCELLED) {
      throw new BadRequestException("Cannot update status for delivered or cancelled shipments");
    }
    
    // Enforce customs compliance before progressing beyond PENDING/PICKED_UP
    const requiresCompliance = [
      ShipmentStatus.IN_TRANSIT,
      ShipmentStatus.OUT_FOR_DELIVERY,
      ShipmentStatus.DELIVERED,
    ].includes(updateStatusDto.status);

    if (requiresCompliance) {
      const { compliant, reasons } = await this.customsComplianceService.isShipmentCompliant(shipment.id);
      if (!compliant) {
        throw new BadRequestException(
          `Shipment is not customs compliant: ${reasons.join(", ")}`
        );
      }
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

  /**
   * Calculate and update the risk score for a shipment
   * @param id The shipment ID
   * @returns The updated shipment with risk score
   */
  async calculateRiskScore(id: string): Promise<Shipment> {
    const shipment = await this.findOne(id);
    
    // Get carrier information if available
    let carrier: any = null;
    try {
      // This would require implementing a method to get carrier by name
      // For now, we'll leave it as null
    } catch (error) {
      // Carrier not found or other error
    }
    
    // Get route information if available
    let route: any = null;
    try {
      // This would require implementing a method to get route by origin/destination
      // For now, we'll leave it as null
    } catch (error) {
      // Route not found or other error
    }
    
    // Calculate risk score
    const riskData = this.riskScoringService.calculateRiskScore(shipment, carrier, route);
    
    // Update shipment with risk data
    shipment.riskScore = riskData.score;
    shipment.riskLevel = riskData.level;
    shipment.riskFactors = riskData.factors;
    
    // Save updated shipment
    return await this.shipmentRepo.save(shipment);
  }

  /**
   * Get shipments filtered by risk level
   * @param riskLevel The risk level to filter by
   * @returns Array of shipments with the specified risk level
   */
  async getShipmentsByRiskLevel(riskLevel: string): Promise<Shipment[]> {
    return await this.shipmentRepo.find({
      where: { riskLevel: riskLevel as any },
      order: { riskScore: "DESC" },
      relations: ["statusHistory"],
    });
  }

  /**
   * Get risk statistics for all shipments
   * @returns Object containing risk statistics
   */
  async getRiskStatistics(): Promise<any> {
    const shipments = await this.shipmentRepo.find();
    
    const totalShipments = shipments.length;
    const lowRisk = shipments.filter((s: Shipment) => s.riskLevel === 'low').length;
    const mediumRisk = shipments.filter((s: Shipment) => s.riskLevel === 'medium').length;
    const highRisk = shipments.filter((s: Shipment) => s.riskLevel === 'high').length;
    const criticalRisk = shipments.filter((s: Shipment) => s.riskLevel === 'critical').length;
    
    const averageRiskScore = shipments.reduce((sum: number, shipment: Shipment) => sum + shipment.riskScore, 0) / totalShipments;
    
    return {
      totalShipments,
      lowRisk,
      mediumRisk,
      highRisk,
      criticalRisk,
      averageRiskScore: parseFloat(averageRiskScore.toFixed(2)),
      riskDistribution: {
        low: parseFloat(((lowRisk / totalShipments) * 100).toFixed(2)),
        medium: parseFloat(((mediumRisk / totalShipments) * 100).toFixed(2)),
        high: parseFloat(((highRisk / totalShipments) * 100).toFixed(2)),
        critical: parseFloat(((criticalRisk / totalShipments) * 100).toFixed(2)),
      }
    };
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
