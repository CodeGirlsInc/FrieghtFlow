import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { UserRole } from '../common/enums/role.enum';
import { QueryUsersDto } from './dto/query-users.dto';
import { QueryAdminShipmentsDto } from './dto/query-admin-shipments.dto';

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedAdminShipments {
  data: Shipment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PlatformStats {
  users: {
    total: number;
    byRole: Record<UserRole, number>;
    active: number;
    inactive: number;
  };
  shipments: {
    total: number;
    byStatus: Record<ShipmentStatus, number>;
    disputesPending: number;
  };
  revenue: {
    totalCompleted: number;
    currency: string;
  };
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  // ── Users ────────────────────────────────────────────────────────────────────

  async listUsers(query: QueryUsersDto): Promise<PaginatedUsers> {
    const { page = 1, limit = 20, role, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Partial<Pick<User, 'role' | 'isActive'>> = {};
    if (role !== undefined) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    const [data, total] = await this.userRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findUser(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async deactivateUser(id: string, requesterId: string): Promise<User> {
    const user = await this.findUser(id);
    if (user.id === requesterId) {
      throw new BadRequestException('Admins cannot deactivate their own account');
    }
    if (!user.isActive) {
      throw new BadRequestException('User is already inactive');
    }
    await this.userRepo.update(id, { isActive: false });
    return this.findUser(id);
  }

  async activateUser(id: string): Promise<User> {
    const user = await this.findUser(id);
    if (user.isActive) {
      throw new BadRequestException('User is already active');
    }
    await this.userRepo.update(id, { isActive: true });
    return this.findUser(id);
  }

  async changeUserRole(id: string, role: UserRole, requesterId: string): Promise<User> {
    const user = await this.findUser(id);
    if (user.id === requesterId) {
      throw new BadRequestException('Admins cannot change their own role');
    }
    await this.userRepo.update(id, { role });
    return this.findUser(id);
  }

  // ── Shipments ────────────────────────────────────────────────────────────────

  async listShipments(query: QueryAdminShipmentsDto): Promise<PaginatedAdminShipments> {
    const { page = 1, limit = 20, status, from, to } = query;
    const skip = (page - 1) * limit;

    const qb = this.shipmentRepo
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.shipper', 'shipper')
      .leftJoinAndSelect('shipment.carrier', 'carrier')
      .orderBy('shipment.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) qb.andWhere('shipment.status = :status', { status });

    if (from && to) {
      qb.andWhere('shipment.createdAt BETWEEN :from AND :to', {
        from: new Date(from),
        to: new Date(to),
      });
    } else if (from) {
      qb.andWhere('shipment.createdAt >= :from', { from: new Date(from) });
    } else if (to) {
      qb.andWhere('shipment.createdAt <= :to', { to: new Date(to) });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Stats ────────────────────────────────────────────────────────────────────

  async getStats(): Promise<PlatformStats> {
    // User counts
    const totalUsers = await this.userRepo.count();
    const activeUsers = await this.userRepo.count({ where: { isActive: true } });

    const usersByRole = await this.userRepo
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany<{ role: UserRole; count: string }>();

    const byRole = Object.values(UserRole).reduce(
      (acc, r) => ({ ...acc, [r]: 0 }),
      {} as Record<UserRole, number>,
    );
    for (const row of usersByRole) {
      byRole[row.role] = parseInt(row.count, 10);
    }

    // Shipment counts
    const totalShipments = await this.shipmentRepo.count();
    const disputesPending = await this.shipmentRepo.count({
      where: { status: ShipmentStatus.DISPUTED },
    });

    const shipmentsByStatus = await this.shipmentRepo
      .createQueryBuilder('shipment')
      .select('shipment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('shipment.status')
      .getRawMany<{ status: ShipmentStatus; count: string }>();

    const byStatus = Object.values(ShipmentStatus).reduce(
      (acc, s) => ({ ...acc, [s]: 0 }),
      {} as Record<ShipmentStatus, number>,
    );
    for (const row of shipmentsByStatus) {
      byStatus[row.status] = parseInt(row.count, 10);
    }

    // Revenue from completed shipments
    const revenueResult = await this.shipmentRepo
      .createQueryBuilder('shipment')
      .select('SUM(shipment.price)', 'total')
      .where('shipment.status = :status', { status: ShipmentStatus.COMPLETED })
      .getRawOne<{ total: string | null }>();

    const totalRevenue = parseFloat(revenueResult?.total ?? '0');

    return {
      users: {
        total: totalUsers,
        byRole,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      shipments: {
        total: totalShipments,
        byStatus,
        disputesPending,
      },
      revenue: {
        totalCompleted: totalRevenue,
        currency: 'USD',
      },
    };
  }
}
