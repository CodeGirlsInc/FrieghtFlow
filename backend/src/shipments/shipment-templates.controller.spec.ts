import {
  ForbiddenException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'node:http';
import { NextFunction, Request, Response } from 'express';
import * as request from 'supertest';
import { ShipmentTemplatesController } from './shipment-templates.controller';
import { ShipmentsController } from './shipments.controller';
import { ShipmentTemplateService } from './shipment-template.service';
import { ShipmentsService } from './shipments.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/role.enum';

const TEMPLATE_ID = '3f1d5f1a-6f4b-4a0a-9c1e-8f2b7d4c5a61';
const OTHER_TEMPLATE_ID = '9a2c6b3d-1e5f-4c8b-8d7a-2f3e4d5c6b70';

const validBody = {
  name: 'Weekly Lagos route',
  origin: 'Lagos, Nigeria',
  destination: 'Abuja, Nigeria',
  cargoDescription: 'Electronics for regional distribution',
  weightKg: 100,
  price: 5000,
  currency: 'USD',
};

function makeTemplate(overrides: Record<string, unknown> = {}) {
  return {
    id: TEMPLATE_ID,
    userId: 'user-1',
    name: validBody.name,
    origin: validBody.origin,
    destination: validBody.destination,
    cargoDescription: validBody.cargoDescription,
    weightKg: validBody.weightKg,
    price: validBody.price,
    currency: validBody.currency,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('ShipmentTemplatesController', () => {
  let app: INestApplication;
  let httpServer: Server;

  const templateService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    buildShipmentFromTemplate: jest.fn(),
  };

  const shipmentsService = {
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      // Registered in the same order as `ShipmentsModule.controllers`:
      // `ShipmentsController` owns `GET /shipments/:id`, so the templates
      // routes must be declared first to avoid being shadowed by it.
      controllers: [ShipmentTemplatesController, ShipmentsController],
      providers: [
        RolesGuard,
        { provide: ShipmentTemplateService, useValue: templateService },
        { provide: ShipmentsService, useValue: shipmentsService },
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
            : 'user-1';
        const role =
          typeof req.headers['x-user-role'] === 'string'
            ? (req.headers['x-user-role'] as UserRole)
            : UserRole.SHIPPER;
        req.user = { id: userId, role };
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
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('routing', () => {
    // Regression guard: `GET /shipments/:id` would otherwise swallow
    // `/shipments/templates` and reject it as a non-UUID.
    it('does not let the shipments/:id route shadow the templates list', async () => {
      templateService.findAll.mockResolvedValue([makeTemplate()]);

      await request(httpServer).get('/shipments/templates').expect(200);

      expect(templateService.findAll).toHaveBeenCalledWith('user-1');
      expect(shipmentsService.findOne).not.toHaveBeenCalled();
    });

    it('does not let the shipments/:id route shadow a template by id', async () => {
      templateService.findOne.mockResolvedValue(makeTemplate());

      await request(httpServer)
        .get(`/shipments/templates/${TEMPLATE_ID}`)
        .expect(200);

      expect(templateService.findOne).toHaveBeenCalledWith(
        TEMPLATE_ID,
        'user-1',
      );
      expect(shipmentsService.findOne).not.toHaveBeenCalled();
    });

    it('leaves the plain shipment routes working', async () => {
      shipmentsService.findOne.mockResolvedValue({ id: TEMPLATE_ID });

      await request(httpServer).get(`/shipments/${TEMPLATE_ID}`).expect(200);

      expect(shipmentsService.findOne).toHaveBeenCalledWith(TEMPLATE_ID);
    });
  });

  describe('POST /shipments/templates', () => {
    it('creates a template for the authenticated user', async () => {
      templateService.create.mockResolvedValue(makeTemplate());

      const response = await request(httpServer)
        .post('/shipments/templates')
        .set('x-user-id', 'user-1')
        .send(validBody)
        .expect(201);

      expect(templateService.create).toHaveBeenCalledWith('user-1', validBody);
      expect(response.body).toEqual(
        expect.objectContaining({ id: TEMPLATE_ID, userId: 'user-1' }),
      );
    });

    it('ignores a client-supplied userId so ownership cannot be spoofed', async () => {
      templateService.create.mockResolvedValue(makeTemplate());

      await request(httpServer)
        .post('/shipments/templates')
        .set('x-user-id', 'user-1')
        .send({ ...validBody, userId: 'someone-else' })
        .expect(201);

      const [, dto] = templateService.create.mock.calls[0];
      expect(dto).not.toHaveProperty('userId');
      expect(templateService.create).toHaveBeenCalledWith('user-1', dto);
    });

    it.each([
      ['missing name', { name: undefined }],
      ['blank origin', { origin: '' }],
      ['blank destination', { destination: '' }],
      ['non-numeric weight', { weightKg: 'heavy' }],
      ['negative weight', { weightKg: -5 }],
      ['zero price', { price: 0 }],
      ['invalid currency', { currency: 'dollars' }],
      ['cargo description under 10 characters', { cargoDescription: 'short' }],
    ])('rejects %s with 400', async (_label, override) => {
      const body: Record<string, unknown> = { ...validBody, ...override };
      for (const key of Object.keys(override)) {
        if (body[key] === undefined) delete body[key];
      }

      await request(httpServer)
        .post('/shipments/templates')
        .send(body)
        .expect(400);

      expect(templateService.create).not.toHaveBeenCalled();
    });

    it('forbids carriers, who never create shipments', async () => {
      await request(httpServer)
        .post('/shipments/templates')
        .set('x-user-role', UserRole.CARRIER)
        .send(validBody)
        .expect(403);

      expect(templateService.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /shipments/templates', () => {
    it('lists only the authenticated user’s templates', async () => {
      templateService.findAll.mockResolvedValue([makeTemplate()]);

      const response = await request(httpServer)
        .get('/shipments/templates')
        .set('x-user-id', 'user-1')
        .expect(200);

      expect(templateService.findAll).toHaveBeenCalledWith('user-1');
      expect(response.body).toHaveLength(1);
    });
  });

  describe('GET /shipments/templates/:id', () => {
    it('returns the template for its owner', async () => {
      templateService.findOne.mockResolvedValue(makeTemplate());

      const response = await request(httpServer)
        .get(`/shipments/templates/${TEMPLATE_ID}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({ id: TEMPLATE_ID }),
      );
    });

    it('surfaces cross-user access as 403', async () => {
      templateService.findOne.mockRejectedValue(new ForbiddenException());

      await request(httpServer)
        .get(`/shipments/templates/${OTHER_TEMPLATE_ID}`)
        .expect(403);
    });

    it('rejects a non-UUID id with 400', async () => {
      await request(httpServer)
        .get('/shipments/templates/not-a-uuid')
        .expect(400);

      expect(templateService.findOne).not.toHaveBeenCalled();
    });
  });

  describe('GET /shipments/templates/:id/draft', () => {
    it('returns the shipment draft built from the template', async () => {
      templateService.buildShipmentFromTemplate.mockResolvedValue({
        origin: validBody.origin,
        destination: validBody.destination,
        cargoDescription: validBody.cargoDescription,
        weightKg: 100,
        price: 5000,
        currency: 'USD',
      });

      const response = await request(httpServer)
        .get(`/shipments/templates/${TEMPLATE_ID}/draft`)
        .expect(200);

      expect(templateService.buildShipmentFromTemplate).toHaveBeenCalledWith(
        TEMPLATE_ID,
        'user-1',
      );
      expect(response.body).toEqual({
        origin: validBody.origin,
        destination: validBody.destination,
        cargoDescription: validBody.cargoDescription,
        weightKg: 100,
        price: 5000,
        currency: 'USD',
      });
    });
  });

  describe('PATCH /shipments/templates/:id', () => {
    it('applies a partial update for the owner', async () => {
      templateService.update.mockResolvedValue(makeTemplate({ price: 7500 }));

      await request(httpServer)
        .patch(`/shipments/templates/${TEMPLATE_ID}`)
        .send({ price: 7500 })
        .expect(200);

      expect(templateService.update).toHaveBeenCalledWith(
        TEMPLATE_ID,
        'user-1',
        { price: 7500 },
      );
    });

    it('rejects an invalid partial update with 400', async () => {
      await request(httpServer)
        .patch(`/shipments/templates/${TEMPLATE_ID}`)
        .send({ weightKg: -1 })
        .expect(400);

      expect(templateService.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /shipments/templates/:id', () => {
    it('deletes the template and returns 204', async () => {
      templateService.remove.mockResolvedValue(undefined);

      await request(httpServer)
        .delete(`/shipments/templates/${TEMPLATE_ID}`)
        .expect(204);

      expect(templateService.remove).toHaveBeenCalledWith(
        TEMPLATE_ID,
        'user-1',
      );
    });
  });
});
