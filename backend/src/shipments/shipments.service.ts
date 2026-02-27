import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatusHistory } from './entities/shipment-status-history.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { QueryShipmentDto } from './dto/query-shipment.dto';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';

export interface PaginatedShipments {
  data: Shipment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ShipmentsService {
  private readonly logger = new Logger(ShipmentsService.name);

  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(ShipmentStatusHistory)
    private readonly historyRepo: Repository<ShipmentStatusHistory>,
  ) {}

  // ── Tracking number ──────────────────────────────────────────────────────────

  private generateTrackingNumber(): string {
    const prefix = 'FF';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  // ── Status transition guard ──────────────────────────────────────────────────

  private assertTransitionAllowed(
    from: ShipmentStatus,
    to: ShipmentStatus,
    actorRole: UserRole,
  ): void {
    const allowed: Partial<
      Record<ShipmentStatus, { next: ShipmentStatus[]; roles: UserRole[] }>
    > = {
      [ShipmentStatus.PENDING]: {
        next: [ShipmentStatus.ACCEPTED, ShipmentStatus.CANCELLED],
        roles: [UserRole.CARRIER, UserRole.SHIPPER, UserRole.ADMIN],
      },
      [ShipmentStatus.ACCEPTED]: {
        next: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.CANCELLED],
        roles: [UserRole.CARRIER, UserRole.SHIPPER, UserRole.ADMIN],
      },
      [ShipmentStatus.IN_TRANSIT]: {
        next: [ShipmentStatus.DELIVERED, ShipmentStatus.DISPUTED],
        roles: [UserRole.CARRIER, UserRole.ADMIN],
      },
      [ShipmentStatus.DELIVERED]: {
        next: [ShipmentStatus.COMPLETED, ShipmentStatus.DISPUTED],
        roles: [UserRole.SHIPPER, UserRole.ADMIN],
      },
      [ShipmentStatus.DISPUTED]: {
        next: [ShipmentStatus.COMPLETED, ShipmentStatus.CANCELLED],
        roles: [UserRole.ADMIN],
      },
    };

    const rule = allowed[from];
    if (!rule || !rule.next.includes(to)) {
      throw new BadRequestException(
        `Cannot transition shipment from "${from}" to "${to}"`,
      );
    }
    if (!rule.roles.includes(actorRole)) {
      throw new ForbiddenException(
        `Role "${actorRole}" cannot perform this status transition`,
      );
    }
  }

  // ── History recorder ─────────────────────────────────────────────────────────

  private async recordHistory(
    shipmentId: string,
    fromStatus: ShipmentStatus | null,
    toStatus: ShipmentStatus,
    changedById: string,
    reason?: string,
  ): Promise<void> {
    const entry = this.historyRepo.create({
      shipmentId,
      fromStatus,
      toStatus,
      changedById,
      reason: reason ?? null,
    });
    await this.historyRepo.save(entry);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  async create(shipperId: string, dto: CreateShipmentDto): Promise<Shipment> {
    const shipment = this.shipmentRepo.create({
      trackingNumber: this.generateTrackingNumber(),
      shipperId,
      carrierId: null,
      origin: dto.origin,
      destination: dto.destination,
      cargoDescription: dto.cargoDescription,
      weightKg: dto.weightKg,
      volumeCbm: dto.volumeCbm ?? null,
      price: dto.price,
      currency: dto.currency ?? 'USD',
      notes: dto.notes ?? null,
      status: ShipmentStatus.PENDING,
      pickupDate: dto.pickupDate ? new Date(dto.pickupDate) : null,
      estimatedDeliveryDate: dto.estimatedDeliveryDate
        ? new Date(dto.estimatedDeliveryDate)
        : null,
    });

    const saved = await this.shipmentRepo.save(shipment);
    await this.recordHistory(
      saved.id,
      null,
      ShipmentStatus.PENDING,
      shipperId,
      'Shipment created',
    );
    return saved;
  }

  async findAll(
    user: User,
    query: QueryShipmentDto,
  ): Promise<PaginatedShipments> {
    const { page = 1, limit = 20, status, origin, destination } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Shipment> = {};

    // Shippers only see their own shipments; carriers see ones assigned to them
    if (user.role === UserRole.SHIPPER) {
      where.shipperId = user.id;
    } else if (user.role === UserRole.CARRIER) {
      where.carrierId = user.id;
    }
    // ADMIN sees all

    if (status) where.status = status;
    if (origin) where.origin = ILike(`%${origin}%`);
    if (destination) where.destination = ILike(`%${destination}%`);

    const [data, total] = await this.shipmentRepo.findAndCount({
      where,
      relations: ['shipper', 'carrier'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findMarketplace(query: QueryShipmentDto): Promise<PaginatedShipments> {
    const { page = 1, limit = 20, origin, destination } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Shipment> = {
      status: ShipmentStatus.PENDING,
    };
    if (origin) where.origin = ILike(`%${origin}%`);
    if (destination) where.destination = ILike(`%${destination}%`);

    const [data, total] = await this.shipmentRepo.findAndCount({
      where,
      relations: ['shipper'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Shipment> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id },
      relations: ['shipper', 'carrier'],
    });
    if (!shipment) throw new NotFoundException(`Shipment ${id} not found`);
    return shipment;
  }

  async findByTracking(trackingNumber: string): Promise<Shipment> {
    const shipment = await this.shipmentRepo.findOne({
      where: { trackingNumber },
      relations: ['shipper', 'carrier'],
    });
    if (!shipment)
      throw new NotFoundException(`Shipment ${trackingNumber} not found`);
    return shipment;
  }

  async update(
    id: string,
    shipperId: string,
    dto: UpdateShipmentDto,
  ): Promise<Shipment> {
    const shipment = await this.findOne(id);

    if (shipment.shipperId !== shipperId) {
      throw new ForbiddenException('Only the shipper can update this shipment');
    }
    if (shipment.status !== ShipmentStatus.PENDING) {
      throw new BadRequestException(
        'Can only update shipments in PENDING status',
      );
    }

    if (dto.notes !== undefined) shipment.notes = dto.notes;
    if (dto.pickupDate !== undefined)
      shipment.pickupDate = new Date(dto.pickupDate);
    if (dto.estimatedDeliveryDate !== undefined) {
      shipment.estimatedDeliveryDate = new Date(dto.estimatedDeliveryDate);
    }

    return this.shipmentRepo.save(shipment);
  }

  // ── Status transitions ───────────────────────────────────────────────────────

  async accept(shipmentId: string, carrier: User): Promise<Shipment> {
    const shipment = await this.findOne(shipmentId);
    this.assertTransitionAllowed(
      shipment.status,
      ShipmentStatus.ACCEPTED,
      carrier.role,
    );

    shipment.carrierId = carrier.id;
    shipment.status = ShipmentStatus.ACCEPTED;
    const saved = await this.shipmentRepo.save(shipment);
    await this.recordHistory(
      shipmentId,
      ShipmentStatus.PENDING,
      ShipmentStatus.ACCEPTED,
      carrier.id,
    );
    return saved;
  }

  async markInTransit(shipmentId: string, carrier: User): Promise<Shipment> {
    const shipment = await this.findOne(shipmentId);

    if (shipment.carrierId !== carrier.id && carrier.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only the assigned carrier can mark this shipment in transit',
      );
    }
    this.assertTransitionAllowed(
      shipment.status,
      ShipmentStatus.IN_TRANSIT,
      carrier.role,
    );

    shipment.status = ShipmentStatus.IN_TRANSIT;
    const saved = await this.shipmentRepo.save(shipment);
    await this.recordHistory(
      shipmentId,
      ShipmentStatus.ACCEPTED,
      ShipmentStatus.IN_TRANSIT,
      carrier.id,
    );
    return saved;
  }

  async markDelivered(shipmentId: string, carrier: User): Promise<Shipment> {
    const shipment = await this.findOne(shipmentId);

    if (shipment.carrierId !== carrier.id && carrier.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only the assigned carrier can mark this shipment delivered',
      );
    }
    this.assertTransitionAllowed(
      shipment.status,
      ShipmentStatus.DELIVERED,
      carrier.role,
    );

    shipment.status = ShipmentStatus.DELIVERED;
    shipment.actualDeliveryDate = new Date();
    const saved = await this.shipmentRepo.save(shipment);
    await this.recordHistory(
      shipmentId,
      ShipmentStatus.IN_TRANSIT,
      ShipmentStatus.DELIVERED,
      carrier.id,
    );
    return saved;
  }

  async confirmDelivery(shipmentId: string, shipper: User): Promise<Shipment> {
    const shipment = await this.findOne(shipmentId);

    if (shipment.shipperId !== shipper.id && shipper.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only the shipper can confirm delivery');
    }
    this.assertTransitionAllowed(
      shipment.status,
      ShipmentStatus.COMPLETED,
      shipper.role,
    );

    shipment.status = ShipmentStatus.COMPLETED;
    const saved = await this.shipmentRepo.save(shipment);
    await this.recordHistory(
      shipmentId,
      ShipmentStatus.DELIVERED,
      ShipmentStatus.COMPLETED,
      shipper.id,
    );
    return saved;
  }

  async cancel(
    shipmentId: string,
    user: User,
    reason?: string,
  ): Promise<Shipment> {
    const shipment = await this.findOne(shipmentId);

    const isShipper = shipment.shipperId === user.id;
    const isCarrier = shipment.carrierId === user.id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isShipper && !isCarrier && !isAdmin) {
      throw new ForbiddenException('Not authorised to cancel this shipment');
    }
    this.assertTransitionAllowed(
      shipment.status,
      ShipmentStatus.CANCELLED,
      user.role,
    );

    shipment.status = ShipmentStatus.CANCELLED;
    const saved = await this.shipmentRepo.save(shipment);
    await this.recordHistory(
      shipmentId,
      shipment.status,
      ShipmentStatus.CANCELLED,
      user.id,
      reason,
    );
    return saved;
  }

  async raiseDispute(
    shipmentId: string,
    user: User,
    reason: string,
  ): Promise<Shipment> {
    const shipment = await this.findOne(shipmentId);

    const isParty =
      shipment.shipperId === user.id ||
      shipment.carrierId === user.id ||
      user.role === UserRole.ADMIN;
    if (!isParty)
      throw new ForbiddenException('Not authorised to raise a dispute');

    this.assertTransitionAllowed(
      shipment.status,
      ShipmentStatus.DISPUTED,
      user.role,
    );

    shipment.status = ShipmentStatus.DISPUTED;
    const saved = await this.shipmentRepo.save(shipment);
    await this.recordHistory(
      shipmentId,
      shipment.status,
      ShipmentStatus.DISPUTED,
      user.id,
      reason,
    );
    return saved;
  }

  async resolveDispute(
    shipmentId: string,
    admin: User,
    resolution: ShipmentStatus.COMPLETED | ShipmentStatus.CANCELLED,
    reason: string,
  ): Promise<Shipment> {
    const shipment = await this.findOne(shipmentId);
    this.assertTransitionAllowed(shipment.status, resolution, admin.role);

    shipment.status = resolution;
    const saved = await this.shipmentRepo.save(shipment);
    await this.recordHistory(
      shipmentId,
      ShipmentStatus.DISPUTED,
      resolution,
      admin.id,
      reason,
    );
    return saved;
  }

  // ── History ──────────────────────────────────────────────────────────────────

  async getHistory(shipmentId: string): Promise<ShipmentStatusHistory[]> {
    await this.findOne(shipmentId); // ensure it exists
    return this.historyRepo.find({
      where: { shipmentId },
      relations: ['changedBy'],
      order: { changedAt: 'ASC' },
    });
  }
}
