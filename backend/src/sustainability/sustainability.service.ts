import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from 'src/shipment';
import { Emission } from 'src/emission/entities/emission.entity';

@Injectable()
export class SustainabilityService {
  constructor(
    @InjectRepository(Emission)
    private emissionRepo: Repository<Emission>,
  ) {}

  private getEmissionFactor(mode: string): number {
    switch (mode.toLowerCase()) {
      case 'air':
        return 0.5;
      case 'road':
        return 0.1;
      case 'sea':
        return 0.02;
      default:
        return 0.1; // fallback
    }
  }

  async calculateAndStore(shipment: Shipment, userId: string) {
    const factor = this.getEmissionFactor(shipment.mode);
    const tonKm = (shipment.weightKg / 1000) * shipment.distanceKm;
    const carbonKg = tonKm * factor;

    const emission = this.emissionRepo.create({
      shipmentId: shipment.id,
      userId: userId,
      distanceKm: shipment.distanceKm,
      weightKg: shipment.weightKg,
      carbonKg,
    });

    return this.emissionRepo.save(emission);
  }

  async getUserSummary(userId: string) {
    const emissions = await this.emissionRepo.find({
      where: { userId: userId },
    });
    const totalCarbon = emissions.reduce((sum, e) => sum + e.carbonKg, 0);
    return {
      totalCarbon,
      shipments: emissions.length,
      avgPerShipment: emissions.length ? totalCarbon / emissions.length : 0,
    };
  }
}
