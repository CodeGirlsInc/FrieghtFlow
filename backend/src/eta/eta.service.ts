import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ETACalculation } from './entities/eta-calculation.entity';
import { CalculateETADto } from './dto/calculate-eta.dto';
import { ETAResponseDto } from './dto/eta-response.dto';
import { ETA_CONFIG } from './eta-config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ETAService {
  constructor(
    @InjectRepository(ETACalculation) private readonly etaRepo: Repository<ETACalculation>,
    private readonly configService: ConfigService,
  ) {}

  async calculateETA(dto: CalculateETADto): Promise<ETAResponseDto> {
    const { originCity, destinationCity, carrierId } = dto;
    const distanceKm = await this.estimateDistance(originCity, destinationCity);
    const avgSpeed = this.configService.get<number>('ETA_AVERAGE_SPEED_KMH') ?? ETA_CONFIG.averageSpeedKmh;
    const baseHours = distanceKm / avgSpeed;
    const lateRate = await this.getCarrierLateRate(carrierId);
    const buffer = baseHours * lateRate;
    const totalHours = baseHours + buffer;
    const now = new Date();
    const estimatedDate = new Date(now.getTime() + totalHours * 3600_000);

    await this.etaRepo.save(this.etaRepo.create({
      originCity, destinationCity, carrierId: carrierId ?? null,
      baseDurationHours: baseHours, bufferHours: buffer,
      totalEstimatedHours: totalHours, estimatedDeliveryDate: estimatedDate,
      confidenceLevel: this.getConfidenceLevel(carrierId),
    }));

    return {
      estimatedHours: Math.round(totalHours * 100) / 100,
      estimatedDeliveryDate: estimatedDate.toISOString(),
      confidenceLevel: this.getConfidenceLevel(carrierId),
    };
  }

  async recalculateForShipment(shipmentId: string, dto: CalculateETADto): Promise<ETAResponseDto> {
    const eta = await this.calculateETA(dto);
    await this.etaRepo.update({ shipmentId }, { shipmentId });
    return eta;
  }

  private async estimateDistance(origin: string, destination: string): Promise<number> {
    const routeDistances: Record<string, Record<string, number>> = {
      'Lagos': { 'Abuja': 560, 'Ibadan': 120, 'Port Harcourt': 435 },
      'Abuja': { 'Lagos': 560, 'Kano': 370, 'Port Harcourt': 510 },
    };
    return routeDistances[origin]?.[destination] ?? 300;
  }

  private async getCarrierLateRate(carrierId?: string): Promise<number> {
    if (!carrierId) return 0.15;
    return 0.0;
  }

  private getConfidenceLevel(carrierId?: string): 'high' | 'medium' | 'low' {
    if (!carrierId) return 'medium';
    return 'high';
  }
}
