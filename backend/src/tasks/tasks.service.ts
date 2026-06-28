import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Shipment } from '../shipments/entities/shipment.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { NotificationType } from '../notifications/entities/notification.entity';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  @Cron('0 2 * * *')
  async flagStuckShipments(): Promise<void> {
    const threshold = new Date(Date.now() - THIRTY_DAYS_MS);

    const stuck = await this.shipmentRepo.find({
      where: {
        status: ShipmentStatus.IN_TRANSIT,
        updatedAt: LessThan(threshold),
      },
      select: ['id', 'shipperId', 'trackingNumber'],
    });

    if (stuck.length === 0) return;

    const ids = stuck.map((s) => s.id);
    this.logger.warn(
      `Found ${stuck.length} stuck shipments: ${ids.join(', ')}`,
    );

    const notifications = stuck.map((shipment) =>
      this.notificationRepo.create({
        userId: shipment.shipperId,
        type: NotificationType.GENERAL,
        title: 'Shipment stuck in transit',
        message: `Shipment ${shipment.trackingNumber} has been in transit for more than 30 days.`,
        isRead: false,
      }),
    );

    await this.notificationRepo.save(notifications);
  }

  @Cron('0 3 * * *')
  async cleanupTempFiles(): Promise<void> {
    if (!fs.existsSync(UPLOADS_DIR)) return;

    const cutoff = Date.now() - SEVEN_DAYS_MS;
    let deleted = 0;

    try {
      const entries = fs.readdirSync(UPLOADS_DIR);
      for (const entry of entries) {
        const filePath = path.join(UPLOADS_DIR, entry);
        const stat = fs.statSync(filePath);
        if (stat.isFile() && stat.mtimeMs < cutoff) {
          fs.unlinkSync(filePath);
          deleted++;
        }
      }
    } catch (err) {
      this.logger.error('Temp file cleanup failed', err);
    }

    this.logger.log(`Temp file cleanup: removed ${deleted} old upload(s)`);
  }
}
