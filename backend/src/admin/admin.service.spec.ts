import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { UserRole } from '../common/enums/role.enum';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { QueryUsersDto } from './dto/query-users.dto';
import { QueryAdminShipmentsDto } from './dto/query-admin-shipments.dto';
import { StellarContractService } from '../stellar/stellar-contract.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { EscrowRecord } from '../stellar/escrow-record.interface';
import { ContractCallResult } from '../stellar/escrow-record.interface';

describe('AdminService', () => {
  let service: AdminService;
  let userRepo: { findAndCount: jest.Mock; findOne: jest.Mock; update: jest.Mock; count: jest.Mock; createQueryBuilder: jest.Mock };
  let shipmentRepo: { findOne: jest.Mock; createQueryBuilder: jest.Mock; count: jest.Mock };
  let paymentRepo: { findOne: jest.Mock; update: jest.Mock };
  let stellarContractService: { getEscrow: jest.Mock; releasePayment: jest.Mock; refundPayment: jest.Mock };
  let auditLogService: { log: jest.Mock };

  beforeEach(async () => {
    userRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    shipmentRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      count: jest.fn(),
    };
    paymentRepo = {
      findOne: jest.fn(),
      update: jest.fn(),
    };
    stellarContractService = {
      getEscrow: jest.fn(),
      releasePayment: jest.fn(),
      refundPayment: jest.fn(),
    };
    auditLogService = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Shipment), useValue: shipmentRepo },
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: StellarContractService, useValue: stellarContractService },
        { provide: AuditLogService, useValue: auditLogService },
      ],
    }).compile();

    service = module.get(AdminService);
  });

  it('returns platform stats', async () => {
    userRepo.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2);
    userRepo.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest
        .fn()
        .mockResolvedValue([{ role: UserRole.ADMIN, count: '1' }]),
    });
    shipmentRepo.count
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(1);
    shipmentRepo.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawMany: jest
        .fn()
        .mockResolvedValue([{ status: ShipmentStatus.COMPLETED, count: '4' }]),
      getRawOne: jest.fn().mockResolvedValue({ total: '12000' }),
    });

    const stats = await service.getStats();

    expect(stats.users.total).toBe(3);
    expect(stats.users.byRole[UserRole.ADMIN]).toBe(1);
    expect(stats.shipments.total).toBe(5);
    expect(stats.revenue.totalCompleted).toBe(12000);
  });

  it('prevents admins from changing their own role', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'admin-1' } as User);

    await expect(
      service.changeUserRole('admin-1', UserRole.CARRIER, 'admin-1'),
    ).rejects.toThrow();
  });

  describe('reconcileEscrow', () => {
    it('returns a matching result when off-chain and on-chain agree', async () => {
      shipmentRepo.findOne.mockResolvedValue({ id: 'shipment-1' } as Shipment);
      paymentRepo.findOne.mockResolvedValue({
        id: 'payment-1',
        shipmentId: 'shipment-1',
        onChainShipmentId: 1,
        status: PaymentStatus.FUNDED,
        stellarTxHash: 'tx-hash',
        amount: 100,
        assetCode: 'USDC',
      } as Payment);
      stellarContractService.getEscrow.mockResolvedValue({
        shipmentId: 1n,
        shipper: 'GSHIPPER',
        carrier: 'GCARRIER',
        amount: 1_000_000_000n,
        status: 'Funded',
        fundedAt: 1_700_000_000n,
        settledAt: 0n,
      } as EscrowRecord);

      const result = await service.reconcileEscrow('shipment-1');

      expect(result.match).toBe(true);
      expect(result.mismatches).toHaveLength(0);
      expect(result.offChain.status).toBe(PaymentStatus.FUNDED);
      expect(result.onChain?.status).toBe('Funded');
    });

    it('flags a status mismatch when off-chain and on-chain differ', async () => {
      shipmentRepo.findOne.mockResolvedValue({ id: 'shipment-1' } as Shipment);
      paymentRepo.findOne.mockResolvedValue({
        id: 'payment-1',
        shipmentId: 'shipment-1',
        onChainShipmentId: 1,
        status: PaymentStatus.PENDING,
        stellarTxHash: null,
        amount: 100,
        assetCode: 'USDC',
      } as Payment);
      stellarContractService.getEscrow.mockResolvedValue({
        shipmentId: 1n,
        shipper: 'GSHIPPER',
        carrier: 'GCARRIER',
        amount: 1_000_000_000n,
        status: 'Funded',
        fundedAt: 1_700_000_000n,
        settledAt: 0n,
      } as EscrowRecord);

      const result = await service.reconcileEscrow('shipment-1');

      expect(result.match).toBe(false);
      expect(result.mismatches[0]).toContain('Status mismatch');
      expect(result.mismatches[0]).toContain('off-chain=pending');
      expect(result.mismatches[0]).toContain('on-chain=Funded');
    });

    it('reports when the on-chain escrow cannot be found', async () => {
      shipmentRepo.findOne.mockResolvedValue({ id: 'shipment-1' } as Shipment);
      paymentRepo.findOne.mockResolvedValue({
        id: 'payment-1',
        shipmentId: 'shipment-1',
        onChainShipmentId: 1,
        status: PaymentStatus.FUNDED,
        stellarTxHash: 'tx-hash',
        amount: 100,
        assetCode: 'USDC',
      } as Payment);
      const contractError = new (await import('../stellar/errors/stellar-integration.errors')).EscrowContractError(
        3,
        'HostError: Error(Contract, #3)',
      );
      stellarContractService.getEscrow.mockRejectedValue(contractError);

      const result = await service.reconcileEscrow('shipment-1');

      expect(result.match).toBe(false);
      expect(result.onChain).toBeNull();
      expect(result.mismatches[0]).toContain('On-chain escrow not found');
    });

    it('throws NotFoundException when the shipment does not exist', async () => {
      shipmentRepo.findOne.mockResolvedValue(null);

      await expect(service.reconcileEscrow('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when the payment does not exist', async () => {
      shipmentRepo.findOne.mockResolvedValue({ id: 'shipment-1' } as Shipment);
      paymentRepo.findOne.mockResolvedValue(null);

      await expect(service.reconcileEscrow('shipment-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('adminReleaseEscrow', () => {
    it('submits release to the chain and updates the payment status', async () => {
      shipmentRepo.findOne.mockResolvedValue({ id: 'shipment-1' } as Shipment);
      paymentRepo.findOne.mockResolvedValue({
        id: 'payment-1',
        shipmentId: 'shipment-1',
        onChainShipmentId: 1,
        status: PaymentStatus.FUNDED,
      } as Payment);
      paymentRepo.update.mockResolvedValue({ affected: 1 });
      stellarContractService.releasePayment.mockResolvedValue({
        txHash: 'release-hash',
        status: 'PENDING',
      } as ContractCallResult);

      const result = await service.adminReleaseEscrow('shipment-1', 'admin-1');

      expect(result.txHash).toBe('release-hash');
      expect(paymentRepo.update).toHaveBeenCalledWith('payment-1', {
        status: PaymentStatus.RELEASED,
        settledAt: expect.any(Date),
        stellarTxHash: 'release-hash',
        failureReason: null,
      });
      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: 'admin-1',
          action: 'POST /admin/escrow/:shipmentId/release',
          targetType: 'payment',
          targetId: 'payment-1',
        }),
      );
    });

    it('throws NotFoundException when the payment does not exist', async () => {
      shipmentRepo.findOne.mockResolvedValue({ id: 'shipment-1' } as Shipment);
      paymentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.adminReleaseEscrow('shipment-1', 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('adminRefundEscrow', () => {
    it('submits refund to the chain and updates the payment status', async () => {
      shipmentRepo.findOne.mockResolvedValue({ id: 'shipment-1' } as Shipment);
      paymentRepo.findOne.mockResolvedValue({
        id: 'payment-1',
        shipmentId: 'shipment-1',
        onChainShipmentId: 1,
        status: PaymentStatus.FUNDED,
      } as Payment);
      paymentRepo.update.mockResolvedValue({ affected: 1 });
      stellarContractService.refundPayment.mockResolvedValue({
        txHash: 'refund-hash',
        status: 'PENDING',
      } as ContractCallResult);

      const result = await service.adminRefundEscrow('shipment-1', 'admin-1');

      expect(result.txHash).toBe('refund-hash');
      expect(paymentRepo.update).toHaveBeenCalledWith('payment-1', {
        status: PaymentStatus.REFUNDED,
        settledAt: expect.any(Date),
        stellarTxHash: 'refund-hash',
        failureReason: null,
      });
      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: 'admin-1',
          action: 'POST /admin/escrow/:shipmentId/refund',
          targetType: 'payment',
          targetId: 'payment-1',
        }),
      );
    });

    it('throws NotFoundException when the payment does not exist', async () => {
      shipmentRepo.findOne.mockResolvedValue({ id: 'shipment-1' } as Shipment);
      paymentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.adminRefundEscrow('shipment-1', 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
