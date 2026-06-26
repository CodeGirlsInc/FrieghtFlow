import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LocationUpdatesService {
  constructor(
    @InjectRepository(Location) private readonly locRepo: Repository<Location>,
    @InjectRepository(Shipment) private readonly shipmentRepo: Repository<Shipment>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async recordLocation(shipmentId: string, carrierId: string, lat: number, lng: number, timestamp: number) {
    const shipment = await this.shipmentRepo.findOne({ where: { id: shipmentId } });
    if (!shipment) throw new BadRequestException('Shipment not found');
    if (shipment.status !== ShipmentStatus.IN_TRANSIT) throw new BadRequestException('Shipment is not in transit');
    if (shipment.carrierId !== carrierId) throw new ForbiddenException('Only the assigned carrier can update location');

    const location = this.locRepo.create({ shipmentId, lat, lng });
    await this.locRepo.save(location);

    const history = await this.locRepo.find({ where: { shipmentId }, order: { createdAt: 'ASC' } });
    if (history.length > 10) {
      const toDelete = history.slice(0, history.length - 10);
      await this.locRepo.remove(toDelete);
    }

    this.eventEmitter.emit('shipment.location.updated', { shipmentId, lat, lng, timestamp });

    return location;
  }

  async getHistory(shipmentId: string): Promise<Location[]> {
    return this.locRepo.find({ where: { shipmentId }, order: { createdAt: 'ASC' } });
  }
}
