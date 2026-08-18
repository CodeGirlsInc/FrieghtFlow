import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Readable, Transform } from 'node:stream';
import {
  Repository,
  FindOptionsWhere,
  ILike,
  SelectQueryBuilder,
} from 'typeorm';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatusHistory } from './entities/shipment-status-history.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { QueryShipmentDto } from './dto/query-shipment.dto';
import { BatchCreateShipmentsDto } from './dto/batch-create-shipments.dto';
import { ExportShipmentsDto } from './dto/export-shipments.dto';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import {
  SHIPMENT_CREATED,
  SHIPMENT_ACCEPTED,
  SHIPMENT_IN_TRANSIT,
  SHIPMENT_DELIVERED,
  SHIPMENT_COMPLETED,
  SHIPMENT_CANCELLED,
  SHIPMENT_DISPUTED,
  SHIPMENT_DISPUTE_RESOLVED,
  ShipmentEvent,
} from './events/shipment.events';

export interface PaginatedShipments {
  data: Shipment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type ShipmentExportFormat = ExportShipmentsDto['format'];

type ShipmentExportRow = {
  id: string;
  trackingNumber: string;
  shipperId: string;
  carrierId: string | null;
  origin: string;
  destination: string;
  cargoDescription: string;
  weightKg: string | number;
  volumeCbm: string | number | null;
  price: string | number;
  currency: string;
  status: ShipmentStatus;
  pickupDate: Date | string | null;
  estimatedDeliveryDate: Date | string | null;
  actualDeliveryDate: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

interface ShipmentExportResult {
  stream: Readable;
  contentType: string;
  fileName: string;
}

type ShipmentExportValue = string | number | Date | null | undefined;

@Injectable()
export class ShipmentsService {
  private readonly logger = new Logger(ShipmentsService.name);
  private readonly exportColumns: Array<keyof ShipmentExportRow> = [
    'id',
    'trackingNumber',
    'shipperId',
    'carrierId',
    'origin',
    'destination',
    'cargoDescription',
    'weightKg',
    'volumeCbm',
    'price',
    'currency',
    'status',
    'pickupDate',
    'estimatedDeliveryDate',
    'actualDeliveryDate',
    'createdAt',
    'updatedAt',
  ];

  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(ShipmentStatusHistory)
    private readonly historyRepo: Repository<ShipmentStatusHistory>,
    private readonly eventEmitter: EventEmitter2,
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
    const insurancePremium = dto.isInsured
      ? Math.round(dto.price * 0.015 * 100) / 100
      : null;

    const shipment = this.shipmentRepo.create({
      trackingNumber: this.generateTrackingNumber(),
      shipperId,
      carrierId: null,
      origin: dto.origin,
      destination: dto.destination,
      cargoDescription: dto.cargoDescription,
      cargoCategory: dto.cargoCategory ?? null,
      weightKg: dto.weightKg,
      volumeCbm: dto.volumeCbm ?? null,
      price: dto.price,
      currency: dto.currency ?? 'USD',
      notes: dto.notes ?? null,
      status: ShipmentStatus.PENDING,
      isInsured: dto.isInsured ?? false,
      insurancePremium,
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
    // Reload with relations for notification payload
    const full = await this.findOne(saved.id);
    this.eventEmitter.emit(
      SHIPMENT_CREATED,
      new ShipmentEvent(full, shipperId),
    );
    return saved;
  }

  async batchCreate(
    shipperId: string,
    dto: BatchCreateShipmentsDto,
  ): Promise<string[]> {
    const createdIds: string[] = [];

    // Use TypeORM transaction
    const queryRunner = this.shipmentRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const shipmentDto of dto.shipments) {
        const insurancePremium = shipmentDto.isInsured
          ? Math.round(shipmentDto.price * 0.015 * 100) / 100
          : null;

        const shipment = this.shipmentRepo.create({
          trackingNumber: this.generateTrackingNumber(),
          shipperId,
          carrierId: null,
          origin: shipmentDto.origin,
          destination: shipmentDto.destination,
          cargoDescription: shipmentDto.cargoDescription,
          cargoCategory: shipmentDto.cargoCategory ?? null,
          weightKg: shipmentDto.weightKg,
          volumeCbm: shipmentDto.volumeCbm ?? null,
          price: shipmentDto.price,
          currency: shipmentDto.currency ?? 'USD',
          notes: shipmentDto.notes ?? null,
          status: ShipmentStatus.PENDING,
          isInsured: shipmentDto.isInsured ?? false,
          insurancePremium,
          pickupDate: shipmentDto.pickupDate
            ? new Date(shipmentDto.pickupDate)
            : null,
          estimatedDeliveryDate: shipmentDto.estimatedDeliveryDate
            ? new Date(shipmentDto.estimatedDeliveryDate)
            : null,
        });

        const saved = await queryRunner.manager.save(shipment);
        createdIds.push(saved.id);

        await this.recordHistory(
          saved.id,
          null,
          ShipmentStatus.PENDING,
          shipperId,
          'Shipment created via batch',
        );
      }

      await queryRunner.commitTransaction();

      // Emit events for all created shipments
      for (const id of createdIds) {
        const full = await this.findOne(id);
        this.eventEmitter.emit(
          SHIPMENT_CREATED,
          new ShipmentEvent(full, shipperId),
        );
      }

      return createdIds;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    user: User,
    query: QueryShipmentDto,
  ): Promise<PaginatedShipments> {
    const { page = 1, limit = 20, status, origin, destination, cargoCategory } = query;
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
    if (cargoCategory) where.cargoCategory = cargoCategory;

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
    const { page = 1, limit = 20, origin, destination, cargoCategory } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Shipment> = {
      status: ShipmentStatus.PENDING,
    };
    if (origin) where.origin = ILike(`%${origin}%`);
    if (destination) where.destination = ILike(`%${destination}%`);
    if (cargoCategory) where.cargoCategory = cargoCategory;

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

  async exportShipments(
    user: User,
    format: ShipmentExportFormat,
  ): Promise<ShipmentExportResult> {
    if (user.role !== UserRole.SHIPPER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only shippers and admins can export shipments',
      );
    }

    const queryBuilder = this.buildExportQuery(user);
    const rowStream = (await queryBuilder.stream()) as Readable;
    const timeLabel = new Date().toISOString().replace(/[.:]/g, '-');

    return {
      stream:
        format === 'csv'
          ? this.createCsvExportStream(rowStream)
          : this.createJsonExportStream(rowStream),
      contentType:
        format === 'csv'
          ? 'text/csv; charset=utf-8'
          : 'application/json; charset=utf-8',
      fileName: `shipments-${user.role === UserRole.ADMIN ? 'all' : user.id}-${timeLabel}.${format}`,
    };
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
    const full = await this.findOne(shipmentId);
    this.eventEmitter.emit(
      SHIPMENT_ACCEPTED,
      new ShipmentEvent(full, carrier.id),
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
    const full = await this.findOne(shipmentId);
    this.eventEmitter.emit(
      SHIPMENT_IN_TRANSIT,
      new ShipmentEvent(full, carrier.id),
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
    const full = await this.findOne(shipmentId);
    this.eventEmitter.emit(
      SHIPMENT_DELIVERED,
      new ShipmentEvent(full, carrier.id),
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
    const full = await this.findOne(shipmentId);
    this.eventEmitter.emit(
      SHIPMENT_COMPLETED,
      new ShipmentEvent(full, shipper.id),
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

    const previousStatus = shipment.status;
    shipment.status = ShipmentStatus.CANCELLED;
    const saved = await this.shipmentRepo.save(shipment);
    await this.recordHistory(
      shipmentId,
      previousStatus,
      ShipmentStatus.CANCELLED,
      user.id,
      reason,
    );
    const full = await this.findOne(shipmentId);
    this.eventEmitter.emit(
      SHIPMENT_CANCELLED,
      new ShipmentEvent(full, user.id, reason),
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

    const previousStatus = shipment.status;
    shipment.status = ShipmentStatus.DISPUTED;
    const saved = await this.shipmentRepo.save(shipment);
    await this.recordHistory(
      shipmentId,
      previousStatus,
      ShipmentStatus.DISPUTED,
      user.id,
      reason,
    );
    const full = await this.findOne(shipmentId);
    this.eventEmitter.emit(
      SHIPMENT_DISPUTED,
      new ShipmentEvent(full, user.id, reason),
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
    const full = await this.findOne(shipmentId);
    this.eventEmitter.emit(
      SHIPMENT_DISPUTE_RESOLVED,
      new ShipmentEvent(full, admin.id, reason),
    );
    return saved;
  }

  // ── Analytics ────────────────────────────────────────────────────────────────

  async getAnalytics(user: User, query: AnalyticsQueryDto) {
    const qb = this.shipmentRepo.createQueryBuilder('s');

    if (user.role === UserRole.SHIPPER) {
      qb.where('s.shipper_id = :uid', { uid: user.id });
    }

    if (query.from && query.to) {
      qb.andWhere('s.created_at BETWEEN :from AND :to', {
        from: new Date(query.from),
        to: new Date(query.to),
      });
    } else if (query.from) {
      qb.andWhere('s.created_at >= :from', { from: new Date(query.from) });
    } else if (query.to) {
      qb.andWhere('s.created_at <= :to', { to: new Date(query.to) });
    }

    // Counts by status
    const byStatus = await qb
      .clone()
      .select('s.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('s.status')
      .getRawMany<{ status: ShipmentStatus; count: string }>();

    const statusCounts = Object.fromEntries(
      byStatus.map(({ status, count }) => [status, Number(count)]),
    ) as Record<ShipmentStatus, number>;

    // Total revenue from COMPLETED shipments
    const revenueRow = await qb
      .clone()
      .andWhere('s.status = :completed', {
        completed: ShipmentStatus.COMPLETED,
      })
      .select('COALESCE(SUM(CAST(s.price AS numeric)), 0)', 'total')
      .getRawOne<{ total: string }>();

    const totalRevenue = Number(revenueRow?.total ?? 0);

    // Daily counts for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRows = await qb
      .clone()
      .andWhere('s.created_at >= :since', { since: thirtyDaysAgo })
      .select("DATE_TRUNC('day', s.created_at)", 'day')
      .addSelect('COUNT(*)', 'count')
      .groupBy("DATE_TRUNC('day', s.created_at)")
      .orderBy("DATE_TRUNC('day', s.created_at)", 'ASC')
      .getRawMany<{ day: string; count: string }>();

    const dailyTrends = dailyRows.map(({ day, count }) => ({
      date: new Date(day).toISOString().slice(0, 10),
      count: Number(count),
    }));

    return { statusCounts, totalRevenue, dailyTrends };
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

  private buildExportQuery(user: User): SelectQueryBuilder<Shipment> {
    const queryBuilder = this.shipmentRepo
      .createQueryBuilder('shipment')
      .select([
        'shipment.id AS "id"',
        'shipment.trackingNumber AS "trackingNumber"',
        'shipment.shipperId AS "shipperId"',
        'shipment.carrierId AS "carrierId"',
        'shipment.origin AS "origin"',
        'shipment.destination AS "destination"',
        'shipment.cargoDescription AS "cargoDescription"',
        'shipment.weightKg AS "weightKg"',
        'shipment.volumeCbm AS "volumeCbm"',
        'shipment.price AS "price"',
        'shipment.currency AS "currency"',
        'shipment.status AS "status"',
        'shipment.pickupDate AS "pickupDate"',
        'shipment.estimatedDeliveryDate AS "estimatedDeliveryDate"',
        'shipment.actualDeliveryDate AS "actualDeliveryDate"',
        'shipment.createdAt AS "createdAt"',
        'shipment.updatedAt AS "updatedAt"',
      ])
      .orderBy('shipment.createdAt', 'DESC');

    if (user.role === UserRole.SHIPPER) {
      queryBuilder.where('shipment.shipperId = :shipperId', {
        shipperId: user.id,
      });
    }

    return queryBuilder;
  }

  private createCsvExportStream(rowStream: Readable): Readable {
    let wroteHeader = false;

    const transformer = new Transform({
      writableObjectMode: true,
      transform: (chunk: ShipmentExportRow, _encoding, callback) => {
        const row = this.normalizeExportRow(chunk);
        const lines: string[] = [];

        if (!wroteHeader) {
          lines.push(`${this.exportColumns.join(',')}\n`);
          wroteHeader = true;
        }

        lines.push(
          `${this.exportColumns
            .map((column) => this.escapeCsvValue(row[column]))
            .join(',')}\n`,
        );

        callback(null, lines.join(''));
      },
      flush: (callback) => {
        if (!wroteHeader) {
          callback(null, `${this.exportColumns.join(',')}\n`);
          return;
        }

        callback();
      },
    });

    return rowStream.pipe(transformer);
  }

  private createJsonExportStream(rowStream: Readable): Readable {
    let isFirstRow = true;

    const transformer = new Transform({
      writableObjectMode: true,
      transform: (chunk: ShipmentExportRow, _encoding, callback) => {
        const row = this.normalizeExportRow(chunk);
        const prefix = isFirstRow ? '[' : ',';
        isFirstRow = false;
        callback(null, `${prefix}${JSON.stringify(row)}`);
      },
      flush: (callback) => {
        callback(null, isFirstRow ? '[]' : ']');
      },
    });

    return rowStream.pipe(transformer);
  }

  private normalizeExportRow(row: ShipmentExportRow): Record<string, string> {
    return this.exportColumns.reduce<Record<string, string>>(
      (accumulator, column) => {
        accumulator[column] = this.formatExportValue(row[column]);
        return accumulator;
      },
      {},
    );
  }

  private formatExportValue(value: ShipmentExportValue): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return String(value);
  }

  private escapeCsvValue(value: string): string {
    const escapedValue = value.replace(/"/g, '""');
    if (/[",\n]/.test(value)) {
      return `"${escapedValue}"`;
    }

    return escapedValue;
  }
}
