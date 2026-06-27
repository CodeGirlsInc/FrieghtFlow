// #982 – Carrier fleet management: trucks, availability & service areas
import { Injectable, Logger, BadRequestException } from '@nestjs/common';

export interface TruckEntry { id: string; carrierId: string; type: string; plateNumber: string; capacity: number; available: boolean; }
export interface ServiceArea { carrierId: string; regions: string[]; updatedAt: Date; }

@Injectable()
export class FleetService {
  private readonly logger = new Logger(FleetService.name);
  private readonly trucks = new Map<string, TruckEntry[]>();
  private readonly areas = new Map<string, ServiceArea>();

  async addTruck(carrierId: string, type: string, plateNumber: string, capacity: number): Promise<TruckEntry> {
    if (!plateNumber) throw new BadRequestException('Plate number required');
    const truck: TruckEntry = { id: `truck_${Date.now()}`, carrierId, type, plateNumber, capacity, available: true };
    const fleet = this.trucks.get(carrierId) ?? [];
    fleet.push(truck); this.trucks.set(carrierId, fleet);
    this.logger.log(`Truck ${plateNumber} added for carrier ${carrierId}`);
    return truck;
  }

  async getFleet(carrierId: string): Promise<TruckEntry[]> { return this.trucks.get(carrierId) ?? []; }

  async setAvailability(carrierId: string, truckId: string, available: boolean): Promise<TruckEntry> {
    const truck = (this.trucks.get(carrierId) ?? []).find(t => t.id === truckId);
    if (!truck) throw new BadRequestException('Truck not found');
    truck.available = available; return truck;
  }

  async setServiceAreas(carrierId: string, regions: string[]): Promise<ServiceArea> {
    const area: ServiceArea = { carrierId, regions, updatedAt: new Date() };
    this.areas.set(carrierId, area); return area;
  }
}
