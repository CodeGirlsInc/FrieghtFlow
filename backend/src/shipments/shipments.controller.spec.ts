import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Server } from 'node:http';
import { Readable } from 'node:stream';
import { Request, Response, NextFunction } from 'express';
import * as request from 'supertest';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/role.enum';

const shipmentCreateLimitMessage =
  'Shipment creation rate limit exceeded. Authenticated users can create up to 10 shipments per minute.';

describe('ShipmentsController', () => {
  let app: INestApplication;
  let httpServer: Server;

  const shipmentsService = {
    create: jest
      .fn()
      .mockImplementation((userId: string, dto: Record<string, unknown>) => ({
        id: `shipment-${userId}`,
        shipperId: userId,
        ...dto,
      })),
    findAll: jest.fn().mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    }),
    exportShipments: jest.fn().mockResolvedValue({
      stream: Readable.from(['[]']),
      contentType: 'application/json; charset=utf-8',
      fileName: 'shipments.json',
    }),
  };

  const payload = {
    origin: 'Lagos, Nigeria',
    destination: 'Abuja, Nigeria',
    cargoDescription: 'Electronics cargo for regional distribution.',
    weightKg: 500.5,
    price: 1500,
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({
          errorMessage: (context) => {
            const req = context.switchToHttp().getRequest<{
              method?: string;
              url?: string;
            }>();

            if (req.method === 'POST' && req.url?.includes('/shipments')) {
              return shipmentCreateLimitMessage;
            }

            return 'Too Many Requests';
          },
          throttlers: [
            {
              name: 'default',
              ttl: 60_000,
              limit: 60,
            },
            {
              name: 'shipmentCreate',
              ttl: 60_000,
              limit: 10,
              getTracker: (_request, context) => {
                const req = context.switchToHttp().getRequest<{
                  ip?: string;
                  user?: { id?: string };
                }>();

                return req.user?.id ?? req.ip ?? 'anonymous';
              },
            },
          ],
        }),
      ],
      controllers: [ShipmentsController],
      providers: [
        RolesGuard,
        { provide: ShipmentsService, useValue: shipmentsService },
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(
      (
        req: Request & { user?: { id: string; role: UserRole } },
        _res: Response,
        next: NextFunction,
      ) => {
        const userId =
          typeof req.headers['x-user-id'] === 'string'
            ? req.headers['x-user-id']
            : 'shipper-1';
        const roleHeader =
          typeof req.headers['x-user-role'] === 'string'
            ? (req.headers['x-user-role'] as UserRole)
            : UserRole.SHIPPER;
        req.user = { id: userId, role: roleHeader };
        next();
      },
    );
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );

    await app.init();
    httpServer = app.getHttpServer() as Server;
  });

  afterEach(() => {
    shipmentsService.create.mockClear();
    shipmentsService.findAll.mockClear();
    shipmentsService.exportShipments.mockClear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows shipment creation while the per-user limit has not been exceeded', async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await request(httpServer)
        .post('/shipments')
        .set('x-user-id', 'shipper-1')
        .send(payload)
        .expect(201);
    }

    expect(shipmentsService.create).toHaveBeenCalledTimes(10);
  });

  it('blocks the 11th shipment creation request for the same authenticated user with a descriptive 429 message', async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await request(httpServer)
        .post('/shipments')
        .set('x-user-id', 'shipper-2')
        .send(payload)
        .expect(201);
    }

    const response = await request(httpServer)
      .post('/shipments')
      .set('x-user-id', 'shipper-2')
      .send(payload)
      .expect(429);

    expect((response.body as { message: string }).message).toBe(
      shipmentCreateLimitMessage,
    );
    expect(shipmentsService.create).toHaveBeenCalledTimes(10);
  });

  it('tracks shipment creation limits per authenticated user instead of globally', async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await request(httpServer)
        .post('/shipments')
        .set('x-user-id', 'shipper-3')
        .send(payload)
        .expect(201);
    }

    await request(httpServer)
      .post('/shipments')
      .set('x-user-id', 'shipper-4')
      .send(payload)
      .expect(201);

    expect(shipmentsService.create).toHaveBeenCalledTimes(11);
  });

  it('accepts origin and destination query params for shipment search', async () => {
    await request(httpServer)
      .get('/shipments')
      .query({ origin: 'lag', destination: 'abu' })
      .expect(200);

    expect(shipmentsService.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'shipper-1', role: UserRole.SHIPPER }),
      expect.objectContaining({ origin: 'lag', destination: 'abu' }),
    );
  });

  it('streams JSON shipment exports for shippers', async () => {
    shipmentsService.exportShipments.mockResolvedValueOnce({
      stream: Readable.from(['[{"id":"shipment-1"}]']),
      contentType: 'application/json; charset=utf-8',
      fileName: 'shipments.json',
    });

    const response = await request(httpServer)
      .get('/shipments/export')
      .set('x-user-role', UserRole.SHIPPER)
      .query({ format: 'json' })
      .expect(200);

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.text).toContain('shipment-1');
    expect(shipmentsService.exportShipments).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'shipper-1', role: UserRole.SHIPPER }),
      'json',
    );
  });

  it('streams CSV shipment exports for admins', async () => {
    shipmentsService.exportShipments.mockResolvedValueOnce({
      stream: Readable.from(['id,trackingNumber\nshipment-1,FF-TEST-001\n']),
      contentType: 'text/csv; charset=utf-8',
      fileName: 'shipments.csv',
    });

    const response = await request(httpServer)
      .get('/shipments/export')
      .set('x-user-role', UserRole.ADMIN)
      .query({ format: 'csv' })
      .expect(200);

    expect(response.headers['content-type']).toContain('text/csv');
    expect(response.text).toContain('trackingNumber');
    expect(shipmentsService.exportShipments).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'shipper-1', role: UserRole.ADMIN }),
      'csv',
    );
  });
});
