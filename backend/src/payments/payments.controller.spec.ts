import {
  ForbiddenException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/role.enum';

/**
 * Integration tests for the PaymentsController proving that route-level
 * @Roles decorators correctly restrict access per-route:
 *  - getStatus: SHIPPER | CARRIER | ADMIN
 *  - initiate:   SHIPPER | ADMIN
 *  - submit:     SHIPPER only
 *  - test-sign-and-submit: SHIPPER only
 */
describe('PaymentsController', () => {
  let app: INestApplication;
  let paymentsService: {
    findByShipmentIdForUser: jest.Mock;
    initiateFunding: jest.Mock;
    submitFunding: jest.Mock;
    testSignAndSubmitFunding: jest.Mock;
  };

  const shipmentId = '550e8400-e29b-41d4-a716-446655440000';
  const paymentId = '660e8400-e29b-41d4-a716-446655440001';

  beforeEach(async () => {
    paymentsService = {
      findByShipmentIdForUser: jest.fn().mockResolvedValue({
        payment: { id: paymentId, status: 'PENDING' },
      }),
      initiateFunding: jest.fn().mockResolvedValue({
        paymentId,
        status: 'PENDING',
        unsignedXdr: 'test-xdr',
      }),
      submitFunding: jest.fn().mockResolvedValue({
        paymentId,
        status: 'FUNDED',
        stellarTxHash: 'tx-hash',
      }),
      testSignAndSubmitFunding: jest.fn().mockResolvedValue({
        paymentId,
        status: 'FUNDED',
        stellarTxHash: 'tx-hash',
      }),
    };

    // We do NOT override RolesGuard — the real guard + Reflector reads the
    // @Roles metadata from each handler and checks req.user.role.
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        Reflector,
        RolesGuard,
        { provide: PaymentsService, useValue: paymentsService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    // Middleware that sets req.user from headers — simulates JwtAuthGuard
    app.use((req: any, _res: any, next: any) => {
      const role = req.header('x-user-role') as UserRole | undefined;
      const userId = req.header('x-user-id') as string | undefined;
      if (role) {
        req.user = { id: userId || 'user-1', role };
      }
      next();
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // ── GET status ──────────────────────────────────────────────────────────────

  describe('GET /shipments/:shipmentId/payment (getStatus)', () => {
    it('returns 401 without an authenticated user', async () => {
      await request(app.getHttpServer())
        .get(`/shipments/${shipmentId}/payment`)
        .expect(401);
    });

    it('allows shipper to view payment status', async () => {
      await request(app.getHttpServer())
        .get(`/shipments/${shipmentId}/payment`)
        .set('x-user-role', UserRole.SHIPPER)
        .set('x-user-id', 'shipper-1')
        .expect(200)
        .then((res) => {
          expect(res.body.payment).toBeDefined();
          expect(res.body.payment.id).toBe(paymentId);
        });
    });

    it('allows carrier to view payment status', async () => {
      await request(app.getHttpServer())
        .get(`/shipments/${shipmentId}/payment`)
        .set('x-user-role', UserRole.CARRIER)
        .set('x-user-id', 'carrier-1')
        .expect(200);
    });

    it('allows admin to view payment status', async () => {
      await request(app.getHttpServer())
        .get(`/shipments/${shipmentId}/payment`)
        .set('x-user-role', UserRole.ADMIN)
        .set('x-user-id', 'admin-1')
        .expect(200);
    });
  });

  // ── POST initiate ───────────────────────────────────────────────────────────

  describe('POST /shipments/:shipmentId/payment (initiate)', () => {
    it('returns 401 without an authenticated user', async () => {
      await request(app.getHttpServer())
        .post(`/shipments/${shipmentId}/payment`)
        .expect(401);
    });

    it('allows shipper to initiate funding', async () => {
      await request(app.getHttpServer())
        .post(`/shipments/${shipmentId}/payment`)
        .set('x-user-role', UserRole.SHIPPER)
        .set('x-user-id', 'shipper-1')
        .expect(201)
        .then((res) => {
          expect(res.body.unsignedXdr).toBe('test-xdr');
        });
    });

    it('allows admin to initiate funding', async () => {
      await request(app.getHttpServer())
        .post(`/shipments/${shipmentId}/payment`)
        .set('x-user-role', UserRole.ADMIN)
        .set('x-user-id', 'admin-1')
        .expect(201);
    });
  });

  // ── POST submit (shipper-only) ──────────────────────────────────────────────

  describe('POST /shipments/:shipmentId/payment/:paymentId/submit', () => {
    it('returns 401 without an authenticated user', async () => {
      await request(app.getHttpServer())
        .post(`/shipments/${shipmentId}/payment/${paymentId}/submit`)
        .send({ signedXdr: 'signed-xdr' })
        .expect(401);
    });

    it('allows shipper to submit funding transaction', async () => {
      await request(app.getHttpServer())
        .post(`/shipments/${shipmentId}/payment/${paymentId}/submit`)
        .set('x-user-role', UserRole.SHIPPER)
        .set('x-user-id', 'shipper-1')
        .send({ signedXdr: 'signed-xdr' })
        .expect(201)
        .then((res) => {
          expect(res.body.status).toBe('FUNDED');
        });
    });

    it('rejects carrier — submit is shipper-only', async () => {
      await request(app.getHttpServer())
        .post(`/shipments/${shipmentId}/payment/${paymentId}/submit`)
        .set('x-user-role', UserRole.CARRIER)
        .set('x-user-id', 'carrier-1')
        .send({ signedXdr: 'signed-xdr' })
        .expect(403);

      expect(paymentsService.submitFunding).not.toHaveBeenCalled();
    });

    it('rejects admin — submit is shipper-only', async () => {
      await request(app.getHttpServer())
        .post(`/shipments/${shipmentId}/payment/${paymentId}/submit`)
        .set('x-user-role', UserRole.ADMIN)
        .set('x-user-id', 'admin-1')
        .send({ signedXdr: 'signed-xdr' })
        .expect(403);

      expect(paymentsService.submitFunding).not.toHaveBeenCalled();
    });
  });

  // ── POST test-sign-and-submit (shipper-only) ────────────────────────────────

  describe('POST /shipments/:shipmentId/payment/:paymentId/test-sign-and-submit', () => {
    it('returns 401 without an authenticated user', async () => {
      await request(app.getHttpServer())
        .post(`/shipments/${shipmentId}/payment/${paymentId}/test-sign-and-submit`)
        .send({ shipperSecret: 'test-secret' })
        .expect(401);
    });

    it('allows shipper to test-sign-and-submit', async () => {
      await request(app.getHttpServer())
        .post(`/shipments/${shipmentId}/payment/${paymentId}/test-sign-and-submit`)
        .set('x-user-role', UserRole.SHIPPER)
        .set('x-user-id', 'shipper-1')
        .send({ shipperSecret: 'test-secret' })
        .expect(201)
        .then((res) => {
          expect(res.body.status).toBe('FUNDED');
        });
    });

    it('rejects carrier — test-sign-and-submit is shipper-only', async () => {
      await request(app.getHttpServer())
        .post(`/shipments/${shipmentId}/payment/${paymentId}/test-sign-and-submit`)
        .set('x-user-role', UserRole.CARRIER)
        .set('x-user-id', 'carrier-1')
        .send({ shipperSecret: 'test-secret' })
        .expect(403);

      expect(paymentsService.testSignAndSubmitFunding).not.toHaveBeenCalled();
    });

    it('rejects admin — test-sign-and-submit is shipper-only', async () => {
      await request(app.getHttpServer())
        .post(`/shipments/${shipmentId}/payment/${paymentId}/test-sign-and-submit`)
        .set('x-user-role', UserRole.ADMIN)
        .set('x-user-id', 'admin-1')
        .send({ shipperSecret: 'test-secret' })
        .expect(403);

      expect(paymentsService.testSignAndSubmitFunding).not.toHaveBeenCalled();
    });
  });
});
