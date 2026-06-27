import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { UserRole } from '../common/enums/role.enum';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';

@Injectable()
export class AdminStatsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
  ) {}

  async getStats() {
    const totalUsersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(user.id)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const totalShipmentsByStatus = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .select('shipment.status', 'status')
      .addSelect('COUNT(shipment.id)', 'count')
      .groupBy('shipment.status')
      .getRawMany();

    const totalPlatformRevenue = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .select('SUM(shipment.price)', 'total')
      .where('shipment.status = :status', { status: ShipmentStatus.COMPLETED })
      .getRawOne();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsersThisWeek = await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .getCount();

    const shipmentsCreatedThisWeek = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .where('shipment.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .getCount();

    const openDisputeCount = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .where('shipment.status = :status', { status: ShipmentStatus.DISPUTED })
      .getCount();

    const topCarriers = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .select('shipment.carrierId', 'carrierId')
      .addSelect('COUNT(shipment.id)', 'completedShipments')
      .where('shipment.status = :status', { status: ShipmentStatus.COMPLETED })
      .groupBy('shipment.carrierId')
      .orderBy('completedShipments', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      totalUsersByRole,
      totalShipmentsByStatus,
      totalPlatformRevenue: totalPlatformRevenue.total || 0,
      newUsersThisWeek,
      shipmentsCreatedThisWeek,
      openDisputeCount,
      topCarriers,
    };
  }
}
