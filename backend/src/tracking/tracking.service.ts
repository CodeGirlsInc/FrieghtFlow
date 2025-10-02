import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingEvent } from './tracking-event.entity';
import { CreateTrackingEventDto } from './dto/create-tracking-event.dto';
import { Shipment } from '../shipment/shipment.entity';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(TrackingEvent)
    private readonly trackingRepo: Repository<TrackingEvent>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  async create(dto: CreateTrackingEventDto): Promise<TrackingEvent> {
    const shipment = await this.shipmentRepo.findOne({ where: { id: dto.shipmentId } });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const event = this.trackingRepo.create({
      shipmentId: dto.shipmentId,
      location: dto.location,
      statusUpdate: dto.statusUpdate,
    });
    return this.trackingRepo.save(event);
  }

  async findByShipment(shipmentId: string): Promise<TrackingEvent[]> {
    const shipment = await this.shipmentRepo.findOne({ where: { id: shipmentId } });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return this.trackingRepo.find({
      where: { shipmentId },
      order: { timestamp: 'ASC' },
    });
  }
}
