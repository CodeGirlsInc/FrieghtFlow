import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'node:http';
import { NextFunction, Request, Response } from 'express';
import * as request from 'supertest';
import { EtaController } from './eta.controller';
import { EtaService, ShipmentZone } from './eta.service';
import { UserRole } from '../common/enums/role.enum';

/** Nest error bodies carry `message` as a string or an array of strings. */
function errorMessage(body: unknown): string {
  const message = (body as { message?: string | string[] }).message;
  return Array.isArray(message) ? message.join(' ') : String(message ?? '');
}

describe('EtaController', () => {
  let app: INestApplication;
  let httpServer: Server;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [EtaController],
      // The real service is wired in: the endpoint's contract is exactly
      // the zone resolution + validation behaviour under test.
      providers: [EtaService],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(
      (
        req: Request & { user?: { id: string; role: UserRole } },
        _res: Response,
        next: NextFunction,
      ) => {
        req.user = { id: 'user-1', role: UserRole.SHIPPER };
        next();
      },
    );
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );

    await app.init();
    httpServer = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /shipments/eta/estimate', () => {
    it('returns transit days, a delivery date and both zones', async () => {
      const response = await request(httpServer)
        .post('/shipments/eta/estimate')
        .send({
          origin: 'Lagos, Nigeria',
          destination: 'Abuja, Nigeria',
          weightKg: 120,
        })
        .expect(201);

      expect(response.body).toEqual({
        estimatedTransitDays: 4,
        estimatedDeliveryDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        originZone: ShipmentZone.AF,
        destinationZone: ShipmentZone.AF,
      });
    });

    it('estimates an international lane', async () => {
      const response = await request(httpServer)
        .post('/shipments/eta/estimate')
        .send({
          origin: 'Lagos, Nigeria',
          destination: 'New York, US',
          weightKg: 20,
        })
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          originZone: ShipmentZone.AF,
          destinationZone: ShipmentZone.US,
          estimatedTransitDays: 10,
        }),
      );
    });

    it('coerces a numeric string weight', async () => {
      const response = await request(httpServer)
        .post('/shipments/eta/estimate')
        .send({
          origin: 'Lagos, Nigeria',
          destination: 'Abuja, Nigeria',
          weightKg: '120',
        })
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({ estimatedTransitDays: 4 }),
      );
    });

    it.each([
      ['missing origin', { destination: 'Abuja, Nigeria', weightKg: 10 }],
      [
        'blank origin',
        { origin: '   ', destination: 'Abuja, Nigeria', weightKg: 10 },
      ],
      ['missing destination', { origin: 'Lagos, Nigeria', weightKg: 10 }],
      [
        'blank destination',
        { origin: 'Lagos, Nigeria', destination: '', weightKg: 10 },
      ],
      ['missing weight', { origin: 'Lagos, Nigeria', destination: 'Abuja' }],
      [
        'zero weight',
        {
          origin: 'Lagos, Nigeria',
          destination: 'Abuja, Nigeria',
          weightKg: 0,
        },
      ],
      [
        'negative weight',
        {
          origin: 'Lagos, Nigeria',
          destination: 'Abuja, Nigeria',
          weightKg: -3,
        },
      ],
      [
        'non-numeric weight',
        {
          origin: 'Lagos, Nigeria',
          destination: 'Abuja, Nigeria',
          weightKg: 'heavy',
        },
      ],
      [
        'over-long origin',
        {
          origin: 'L'.repeat(256),
          destination: 'Abuja, Nigeria',
          weightKg: 10,
        },
      ],
    ])('rejects %s with 400', async (_label, body) => {
      await request(httpServer)
        .post('/shipments/eta/estimate')
        .send(body)
        .expect(400);
    });

    it('rejects an unresolvable location with 400 instead of defaulting to US', async () => {
      const response = await request(httpServer)
        .post('/shipments/eta/estimate')
        .send({
          origin: 'Sydney, Australia',
          destination: 'Lagos, Nigeria',
          weightKg: 10,
        })
        .expect(400);

      expect(errorMessage(response.body)).toContain('Sydney, Australia');
    });

    it('rejects an unserved lane with 400', async () => {
      const response = await request(httpServer)
        .post('/shipments/eta/estimate')
        .send({
          origin: 'Toronto, CA',
          destination: 'Paris, France',
          weightKg: 10,
        })
        .expect(400);

      expect(errorMessage(response.body)).toContain('CA → EU');
    });
  });
});
