import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { UserRole } from '../common/enums/role.enum';
import { QueryUsersDto } from './dto/query-users.dto';
import { QueryAdminShipmentsDto } from './dto/query-admin-shipments.dto';
import { StellarContractService } from '../stellar/stellar-contract.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { EscrowRecord } from '../stellar/escrow-record.interface';
import { EscrowContractError } from '../stellar/errors/stellar-integration.errors';
import { ContractCallResult } from '../stellar/escrow-record.interface';

export interface EscrowReconciliationResult {
  shipmentId: string;
  offChain: {
    paymentId: string;
    status: PaymentStatus;
    onChainShipmentId: number | null;
    stellarTxHash: string | null;
    amount: number;
    assetCode: string;
  };
  onChain: {
    status: EscrowRecord['status'];
    amount: bigint;
    shipper: string;
    carrier: string;
    fundedAt: bigint;
    settledAt: bigint;
  } | null;
  match: boolean;
  mismatches: string[];
}

const PAYMENT_TO_ESCROW_STATUS: Record<PaymentStatus, EscrowRecord['status'] | null> = {
  [PaymentStatus.PENDING]: 'Pending',
  [PaymentStatus.FUNDING]: 'Pending',
  [PaymentStatus.FUNDED]: 'Funded',
  [PaymentStatus.RELEASED]: 'Released',
  [PaymentStatus.REFUNDED]: 'Refunded',
  [PaymentStatus.DISPUTED]: 'Disputed',
  [PaymentStatus.CANCELLED]: null,
};

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly stellarContractService: StellarContractService,
    private readonly auditLogService: AuditLogService,
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
      throw new BadRequestException(
        'Admins cannot deactivate their own account',
      );
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

  async changeUserRole(
    id: string,
    role: UserRole,
    requesterId: string,
  ): Promise<User> {
    const user = await this.findUser(id);
    if (user.id === requesterId) {
      throw new BadRequestException('Admins cannot change their own role');
    }
    await this.userRepo.update(id, { role });
    return this.findUser(id);
  }

  // ── Shipments ────────────────────────────────────────────────────────────────

  async listShipments(
    query: QueryAdminShipmentsDto,
  ): Promise<PaginatedAdminShipments> {
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
    const activeUsers = await this.userRepo.count({
      where: { isActive: true },
    });

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

  // ── Escrow reconciliation ────────────────────────────────────────────────────

  async reconcileEscrow(
    shipmentId: string,
  ): Promise<EscrowReconciliationResult> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id: shipmentId },
    });
    if (!shipment) {
      throw new NotFoundException(`Shipment ${shipmentId} not found`);
    }

    const payment = await this.paymentRepo.findOne({
      where: { shipmentId },
    });
    if (!payment) {
      throw new NotFoundException(
        `Payment for shipment ${shipmentId} not found`,
      );
    }

    let onChain: EscrowRecord | null = null;
    let onChainError: string | null = null;

    try {
      onChain = await this.stellarContractService.getEscrow(
        BigInt(payment.onChainShipmentId),
      );
    } catch (error) {
      if (error instanceof EscrowContractError) {
        onChainError = `On-chain escrow not found (code=${error.code})`;
      } else {
        onChainError =
          error instanceof Error ? error.message : String(error);
      }
    }

    const expectedStatus = PAYMENT_TO_ESCROW_STATUS[payment.status];
    const mismatches: string[] = [];

    if (!onChain) {
      mismatches.push(onChainError ?? 'On-chain escrow record is unavailable');
    } else if (expectedStatus && onChain.status !== expectedStatus) {
      mismatches.push(
        `Status mismatch: off-chain=${payment.status}, on-chain=${onChain.status}`,
      );
    }

    const match = mismatches.length === 0;

    return {
      shipmentId,
      offChain: {
        paymentId: payment.id,
        status: payment.status,
        onChainShipmentId: payment.onChainShipmentId,
        stellarTxHash: payment.stellarTxHash,
        amount: payment.amount,
        assetCode: payment.assetCode,
      },
      onChain,
      match,
      mismatches,
    };
  }

  async adminReleaseEscrow(shipmentId: string, adminId: string): Promise<ContractCallResult> {
    const payment = await this.paymentRepo.findOne({
      where: { shipmentId },
    });
    if (!payment) {
      throw new NotFoundException(
        `Payment for shipment ${shipmentId} not found`,
      );
    }

    const result = await this.stellarContractService.releasePayment(
      BigInt(payment.onChainShipmentId),
    );

    await this.paymentRepo.update(payment.id, {
      status: PaymentStatus.RELEASED,
      settledAt: new Date(),
      stellarTxHash: result.txHash,
      failureReason: null,
    });

    await this.auditLogService.log({
      adminId,
      action: 'POST /admin/escrow/:shipmentId/release',
      targetType: 'payment',
      targetId: payment.id,
      metadata: {
        shipmentId,
        onChainShipmentId: payment.onChainShipmentId,
        txHash: result.txHash,
      },
    });

    return result;
  }

  async adminRefundEscrow(shipmentId: string, adminId: string): Promise<ContractCallResult> {
    const payment = await this.paymentRepo.findOne({
      where: { shipmentId },
    });
    if (!payment) {
      throw new NotFoundException(
        `Payment for shipment ${shipmentId} not found`,
      );
    }

    const result = await this.stellarContractService.refundPayment(
      BigInt(payment.onChainShipmentId),
    );

    await this.paymentRepo.update(payment.id, {
      status: PaymentStatus.REFUNDED,
      settledAt: new Date(),
      stellarTxHash: result.txHash,
      failureReason: null,
    });

    await this.auditLogService.log({
      adminId,
      action: 'POST /admin/escrow/:shipmentId/refund',
      targetType: 'payment',
      targetId: payment.id,
      metadata: {
        shipmentId,
        onChainShipmentId: payment.onChainShipmentId,
        txHash: result.txHash,
      },
    });

    return result;
  }
}
