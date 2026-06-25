import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Readable, Transform } from 'node:stream';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import * as ExcelJS from 'exceljs';
import {
  Repository,
  FindOptionsWhere,
  ILike,
  SelectQueryBuilder,
  MoreThanOrEqual,
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
import { CargoCategory } from '../common/enums/cargo-category.enum';
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
import { EtaService, resolveZone } from './eta.service';
import { Redis } from 'ioredis';
import {
  ZONE_BASE_RATES,
  RATE_PER_KG,
  CATEGORY_MULTIPLIERS,
  DEFAULT_ZONE_BASE_RATE,
} from './quotes.config';

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

interface MarketRateResponse {
  insufficient_data?: boolean;
  message?: string;
  min?: number;
  max?: number;
  average?: number;
  median?: number;
  sampleSize?: number;
  currency?: string;
  broadened?: boolean;
}

type ShipmentExportValue = string | number | Date | null | undefined;

@Injectable()
export class ShipmentsService {
  private readonly logger = new Logger(ShipmentsService.name);
  private redisClient: Redis | null = null;
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
    private readonly etaService: EtaService,
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

  private getRedisClient(): Redis | null {
    if (!this.redisClient) {
      try {
        this.redisClient = new Redis(
          process.env.REDIS_URL || 'redis://localhost:6379',
          { lazyConnect: true },
        );
      } catch {
        return null;
      }
    }

    return this.redisClient;
  }

  private sanitizeKeyValue(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '-');
  }

  private async getCachedMarketRate(
    key: string,
  ): Promise<MarketRateResponse | null> {
    const client = this.getRedisClient();
    if (!client) return null;

    try {
      const cachedValue = await client.get(key);
      return cachedValue
        ? (JSON.parse(cachedValue) as MarketRateResponse)
        : null;
    } catch {
      return null;
    }
  }

  private async setCachedMarketRate(
    key: string,
    value: MarketRateResponse,
  ): Promise<void> {
    const client = this.getRedisClient();
    if (!client) return;

    try {
      await client.setex(key, 3600, JSON.stringify(value));
    } catch {
      // Ignore Redis failures and fall back to in-memory response.
    }
  }

  private matchesLane(
    shipmentOrigin: string | undefined,
    shipmentDestination: string | undefined,
    origin: string,
    destination: string,
  ): boolean {
    return (
      (shipmentOrigin?.toLowerCase().includes(origin.toLowerCase()) || false) &&
      (shipmentDestination?.toLowerCase().includes(destination.toLowerCase()) ||
        false)
    );
  }

  private getCountry(value: string): string {
    const parts = value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    return (parts.at(-1) ?? value).toLowerCase();
  }

  private buildRateStats(
    prices: Array<number | null | undefined>,
    currency: string,
  ): MarketRateResponse {
    const validPrices = prices.filter(
      (price): price is number =>
        typeof price === 'number' && Number.isFinite(price),
    );

    if (validPrices.length === 0) {
      return {
        insufficient_data: true,
        message:
          'Not enough completed shipments on this lane to estimate a rate',
      };
    }

    const sorted = [...validPrices].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const average =
      sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    return {
      min,
      max,
      average,
      median,
      sampleSize: sorted.length,
      currency: currency || 'USD',
    };
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  async create(shipperId: string, dto: CreateShipmentDto): Promise<Shipment> {
    const effectivePrice =
      dto.isRFQ && dto.price === undefined ? null : dto.price;
    const insurancePremium =
      dto.isInsured && effectivePrice !== null && effectivePrice !== undefined
        ? Math.round(effectivePrice * 0.015 * 100) / 100
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
      price: effectivePrice,
      isRFQ: dto.isRFQ ?? false,
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
    const queryRunner =
      this.shipmentRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const shipmentDto of dto.shipments) {
        const effectivePrice =
          shipmentDto.isRFQ && shipmentDto.price === undefined
            ? null
            : shipmentDto.price;
        const insurancePremium =
          shipmentDto.isInsured &&
          effectivePrice !== null &&
          effectivePrice !== undefined
            ? Math.round(effectivePrice * 0.015 * 100) / 100
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
          price: effectivePrice,
          isRFQ: shipmentDto.isRFQ ?? false,
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
    const {
      page = 1,
      limit = 20,
      status,
      origin,
      destination,
      cargoCategory,
    } = query;
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

  async getMarketRate(query: {
    origin: string;
    destination: string;
    weightKg?: number;
    cargoCategory?: CargoCategory;
  }): Promise<MarketRateResponse> {
    const origin = query.origin?.trim();
    const destination = query.destination?.trim();
    const cargoCategory = query.cargoCategory;

    if (!origin || !destination) {
      throw new BadRequestException('origin and destination are required');
    }

    const cacheKey = `market-rate:${this.sanitizeKeyValue(origin)}:${this.sanitizeKeyValue(destination)}:${this.sanitizeKeyValue(cargoCategory ?? 'general')}`;
    const cachedValue = await this.getCachedMarketRate(cacheKey);
    if (cachedValue) {
      return cachedValue;
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const shipments = await this.shipmentRepo.find({
      where: {
        status: ShipmentStatus.COMPLETED,
        updatedAt: MoreThanOrEqual(ninetyDaysAgo),
        cargoCategory: cargoCategory ?? undefined,
      },
      select: ['price', 'origin', 'destination', 'currency'],
    });

    const sameLane = shipments.filter((shipment) =>
      this.matchesLane(
        shipment.origin,
        shipment.destination,
        origin,
        destination,
      ),
    );

    const laneToUse =
      sameLane.length >= 5
        ? sameLane
        : shipments.filter((shipment) => {
            return (
              this.getCountry(shipment.origin) === this.getCountry(origin) &&
              this.getCountry(shipment.destination) ===
                this.getCountry(destination)
            );
          });

    if (laneToUse.length < 5) {
      return {
        insufficient_data: true,
        message:
          'Not enough completed shipments on this lane to estimate a rate',
      };
    }

    const stats = this.buildRateStats(
      laneToUse.map((shipment) => shipment.price),
      laneToUse[0]?.currency ?? 'USD',
    );

    if ('insufficient_data' in stats) {
      return stats;
    }

    const response = {
      ...stats,
      ...(sameLane.length < 5 ? { broadened: true } : {}),
    };

    await this.setCachedMarketRate(cacheKey, response);
    return response;
  }

  estimatePrice(dto: {
    origin: string;
    destination: string;
    weightKg: number;
    volumeCbm?: number;
    cargoCategory?: CargoCategory;
  }) {
    if (!dto.origin || !dto.destination || dto.weightKg <= 0) {
      throw new BadRequestException(
        'origin, destination, and weightKg are required',
      );
    }

    const originZone = resolveZone(dto.origin);
    const destinationZone = resolveZone(dto.destination);
    const zoneKey = `${originZone}-${destinationZone}`;
    const reverseKey = `${destinationZone}-${originZone}`;
    const baseRate =
      ZONE_BASE_RATES[zoneKey] ??
      ZONE_BASE_RATES[reverseKey] ??
      DEFAULT_ZONE_BASE_RATE;
    const weightCharge = dto.weightKg * RATE_PER_KG;
    const categoryMultiplier =
      CATEGORY_MULTIPLIERS[dto.cargoCategory ?? CargoCategory.GENERAL_CARGO] ??
      1;
    const estimatedMin = Number(
      (baseRate * categoryMultiplier + weightCharge).toFixed(2),
    );
    const estimatedMax = Number((estimatedMin * 1.15).toFixed(2));
    const eta = this.etaService.estimate({
      origin: dto.origin,
      destination: dto.destination,
      weightKg: dto.weightKg,
    });

    return {
      estimatedMin,
      estimatedMax,
      currency: 'USD',
      estimatedDeliveryDays: eta.estimatedTransitDays,
      breakdown: {
        baseRate,
        weightCharge,
        categoryMultiplier,
      },
    };
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

    const timeLabel = new Date().toISOString().replace(/[.:]/g, '-');
    const fileLabel = user.role === UserRole.ADMIN ? 'all' : user.id;

    if (format === 'xlsx') {
      const buffer = await this.createXlsxBuffer(user);
      const stream = new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        },
      });
      return {
        stream,
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileName: `shipments-${fileLabel}-${timeLabel}.xlsx`,
      };
    }

    const queryBuilder = this.buildExportQuery(user);
    const rowStream = (await queryBuilder.stream()) as Readable;

    return {
      stream:
        format === 'csv'
          ? this.createCsvExportStream(rowStream)
          : this.createJsonExportStream(rowStream),
      contentType:
        format === 'csv'
          ? 'text/csv; charset=utf-8'
          : 'application/json; charset=utf-8',
      fileName: `shipments-${fileLabel}-${timeLabel}.${format}`,
    };
  }

  async generateBol(
    shipmentId: string,
    user: User,
  ): Promise<{ buffer: Buffer; trackingNumber: string }> {
    const shipment = await this.findOne(shipmentId);

    const isShipper = shipment.shipperId === user.id;
    const isCarrier = shipment.carrierId === user.id;
    const isAdmin = user.role === UserRole.ADMIN;
    if (!isShipper && !isCarrier && !isAdmin) {
      throw new ForbiddenException(
        'Only parties to this shipment or an admin can download the Bill of Lading',
      );
    }

    const unavailableStatuses = [ShipmentStatus.PENDING];
    if (unavailableStatuses.includes(shipment.status)) {
      throw new BadRequestException(
        'Bill of Lading is not available for shipments in pending status',
      );
    }

    const frontendUrl = process.env.FRONTEND_URL ?? 'https://freightflow.app';
    const trackingUrl = `${frontendUrl}/track/${shipment.trackingNumber}`;
    const qrBuffer = await QRCode.toBuffer(trackingUrl, {
      type: 'png',
      width: 120,
    });

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk as Buffer));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const shipperName = shipment.shipper
        ? `${shipment.shipper.firstName} ${shipment.shipper.lastName}`
        : 'Unknown';
      const carrierName = shipment.carrier
        ? `${shipment.carrier.firstName} ${shipment.carrier.lastName}`
        : 'Unassigned';

      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('BILL OF LADING', { align: 'center' });
      doc.moveDown(0.4);
      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`BoL Number: ${shipment.trackingNumber}`, { align: 'center' });
      doc.text(`Issue Date: ${new Date().toLocaleDateString('en-US')}`, {
        align: 'center',
      });
      doc.moveDown(1);

      doc.fontSize(13).font('Helvetica-Bold').text('Parties');
      doc.fontSize(10).font('Helvetica');
      doc.text(
        `Shipper: ${shipperName}${shipment.shipper?.email ? ` | ${shipment.shipper.email}` : ''}`,
      );
      doc.text(
        `Carrier: ${carrierName}${shipment.carrier?.email ? ` | ${shipment.carrier.email}` : ''}`,
      );
      doc.moveDown(1);

      doc.fontSize(13).font('Helvetica-Bold').text('Route');
      doc.fontSize(10).font('Helvetica');
      doc.text(
        `Origin → Destination: ${shipment.origin} → ${shipment.destination}`,
      );
      if (shipment.pickupDate) {
        doc.text(
          `Pickup Date: ${new Date(shipment.pickupDate).toLocaleDateString('en-US')}`,
        );
      }
      if (shipment.estimatedDeliveryDate) {
        doc.text(
          `Estimated Delivery: ${new Date(shipment.estimatedDeliveryDate).toLocaleDateString('en-US')}`,
        );
      }
      doc.moveDown(1);

      doc.fontSize(13).font('Helvetica-Bold').text('Cargo');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Description: ${shipment.cargoDescription}`);
      if (shipment.cargoCategory) {
        doc.text(`Category: ${shipment.cargoCategory}`);
      }
      doc.text(`Weight: ${String(shipment.weightKg)} kg`);
      if (shipment.volumeCbm != null) {
        doc.text(`Volume: ${String(shipment.volumeCbm)} cbm`);
      }
      doc.text(
        shipment.isInsured
          ? `Insurance: Yes — Premium: ${String(shipment.insurancePremium ?? 0)} ${shipment.currency}`
          : 'Insurance: No',
      );
      doc.moveDown(1);

      doc.fontSize(13).font('Helvetica-Bold').text('Financial');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Agreed Price: ${String(shipment.price)} ${shipment.currency}`);
      doc.moveDown(1);

      doc.image(qrBuffer, { width: 120 });
      doc.moveDown(0.4);
      doc.fontSize(9).text(`Scan to track: ${trackingUrl}`);
      doc.moveDown(2);

      doc.fontSize(10).font('Helvetica');
      doc.text(
        '_________________________________          _________________________________',
      );
      doc.text(
        'Shipper Signature & Date                    Carrier Signature & Date',
      );
      doc.moveDown(2);

      doc
        .fontSize(9)
        .fillColor('#666666')
        .text(
          'Generated by FreightFlow | Blockchain Tx: Pending verification',
          { align: 'center' },
        );

      doc.end();
    });

    return { buffer, trackingNumber: shipment.trackingNumber };
  }

  async generateInvoice(
    shipmentId: string,
    user: User,
  ): Promise<{ buffer: Buffer; trackingNumber: string }> {
    const shipment = await this.findOne(shipmentId);

    const isShipper = shipment.shipperId === user.id;
    const isAdmin = user.role === UserRole.ADMIN;
    if (!isShipper && !isAdmin) {
      throw new ForbiddenException(
        'Only the shipper or an admin can download the invoice',
      );
    }

    if (shipment.status !== ShipmentStatus.COMPLETED) {
      throw new BadRequestException(
        'Invoice is only available for completed shipments',
      );
    }

    const platformFeePercent = parseFloat(
      process.env.PLATFORM_FEE_PERCENT ?? '2.5',
    );
    const freightCharge = Number(shipment.price);
    const insurancePremium =
      shipment.isInsured && shipment.insurancePremium != null
        ? Number(shipment.insurancePremium)
        : 0;
    const platformFee = Math.round(freightCharge * platformFeePercent) / 100;
    const total = freightCharge + insurancePremium + platformFee;

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk as Buffer));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const shipperName = shipment.shipper
        ? `${shipment.shipper.firstName} ${shipment.shipper.lastName}`
        : 'Unknown';

      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('FREIGHT INVOICE', { align: 'center' });
      doc.moveDown(0.4);
      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Invoice No.: INV-${shipment.trackingNumber}`, {
          align: 'center',
        });
      doc.text(`Issue Date: ${new Date().toLocaleDateString('en-US')}`, {
        align: 'center',
      });
      doc.moveDown(1);

      doc.fontSize(13).font('Helvetica-Bold').text('Bill To');
      doc.fontSize(10).font('Helvetica');
      doc.text(shipperName);
      if (shipment.shipper?.email) {
        doc.text(shipment.shipper.email);
      }
      doc.moveDown(1);

      doc.fontSize(13).font('Helvetica-Bold').text('Line Items');
      doc.fontSize(10).font('Helvetica');
      doc.text(
        `Freight Charge: ${freightCharge.toFixed(2)} ${shipment.currency}`,
      );
      if (insurancePremium > 0) {
        doc.text(
          `Insurance Premium: ${insurancePremium.toFixed(2)} ${shipment.currency}`,
        );
      }
      doc.text(
        `Platform Fee (${platformFeePercent.toFixed(1)}%): ${platformFee.toFixed(2)} ${shipment.currency}`,
      );
      doc.moveDown(0.5);
      doc
        .font('Helvetica-Bold')
        .text(`Total: ${total.toFixed(2)} ${shipment.currency}`);
      doc.moveDown(1);

      doc.fontSize(13).font('Helvetica-Bold').text('Payment');
      doc.fontSize(10).font('Helvetica');
      doc.font('Helvetica-Bold').fillColor('#1a7a1a').text('Status: Paid');
      doc.fillColor('black');
      doc.moveDown(2);

      doc
        .fontSize(9)
        .fillColor('#666666')
        .text(`Generated ${new Date().toISOString()} | FreightFlow`, {
          align: 'center',
        });

      doc.end();
    });

    return { buffer, trackingNumber: shipment.trackingNumber };
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

  private async createXlsxBuffer(user: User): Promise<Buffer> {
    const where: FindOptionsWhere<Shipment> = {};
    if (user.role === UserRole.SHIPPER) {
      where.shipperId = user.id;
    }

    const shipments = await this.shipmentRepo.find({
      where,
      relations: ['shipper', 'carrier'],
      order: { createdAt: 'DESC' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Shipments');

    sheet.columns = [
      { header: 'Tracking Number', key: 'trackingNumber', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Origin', key: 'origin', width: 20 },
      { header: 'Destination', key: 'destination', width: 20 },
      { header: 'Cargo Category', key: 'cargoCategory', width: 18 },
      { header: 'Weight (kg)', key: 'weightKg', width: 12 },
      { header: 'Price', key: 'price', width: 12 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Shipper Name', key: 'shipperName', width: 20 },
      { header: 'Carrier Name', key: 'carrierName', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 22 },
      { header: 'Completed At', key: 'completedAt', width: 22 },
    ];

    sheet.getRow(1).font = { bold: true };

    for (const s of shipments) {
      sheet.addRow({
        trackingNumber: s.trackingNumber,
        status: s.status,
        origin: s.origin,
        destination: s.destination,
        cargoCategory: s.cargoCategory ?? '',
        weightKg: s.weightKg,
        price: s.price,
        currency: s.currency,
        shipperName: s.shipper
          ? `${s.shipper.firstName} ${s.shipper.lastName}`
          : '',
        carrierName: s.carrier
          ? `${s.carrier.firstName} ${s.carrier.lastName}`
          : '',
        createdAt: s.createdAt?.toISOString() ?? '',
        completedAt: s.actualDeliveryDate?.toISOString() ?? '',
      });
    }

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
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
