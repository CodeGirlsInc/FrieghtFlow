// #992 – Shipper/carrier dashboard KPI aggregation
import { Injectable, Logger } from '@nestjs/common';

export interface DashboardSummary {
  totalShipments: number;
  activeShipments: number;
  totalSpend: number;
  totalEarnings: number;
  onTimeRate: number;
  pendingBids: number;
  openDisputes: number;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  async getSummary(userId: string, role: string): Promise<DashboardSummary> {
    this.logger.log(`Dashboard summary user=${userId} role=${role}`);
    return { totalShipments: 0, activeShipments: 0, totalSpend: 0, totalEarnings: 0, onTimeRate: 0, pendingBids: 0, openDisputes: 0 };
  }

  async getActivityFeed(userId: string, limit = 10): Promise<{ type: string; message: string; createdAt: Date }[]> {
    this.logger.log(`Activity feed user=${userId} limit=${limit}`);
    return [];
  }
}
