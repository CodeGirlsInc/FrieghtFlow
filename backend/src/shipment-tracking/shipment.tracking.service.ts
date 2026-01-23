import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingEvent } from './entities/tracking-event.entity';
import { CreateTrackingEventDto } from './dto/create-tracking-event.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';

@Injectable()
export class ShipmentTrackingService {
  constructor(
    @InjectRepository(TrackingEvent)
    private trackingEventRepository: Repository<TrackingEvent>,
  ) {}

  async createTrackingEvent(
    shipmentId: string,
    createDto: CreateTrackingEventDto,
  ): Promise<TrackingEvent> {
    const trackingEvent = this.trackingEventRepository.create({
      shipmentId,
      ...createDto,
      timestamp: createDto.timestamp ? new Date(createDto.timestamp) : new Date(),
    });

    return await this.trackingEventRepository.save(trackingEvent);
  }

  async getTrackingHistory(shipmentId: string): Promise<TrackingEvent[]> {
    const events = await this.trackingEventRepository.find({
      where: { shipmentId },
      order: { timestamp: 'DESC' },
    });

    if (events.length === 0) {
      throw new NotFoundException(
        `No tracking history found for shipment ${shipmentId}`,
      );
    }

    return events;
  }

  async getCurrentLocation(shipmentId: string): Promise<TrackingEvent> {
    const currentLocation = await this.trackingEventRepository.findOne({
      where: { shipmentId },
      order: { timestamp: 'DESC' },
    });

    if (!currentLocation) {
      throw new NotFoundException(
        `No location data found for shipment ${shipmentId}`,
      );
    }

    return currentLocation;
  }

  async updateShipmentStatus(
    shipmentId: string,
    updateDto: UpdateShipmentStatusDto,
    userId: string,
  ): Promise<TrackingEvent> {
    const currentLocation = await this.getCurrentLocation(shipmentId);

    if (!currentLocation) {
      throw new BadRequestException(
        'Cannot update status without existing location data',
      );
    }

    const updatedEvent = this.trackingEventRepository.create({
      shipmentId,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      status: updateDto.status,
      timestamp: new Date(),
      recordedBy: userId,
      metadata: {
        ...currentLocation.metadata,
        ...updateDto.metadata,
        previousStatus: currentLocation.status,
      },
    });

    return await this.trackingEventRepository.save(updatedEvent);
  }

  async deleteTrackingEvent(eventId: string): Promise<void> {
    const result = await this.trackingEventRepository.delete(eventId);

    if (result.affected === 0) {
      throw new NotFoundException(`Tracking event ${eventId} not found`);
    }
  }
}
