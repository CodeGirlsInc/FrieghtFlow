// #998 – Admin: user suspension, platform stats & audit log
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

export interface UserSuspension { userId: string; suspended: boolean; reason: string; suspendedAt: Date; }
export interface PlatformStats { totalUsers: number; activeShipments: number; totalRevenue: number; openDisputes: number; }

@Injectable()
export class AdminUserManagementService {
  private readonly logger = new Logger(AdminUserManagementService.name);
  private readonly suspensions = new Map<string, UserSuspension>();

  async suspendUser(adminId: string, userId: string, reason: string): Promise<UserSuspension> {
    this.logger.log(`Admin ${adminId} suspending user ${userId}`);
    const record: UserSuspension = { userId, suspended: true, reason, suspendedAt: new Date() };
    this.suspensions.set(userId, record);
    return record;
  }

  async unsuspendUser(adminId: string, userId: string): Promise<UserSuspension> {
    const record = this.suspensions.get(userId);
    if (!record) throw new NotFoundException('No suspension record found');
    record.suspended = false;
    this.logger.log(`Admin ${adminId} unsuspended user ${userId}`);
    return record;
  }

  async getPlatformStats(): Promise<PlatformStats> {
    return { totalUsers: 0, activeShipments: 0, totalRevenue: 0, openDisputes: 0 };
  }

  async getAuditLog(page = 1, limit = 20): Promise<{ entries: unknown[]; total: number }> {
    void page; void limit;
    return { entries: [], total: 0 };
  }
}
