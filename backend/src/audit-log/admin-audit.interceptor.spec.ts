import { ExecutionContext } from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';
import { AdminAuditInterceptor } from './admin-audit.interceptor';
import { UserRole } from '../common/enums/role.enum';

interface TestRequest {
  user?: { id: string; role: UserRole };
  method: string;
  path: string;
  route?: { path?: string };
  params: Record<string, string>;
  body: Record<string, unknown>;
  query: Record<string, unknown>;
  auditMetadata?: Record<string, unknown>;
  auditTargetType?: string;
  auditTargetId?: string;
}

const contextFor = (request: TestRequest): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  }) as unknown as ExecutionContext;

describe('AdminAuditInterceptor', () => {
  let auditLogService: { log: jest.Mock };
  let interceptor: AdminAuditInterceptor;

  beforeEach(() => {
    auditLogService = { log: jest.fn().mockResolvedValue(undefined) };
    interceptor = new AdminAuditInterceptor(auditLogService as never);
  });

  it('awaits one audit entry and records the previous role', async () => {
    const request: TestRequest = {
      user: { id: 'admin-1', role: UserRole.ADMIN },
      method: 'PATCH',
      path: '/admin/users/user-1/role',
      route: { path: '/admin/users/:id/role' },
      params: { id: 'user-1' },
      body: { role: UserRole.CARRIER },
      query: {},
    };

    const response = await firstValueFrom(
      interceptor.intercept(contextFor(request), {
        handle: () => {
          request.auditMetadata = { previousRole: UserRole.SHIPPER };
          return of({ ok: true });
        },
      }),
    );

    expect(response).toEqual({ ok: true });
    expect(auditLogService.log).toHaveBeenCalledTimes(1);
    expect(auditLogService.log).toHaveBeenCalledWith({
      adminId: 'admin-1',
      action: 'PATCH /admin/users/:id/role',
      targetId: 'user-1',
      metadata: {
        body: { role: UserRole.CARRIER },
        query: {},
        previousRole: UserRole.SHIPPER,
      },
    });
  });

  it.each([
    ['/admin/escrow/shipment-1/release', 'POST', 'release-hash'],
    ['/admin/escrow/shipment-1/refund', 'POST', 'refund-hash'],
  ])(
    'logs one escrow row with payment and chain context for %s',
    async (path, method, txHash) => {
      const request: TestRequest = {
        user: { id: 'admin-1', role: UserRole.ADMIN },
        method,
        path,
        route: { path: path.replace('shipment-1', ':shipmentId') },
        params: { shipmentId: 'shipment-1' },
        body: {},
        query: {},
      };

      await firstValueFrom(
        interceptor.intercept(contextFor(request), {
          handle: () => {
            // This is the request context populated by AdminService after
            // the escrow update succeeds.
            request.auditTargetType = 'payment';
            request.auditTargetId = 'payment-1';
            request.auditMetadata = {
              paymentId: 'payment-1',
              shipmentId: 'shipment-1',
              onChainShipmentId: 42,
              txHash,
            };
            return of({ txHash });
          },
        }),
      );

      expect(auditLogService.log).toHaveBeenCalledTimes(1);
      expect(auditLogService.log).toHaveBeenCalledWith({
        adminId: 'admin-1',
        action: `${method} ${path.replace('shipment-1', ':shipmentId')}`,
        targetType: 'payment',
        targetId: 'payment-1',
        metadata: {
          body: {},
          query: {},
          paymentId: 'payment-1',
          shipmentId: 'shipment-1',
          onChainShipmentId: 42,
          txHash,
        },
      });
    },
  );

  it('propagates audit persistence failures instead of dropping them', async () => {
    auditLogService.log.mockRejectedValueOnce(new Error('audit unavailable'));
    const request: TestRequest = {
      user: { id: 'admin-1', role: UserRole.ADMIN },
      method: 'POST',
      path: '/admin/escrow/shipment-1/release',
      route: { path: '/admin/escrow/:shipmentId/release' },
      params: { shipmentId: 'shipment-1' },
      body: {},
      query: {},
    };

    await expect(
      firstValueFrom(
        interceptor.intercept(contextFor(request), {
          handle: () => of({ ok: true }),
        }),
      ),
    ).rejects.toThrow('audit unavailable');
  });
});
