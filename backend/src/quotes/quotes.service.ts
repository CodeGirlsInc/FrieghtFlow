// #980 – Instant rate calculator: zone-based price estimation
import { Injectable, Logger, BadRequestException } from '@nestjs/common';

export interface QuoteEstimate { minPrice: number; maxPrice: number; currency: string; estimatedDays: number; breakdown: { base: number; distanceFee: number; weightFee: number }; }

const ZONE_RATES: Record<string, number> = { local: 1.0, regional: 1.5, national: 2.2 };

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  async estimate(origin: string, destination: string, weightKg: number, cargoCategory: string): Promise<QuoteEstimate> {
    if (!origin || !destination) throw new BadRequestException('Origin and destination required');
    if (weightKg <= 0) throw new BadRequestException('Weight must be positive');
    void cargoCategory;
    const zone = origin === destination ? 'local' : origin.slice(0, 2) === destination.slice(0, 2) ? 'regional' : 'national';
    const rate = ZONE_RATES[zone] ?? 2.0;
    const base = 50, distanceFee = rate * 30, weightFee = weightKg * 0.5;
    const total = base + distanceFee + weightFee;
    this.logger.log(`Quote ${origin}->${destination} ${weightKg}kg zone=${zone} ~$${total.toFixed(2)}`);
    return { minPrice: Math.round(total * 0.9), maxPrice: Math.round(total * 1.1), currency: 'USD', estimatedDays: zone === 'local' ? 1 : zone === 'regional' ? 3 : 7, breakdown: { base, distanceFee, weightFee } };
  }
}
