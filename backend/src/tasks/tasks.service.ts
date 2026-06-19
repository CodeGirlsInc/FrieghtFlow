import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Bid, BidStatus } from '../bids/entities/bid.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import * as fs from 'fs';
import * as path from 'path';
import { Document } from '../documents/entities/document.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  @Cron('0 * * * *')
  async handleBidExpiry() {
    const now = new Date();
    this.logger.log('Running Bid Expiry cron job');

    const result = await this.bidRepository.update(
      {
        status: BidStatus.PENDING,
        expiresAt: LessThan(now),
      },
      {
        status: BidStatus.EXPIRED,
      },
    );

    this.logger.log(`Expired ${result.affected || 0} bids.`);
  }

  @Cron('0 2 * * *')
  async handleStuckShipmentCheck() {
    this.logger.log('Running Stuck Shipment Check cron job');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stuckShipments = await this.shipmentRepository.find({
      where: {
        status: ShipmentStatus.IN_TRANSIT,
        updatedAt: LessThan(thirtyDaysAgo),
      },
    });

    if (stuckShipments.length > 0) {
      const ids = stuckShipments.map((s) => s.id).join(', ');
      this.logger.warn(`Found ${stuckShipments.length} stuck shipments: ${ids}`);
      // Create admin notification - since no DB entity for notifications, we log it prominently
      this.logger.warn('ADMIN NOTIFICATION: Please review stuck shipments.');
    }
  }

  @Cron('0 3 * * *')
  async handleTempFileCleanup() {
    this.logger.log('Running Temp File Cleanup cron job');
    const uploadsDir = path.resolve(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      return;
    }

    const files = fs.readdirSync(uploadsDir);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile() && stat.mtime < sevenDaysAgo) {
        // Check if DB has record
        const docCount = await this.documentRepository.count({
          where: { storedName: file },
        });

        if (docCount === 0) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    }

    this.logger.log(`Deleted ${deletedCount} temp files.`);
  }
}
