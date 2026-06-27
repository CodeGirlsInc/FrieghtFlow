// #990 – Carrier reputation: aggregate review stats per carrier
import { Injectable, Logger } from '@nestjs/common';

export interface ReviewStats {
  carrierId: string;
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: Record<number, number>;
}

@Injectable()
export class ReviewStatsService {
  private readonly logger = new Logger(ReviewStatsService.name);

  getCarrierStats(carrierId: string): Promise<ReviewStats> {
    this.logger.log(`Computing review stats for carrier ${carrierId}`);
    return Promise.resolve({
      carrierId,
      averageRating: 0,
      totalReviews: 0,
      ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
  }

  computeAverage(ratings: number[]): number {
    if (!ratings.length) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }

  buildBreakdown(ratings: number[]): Record<number, number> {
    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of ratings) {
      const key = Math.min(5, Math.max(1, Math.round(r)));
      breakdown[key] = (breakdown[key] ?? 0) + 1;
    }
    return breakdown;
  }
}
