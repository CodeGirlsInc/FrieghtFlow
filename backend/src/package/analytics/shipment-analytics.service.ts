import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from '../../shipments/entities/shipment.entity';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

export interface ShipmentAnalyticsResult {
  statusCounts: { status: string; count: number }[];
  weeklyVolume: { week: string; count: number }[];
  avgDeliveryDurationHours: number | null;
  topRoutes: { origin: string; destination: string; count: number }[];
}

@Injectable()
export class ShipmentAnalyticsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  async getAnalytics(
    query: AnalyticsQueryDto,
  ): Promise<ShipmentAnalyticsResult> {
    const baseQb = this.shipmentRepo.createQueryBuilder('s');

    if (query.startDate) {
      baseQb.andWhere('s.created_at >= :startDate', {
        startDate: query.startDate,
      });
    }
    if (query.endDate) {
      baseQb.andWhere('s.created_at <= :endDate', { endDate: query.endDate });
    }

    // Shipment counts by status
    const statusRows: { status: string; count: string }[] = await baseQb
      .clone()
      .select('s.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('s.status')
      .getRawMany();

    // Weekly volume for last 12 weeks
    const weeklyRows: { week: string; count: string }[] = await baseQb
      .clone()
      .select("TO_CHAR(DATE_TRUNC('week', s.created_at), 'YYYY-MM-DD')", 'week')
      .addSelect('COUNT(*)', 'count')
      .andWhere("s.created_at >= NOW() - INTERVAL '12 weeks'")
      .groupBy("DATE_TRUNC('week', s.created_at)")
      .orderBy("DATE_TRUNC('week', s.created_at)", 'ASC')
      .getRawMany();

    // Average delivery duration in hours
    const durationRow: { avg_hours: string | null } | undefined = await baseQb
      .clone()
      .select(
        'EXTRACT(EPOCH FROM AVG(s.actual_delivery_date - s.pickup_date)) / 3600',
        'avg_hours',
      )
      .andWhere('s.actual_delivery_date IS NOT NULL')
      .andWhere('s.pickup_date IS NOT NULL')
      .getRawOne();

    // Top 5 routes by volume
    const routeRows: { origin: string; destination: string; count: string }[] =
      await baseQb
        .clone()
        .select('s.origin', 'origin')
        .addSelect('s.destination', 'destination')
        .addSelect('COUNT(*)', 'count')
        .groupBy('s.origin, s.destination')
        .orderBy('count', 'DESC')
        .limit(5)
        .getRawMany();

    return {
      statusCounts: statusRows.map((r) => ({
        status: r.status,
        count: Number(r.count),
      })),
      weeklyVolume: weeklyRows.map((r) => ({
        week: r.week,
        count: Number(r.count),
      })),
      avgDeliveryDurationHours:
        durationRow?.avg_hours != null
          ? parseFloat(durationRow.avg_hours)
          : null,
      topRoutes: routeRows.map((r) => ({
        origin: r.origin,
        destination: r.destination,
        count: Number(r.count),
      })),
    };
  }
}
