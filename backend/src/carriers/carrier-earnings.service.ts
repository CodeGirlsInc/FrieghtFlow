import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';

interface MonthlyBreakdown {
  month: string; // e.g. "2025-03"
  earnings: number;
  completedShipments: number;
}

interface EarningsSummary {
  lifetimeEarnings: number;
  currentMonthEarnings: number;
  monthlyBreakdown: MonthlyBreakdown[];
}

@Injectable()
export class CarrierEarningsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  async getEarningsSummary(carrierId: string): Promise<EarningsSummary> {
    const completed = await this.shipmentRepo.find({
      where: { carrierId, status: ShipmentStatus.COMPLETED },
      select: ['id', 'price', 'actualDeliveryDate'],
    });

    const lifetimeEarnings = completed.reduce((sum, s) => sum + Number(s.price), 0);

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const buckets = new Map<string, { earnings: number; count: number }>();

    // Pre-fill last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets.set(key, { earnings: 0, count: 0 });
    }

    for (const s of completed) {
      const date = s.actualDeliveryDate ? new Date(s.actualDeliveryDate) : null;
      if (!date) continue;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (buckets.has(key)) {
        const b = buckets.get(key)!;
        b.earnings += Number(s.price);
        b.count += 1;
      }
    }

    const monthlyBreakdown: MonthlyBreakdown[] = Array.from(buckets.entries()).map(
      ([month, { earnings, count }]) => ({ month, earnings, completedShipments: count }),
    );

    const currentMonthEarnings = buckets.get(currentMonthKey)?.earnings ?? 0;

    return { lifetimeEarnings, currentMonthEarnings, monthlyBreakdown };
  }
}
