// #984 – Shipment tracking: location updates, timeline & ETA
import { Injectable, Logger } from '@nestjs/common';

export interface LocationUpdate {
  shipmentId: string;
  lat: number;
  lng: number;
  timestamp: Date;
  driverNote?: string;
}
export interface TrackingTimeline {
  shipmentId: string;
  events: { label: string; timestamp: Date; completed: boolean }[];
  estimatedArrival: Date;
}

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);
  private readonly updates = new Map<string, LocationUpdate[]>();

  recordLocation(
    shipmentId: string,
    lat: number,
    lng: number,
    driverNote?: string,
  ): Promise<LocationUpdate> {
    const update: LocationUpdate = {
      shipmentId,
      lat,
      lng,
      timestamp: new Date(),
      driverNote,
    };
    const history = this.updates.get(shipmentId) ?? [];
    history.push(update);
    this.updates.set(shipmentId, history);
    this.logger.log(`Location for shipment ${shipmentId}: (${lat}, ${lng})`);
    return Promise.resolve(update);
  }

  getTimeline(shipmentId: string): Promise<TrackingTimeline> {
    const history = this.updates.get(shipmentId) ?? [];
    return Promise.resolve({
      shipmentId,
      events: history.map((u) => ({
        label: `Update${u.driverNote ? ': ' + u.driverNote : ''}`,
        timestamp: u.timestamp,
        completed: true,
      })),
      estimatedArrival: new Date(Date.now() + 2 * 60 * 60 * 1000),
    });
  }

  getLatestLocation(shipmentId: string): Promise<LocationUpdate | null> {
    const history = this.updates.get(shipmentId) ?? [];
    return Promise.resolve(history[history.length - 1] ?? null);
  }
}
