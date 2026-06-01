import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShipmentStatusHistory } from './entities/shipment-status-history.entity';

@Injectable()
export class ShipmentStatusHistoryService {
  constructor(
    @InjectRepository(ShipmentStatusHistory)
    private repo: Repository<ShipmentStatusHistory>,
  ) {}

  async record(shipmentId: string, from: string | null, to: string, actorId?: string, actorRole?: string) {
    const entry = this.repo.create({ shipmentId, fromStatus: from, toStatus: to, actorId, actorRole });
    return this.repo.save(entry);
  }

  async getHistory(shipmentId: string) {
    return this.repo.find({ where: { shipmentId }, order: { createdAt: 'ASC' } });
  }
}
