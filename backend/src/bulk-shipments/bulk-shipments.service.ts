import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';

@Injectable()
export class BulkShipmentsService {
  constructor(
    @InjectRepository(Shipment) private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  async cancel(userId: string, ids: string[]): Promise<{ succeeded: string[]; failed: { id: string; reason: string }[] }> {
    return this.bulkOperation(userId, ids, async (shipment) => {
      shipment.status = ShipmentStatus.CANCELLED;
      return shipment;
    });
  }

  async updateStatus(userId: string, ids: string[], status: ShipmentStatus): Promise<{ succeeded: string[]; failed: { id: string; reason: string }[] }> {
    return this.bulkOperation(userId, ids, async (shipment) => {
      shipment.status = status;
      return shipment;
    });
  }

  private async bulkOperation(
    userId: string,
    ids: string[],
    operation: (shipment: Shipment) => Promise<Shipment>,
  ): Promise<{ succeeded: string[]; failed: { id: string; reason: string }[] }> {
    if (ids.length > 50) throw new BadRequestException('Maximum 50 IDs per request');

    const shipments = await this.shipmentRepo.find({ where: { id: In(ids) } });
    const succeeded: string[] = [];
    const failed: { id: string; reason: string }[] = [];

    for (const id of ids) {
      const shipment = shipments.find(s => s.id === id);
      if (!shipment) {
        failed.push({ id, reason: 'Shipment not found' });
        continue;
      }
      if (shipment.shipperId !== userId) {
        failed.push({ id, reason: 'Shipment does not belong to user' });
        continue;
      }
      try {
        await operation(shipment);
        await this.shipmentRepo.save(shipment);
        succeeded.push(id);
      } catch (error) {
        failed.push({ id, reason: (error as Error).message });
      }
    }

    return { succeeded, failed };
  }
}
