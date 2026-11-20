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

interface CurrencyEarnings {
  currency: string;
  lifetimeEarnings: number;
  currentMonthEarnings: number;
  monthlyBreakdown: MonthlyBreakdown[];
}

interface EarningsSummary {
  byCurrency: CurrencyEarnings[];
}

@Injectable()
export class CarrierEarningsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  async getEarningsSummary(carrierId: string): Promise<EarningsSummary> {
    // Aggregate in SQL grouped by currency and UTC month to avoid loading all
    // rows into memory and to avoid summing across currencies incorrectly.
    const rows = await this.shipmentRepo
      .createQueryBuilder('s')
      .select('s.currency', 'currency')
      .addSelect(
        "TO_CHAR(DATE_TRUNC('month', s.actual_delivery_date AT TIME ZONE 'UTC'), 'YYYY-MM')",
        'month',
      )
      .addSelect('SUM(CAST(s.price AS numeric))', 'earnings')
      .addSelect('COUNT(*)', 'count')
      .where('s.carrier_id = :carrierId', { carrierId })
      .andWhere('s.status = :status', { status: ShipmentStatus.COMPLETED })
      .andWhere('s.actual_delivery_date IS NOT NULL')
      .groupBy('s.currency')
      .addGroupBy(
        "DATE_TRUNC('month', s.actual_delivery_date AT TIME ZONE 'UTC')",
      )
      .orderBy('s.currency', 'ASC')
      .addOrderBy(
        "DATE_TRUNC('month', s.actual_delivery_date AT TIME ZONE 'UTC')",
        'ASC',
      )
      .getRawMany<{
        currency: string;
        month: string | null;
        earnings: string;
        count: string;
      }>();

    // Also aggregate lifetime totals per currency (includes rows where
    // actual_delivery_date is NULL, which the monthly query excludes).
    const lifetimeTotals = await this.shipmentRepo
      .createQueryBuilder('s')
      .select('s.currency', 'currency')
      .addSelect('SUM(CAST(s.price AS numeric))', 'total')
      .where('s.carrier_id = :carrierId', { carrierId })
      .andWhere('s.status = :status', { status: ShipmentStatus.COMPLETED })
      .groupBy('s.currency')
      .getRawMany<{ currency: string; total: string }>();

    const lifetimeMap = new Map(
      lifetimeTotals.map((r) => [r.currency, Number(r.total)]),
    );

    // Group monthly rows by currency.
    const currencyMap = new Map<
      string,
      Map<string, { earnings: number; count: number }>
    >();
    for (const row of rows) {
      if (!row.month) continue;
      if (!currencyMap.has(row.currency)) {
        currencyMap.set(row.currency, new Map());
      }
      currencyMap
        .get(row.currency)!
        .set(row.month, { earnings: Number(row.earnings), count: Number(row.count) });
    }

    const now = new Date();
    const currentMonthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

    const byCurrency: CurrencyEarnings[] = [];

    for (const currency of [...lifetimeMap.keys()].sort()) {
      const monthMap = currencyMap.get(currency) ?? new Map();

      // Fill the last 12 months including those with no shipments.
      const monthlyBreakdown: MonthlyBreakdown[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
        const bucket = monthMap.get(key) ?? { earnings: 0, count: 0 };
        monthlyBreakdown.push({
          month: key,
          earnings: bucket.earnings,
          completedShipments: bucket.count,
        });
      }

      byCurrency.push({
        currency,
        lifetimeEarnings: lifetimeMap.get(currency) ?? 0,
        currentMonthEarnings: monthMap.get(currentMonthKey)?.earnings ?? 0,
        monthlyBreakdown,
      });
    }

    return { byCurrency };
  }
}
