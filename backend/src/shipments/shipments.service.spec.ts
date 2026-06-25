import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Readable } from 'node:stream';
import { ILike } from 'typeorm';
import { ShipmentsService } from './shipments.service';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatusHistory } from './entities/shipment-status-history.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { UserRole } from '../common/enums/role.enum';
import { CargoCategory } from '../common/enums/cargo-category.enum';
import { User } from '../users/entities/user.entity';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-uuid-1',
    email: 'shipper@example.com',
    passwordHash: '',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.SHIPPER,
    isEmailVerified: true,
    isActive: true,
    walletAddress: null,
    refreshToken: null,
    verificationToken: null,
    verificationTokenExpiry: null,
    resetPasswordToken: null,
    resetPasswordExpiry: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isTwoFactorEnabled: false,
    twoFactorSecret: null as unknown as string,
    recoveryCodes: [],
    ...overrides,
  };
}

function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: 'shipment-uuid-1',
    trackingNumber: 'FF-TEST-001',
    shipperId: 'user-uuid-1',
    shipper: makeUser(),
    carrierId: null,
    carrier: null,
    origin: 'Lagos',
    destination: 'Abuja',
    cargoDescription: 'Electronics',
    cargoCategory: null,
    weightKg: 100,
    volumeCbm: null,
    price: 5000,
    currency: 'USD',
    isInsured: false,
    insurancePremium: null,
    status: ShipmentStatus.PENDING,
    notes: null,
    pickupDate: null,
    estimatedDeliveryDate: null,
    actualDeliveryDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function mockRepo() {
  return {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
    manager: {
      connection: {
        createQueryRunner: jest.fn(),
      },
      save: jest.fn(),
    },
  } as unknown as jest.Mocked<{
    findOne: jest.Mock;
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
    manager: {
      connection: { createQueryRunner: jest.Mock };
      save: jest.Mock;
    };
  }>;
}

function mockQueryBuilder() {
  return {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    stream: jest.fn(),
  };
}

describe('ShipmentsService', () => {
  let service: ShipmentsService;
  let shipmentRepo: ReturnType<typeof mockRepo>;
  let historyRepo: ReturnType<typeof mockRepo>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    shipmentRepo = mockRepo();
    historyRepo = mockRepo();
    eventEmitter = { emit: jest.fn() } as unknown as jest.Mocked<EventEmitter2>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        { provide: getRepositoryToken(Shipment), useValue: shipmentRepo },
        {
          provide: getRepositoryToken(ShipmentStatusHistory),
          useValue: historyRepo,
        },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<ShipmentsService>(ShipmentsService);
  });

  describe('create()', () => {
    it('creates a shipment with PENDING status, records history, emits event', async () => {
      const shipment = makeShipment();
      shipmentRepo.create.mockReturnValue(shipment);
      shipmentRepo.save.mockResolvedValue(shipment);
      shipmentRepo.findOne.mockResolvedValue(shipment);
      historyRepo.create.mockReturnValue({} as ShipmentStatusHistory);
      historyRepo.save.mockResolvedValue({} as ShipmentStatusHistory);

      await service.create('user-uuid-1', {
        origin: 'Lagos',
        destination: 'Abuja',
        cargoDescription: 'Electronics',
        weightKg: 100,
        price: 5000,
      });

      expect(shipmentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: ShipmentStatus.PENDING }),
      );
      expect(historyRepo.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'shipment.created',
        expect.anything(),
      );
    });
  });

  describe('findOne()', () => {
    it('returns a shipment by id', async () => {
      const shipment = makeShipment();
      shipmentRepo.findOne.mockResolvedValue(shipment);

      const result = await service.findOne('shipment-uuid-1');
      expect(result).toEqual(shipment);
    });

    it('throws NotFoundException when shipment does not exist', async () => {
      shipmentRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll()', () => {
    it('applies case-insensitive partial origin and destination filters', async () => {
      shipmentRepo.findAndCount.mockResolvedValue([[], 0]);
      const shipper = makeUser({ id: 'shipper-1', role: UserRole.SHIPPER });

      await service.findAll(shipper, {
        origin: 'lag',
        destination: 'abu',
        page: 1,
        limit: 20,
      });

      expect(shipmentRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            shipperId: 'shipper-1',
            origin: ILike('%lag%'),
            destination: ILike('%abu%'),
          }),
        }),
      );
    });
  });

  describe('exportShipments()', () => {
    it('filters CSV exports to the requesting shipper', async () => {
      const queryBuilder = mockQueryBuilder();
      queryBuilder.stream.mockResolvedValue(Readable.from([]));
      shipmentRepo.createQueryBuilder.mockReturnValue(queryBuilder as never);

      const result = await service.exportShipments(
        makeUser({ id: 'shipper-99', role: UserRole.SHIPPER }),
        'csv',
      );

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'shipment.shipperId = :shipperId',
        { shipperId: 'shipper-99' },
      );
      expect(result.contentType).toContain('text/csv');
    });

    it('does not scope admin JSON exports to a single shipper', async () => {
      const queryBuilder = mockQueryBuilder();
      queryBuilder.stream.mockResolvedValue(Readable.from([]));
      shipmentRepo.createQueryBuilder.mockReturnValue(queryBuilder as never);

      const result = await service.exportShipments(
        makeUser({ id: 'admin-1', role: UserRole.ADMIN }),
        'json',
      );

      expect(queryBuilder.where).not.toHaveBeenCalled();
      expect(result.contentType).toContain('application/json');
    });

    it('rejects exports for carriers', async () => {
      await expect(
        service.exportShipments(
          makeUser({ id: 'carrier-1', role: UserRole.CARRIER }),
          'json',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('streams CSV rows with a header row', async () => {
      const queryBuilder = mockQueryBuilder();
      queryBuilder.stream.mockResolvedValue(
        Readable.from([
          {
            id: 'shipment-1',
            trackingNumber: 'FF-TEST-001',
            shipperId: 'shipper-1',
            carrierId: null,
            origin: 'Lagos',
            destination: 'Abuja',
            cargoDescription: 'Electronics',
            weightKg: '100.00',
            volumeCbm: null,
            price: '5000.00',
            currency: 'USD',
            status: ShipmentStatus.PENDING,
            pickupDate: null,
            estimatedDeliveryDate: null,
            actualDeliveryDate: null,
            createdAt: '2026-04-24T10:00:00.000Z',
            updatedAt: '2026-04-24T10:00:00.000Z',
          },
        ]),
      );
      shipmentRepo.createQueryBuilder.mockReturnValue(queryBuilder as never);

      const result = await service.exportShipments(makeUser(), 'csv');
      const chunks: Uint8Array[] = [];

      await new Promise<void>((resolve, reject) => {
        result.stream.on('data', (chunk: string | Uint8Array) => {
          chunks.push(
            typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk,
          );
        });
        result.stream.on('end', () => resolve());
        result.stream.on('error', reject);
      });

      const csvOutput = Buffer.concat(chunks).toString('utf8');
      expect(csvOutput).toContain('id,trackingNumber,shipperId');
      expect(csvOutput).toContain('FF-TEST-001');
    });
  });

  describe('accept()', () => {
    it('assigns carrier and transitions to ACCEPTED', async () => {
      const shipment = makeShipment({ status: ShipmentStatus.PENDING });
      const carrier = makeUser({
        id: 'carrier-uuid-1',
        role: UserRole.CARRIER,
      });
      const accepted = makeShipment({
        status: ShipmentStatus.ACCEPTED,
        carrierId: carrier.id,
      });

      shipmentRepo.findOne
        .mockResolvedValueOnce(shipment)
        .mockResolvedValueOnce(accepted);
      shipmentRepo.save.mockResolvedValue(accepted);
      historyRepo.create.mockReturnValue({} as ShipmentStatusHistory);
      historyRepo.save.mockResolvedValue({} as ShipmentStatusHistory);

      await service.accept('shipment-uuid-1', carrier);

      expect(shipmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ShipmentStatus.ACCEPTED,
          carrierId: carrier.id,
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'shipment.accepted',
        expect.anything(),
      );
    });

    it('throws BadRequestException when shipment is not PENDING', async () => {
      const shipment = makeShipment({ status: ShipmentStatus.ACCEPTED });
      const carrier = makeUser({
        id: 'carrier-uuid-1',
        role: UserRole.CARRIER,
      });
      shipmentRepo.findOne.mockResolvedValue(shipment);

      await expect(service.accept('shipment-uuid-1', carrier)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('markInTransit()', () => {
    it('transitions ACCEPTED to IN_TRANSIT for the assigned carrier', async () => {
      const carrier = makeUser({
        id: 'carrier-uuid-1',
        role: UserRole.CARRIER,
      });
      const shipment = makeShipment({
        status: ShipmentStatus.ACCEPTED,
        carrierId: carrier.id,
      });
      const inTransit = makeShipment({ status: ShipmentStatus.IN_TRANSIT });

      shipmentRepo.findOne
        .mockResolvedValueOnce(shipment)
        .mockResolvedValueOnce(inTransit);
      shipmentRepo.save.mockResolvedValue(inTransit);
      historyRepo.create.mockReturnValue({} as ShipmentStatusHistory);
      historyRepo.save.mockResolvedValue({} as ShipmentStatusHistory);

      await service.markInTransit('shipment-uuid-1', carrier);

      expect(shipmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ShipmentStatus.IN_TRANSIT }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'shipment.in_transit',
        expect.anything(),
      );
    });

    it('throws ForbiddenException when a different carrier tries to mark in transit', async () => {
      const shipment = makeShipment({
        status: ShipmentStatus.ACCEPTED,
        carrierId: 'other-carrier-id',
      });
      const wrongCarrier = makeUser({
        id: 'carrier-uuid-1',
        role: UserRole.CARRIER,
      });
      shipmentRepo.findOne.mockResolvedValue(shipment);

      await expect(
        service.markInTransit('shipment-uuid-1', wrongCarrier),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markDelivered()', () => {
    it('transitions IN_TRANSIT to DELIVERED and sets actualDeliveryDate', async () => {
      const carrier = makeUser({
        id: 'carrier-uuid-1',
        role: UserRole.CARRIER,
      });
      const shipment = makeShipment({
        status: ShipmentStatus.IN_TRANSIT,
        carrierId: carrier.id,
      });
      const delivered = makeShipment({
        status: ShipmentStatus.DELIVERED,
        actualDeliveryDate: new Date(),
      });

      shipmentRepo.findOne
        .mockResolvedValueOnce(shipment)
        .mockResolvedValueOnce(delivered);
      shipmentRepo.save.mockResolvedValue(delivered);
      historyRepo.create.mockReturnValue({} as ShipmentStatusHistory);
      historyRepo.save.mockResolvedValue({} as ShipmentStatusHistory);

      await service.markDelivered('shipment-uuid-1', carrier);

      expect(shipmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ShipmentStatus.DELIVERED,
          actualDeliveryDate: expect.any(Date),
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'shipment.delivered',
        expect.anything(),
      );
    });
  });

  describe('confirmDelivery()', () => {
    it('transitions DELIVERED to COMPLETED for the shipper', async () => {
      const shipper = makeUser({ id: 'user-uuid-1', role: UserRole.SHIPPER });
      const shipment = makeShipment({
        status: ShipmentStatus.DELIVERED,
        shipperId: shipper.id,
      });
      const completed = makeShipment({ status: ShipmentStatus.COMPLETED });

      shipmentRepo.findOne
        .mockResolvedValueOnce(shipment)
        .mockResolvedValueOnce(completed);
      shipmentRepo.save.mockResolvedValue(completed);
      historyRepo.create.mockReturnValue({} as ShipmentStatusHistory);
      historyRepo.save.mockResolvedValue({} as ShipmentStatusHistory);

      await service.confirmDelivery('shipment-uuid-1', shipper);

      expect(shipmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ShipmentStatus.COMPLETED }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'shipment.completed',
        expect.anything(),
      );
    });

    it('throws ForbiddenException when a non-shipper tries to confirm', async () => {
      const outsider = makeUser({ id: 'outsider-id', role: UserRole.SHIPPER });
      const shipment = makeShipment({
        status: ShipmentStatus.DELIVERED,
        shipperId: 'different-shipper',
      });
      shipmentRepo.findOne.mockResolvedValue(shipment);

      await expect(
        service.confirmDelivery('shipment-uuid-1', outsider),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('cancel()', () => {
    it('cancels a PENDING shipment with a reason', async () => {
      const shipper = makeUser({ id: 'user-uuid-1', role: UserRole.SHIPPER });
      const shipment = makeShipment({
        status: ShipmentStatus.PENDING,
        shipperId: shipper.id,
      });
      const cancelled = makeShipment({ status: ShipmentStatus.CANCELLED });

      shipmentRepo.findOne
        .mockResolvedValueOnce(shipment)
        .mockResolvedValueOnce(cancelled);
      shipmentRepo.save.mockResolvedValue(cancelled);
      historyRepo.create.mockReturnValue({} as ShipmentStatusHistory);
      historyRepo.save.mockResolvedValue({} as ShipmentStatusHistory);

      await service.cancel('shipment-uuid-1', shipper, 'Customer request');

      expect(shipmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ShipmentStatus.CANCELLED }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'shipment.cancelled',
        expect.anything(),
      );
    });
  });

  describe('cargoCategory filtering', () => {
    it('applies cargoCategory filter in findAll', async () => {
      shipmentRepo.findAndCount.mockResolvedValue([[], 0]);
      const shipper = makeUser({ id: 'shipper-1', role: UserRole.SHIPPER });

      await service.findAll(shipper, {
        cargoCategory: CargoCategory.ELECTRONICS,
        page: 1,
        limit: 20,
      });

      expect(shipmentRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            shipperId: 'shipper-1',
            cargoCategory: CargoCategory.ELECTRONICS,
          }),
        }),
      );
    });

    it('applies cargoCategory filter in findMarketplace', async () => {
      shipmentRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findMarketplace({
        cargoCategory: CargoCategory.HAZARDOUS,
        page: 1,
        limit: 20,
      });

      expect(shipmentRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ShipmentStatus.PENDING,
            cargoCategory: CargoCategory.HAZARDOUS,
          }),
        }),
      );
    });
  });

  describe('insurance premium calculation', () => {
    it('calculates insurance premium as 1.5% of price when isInsured is true', async () => {
      const shipment = makeShipment();
      shipmentRepo.create.mockReturnValue(shipment);
      shipmentRepo.save.mockResolvedValue(shipment);
      shipmentRepo.findOne.mockResolvedValue(shipment);
      historyRepo.create.mockReturnValue({} as ShipmentStatusHistory);
      historyRepo.save.mockResolvedValue({} as ShipmentStatusHistory);

      await service.create('user-uuid-1', {
        origin: 'Lagos',
        destination: 'Abuja',
        cargoDescription: 'Electronics',
        weightKg: 100,
        price: 10000,
        isInsured: true,
      });

      expect(shipmentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isInsured: true,
          insurancePremium: 150, // 1.5% of 10000
        }),
      );
    });

    it('sets insurancePremium to null when isInsured is false', async () => {
      const shipment = makeShipment();
      shipmentRepo.create.mockReturnValue(shipment);
      shipmentRepo.save.mockResolvedValue(shipment);
      shipmentRepo.findOne.mockResolvedValue(shipment);
      historyRepo.create.mockReturnValue({} as ShipmentStatusHistory);
      historyRepo.save.mockResolvedValue({} as ShipmentStatusHistory);

      await service.create('user-uuid-1', {
        origin: 'Lagos',
        destination: 'Abuja',
        cargoDescription: 'Electronics',
        weightKg: 100,
        price: 5000,
        isInsured: false,
      });

      expect(shipmentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isInsured: false,
          insurancePremium: null,
        }),
      );
    });
  });

  describe('batchCreate()', () => {
    it('creates multiple shipments transactionally and returns their IDs', async () => {
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          save: jest
            .fn()
            .mockResolvedValueOnce({ id: 'batch-1' })
            .mockResolvedValueOnce({ id: 'batch-2' }),
        },
      };
      shipmentRepo.manager.connection.createQueryRunner.mockReturnValue(
        mockQueryRunner,
      );
      shipmentRepo.create.mockImplementation((dto) => dto as Shipment);
      shipmentRepo.findOne.mockResolvedValue(makeShipment());
      historyRepo.create.mockReturnValue({} as ShipmentStatusHistory);
      historyRepo.save.mockResolvedValue({} as ShipmentStatusHistory);

      const result = await service.batchCreate('shipper-1', {
        shipments: [
          {
            origin: 'Lagos',
            destination: 'Abuja',
            cargoDescription: 'Electronics batch 1',
            weightKg: 100,
            price: 5000,
          },
          {
            origin: 'Lagos',
            destination: 'Kano',
            cargoDescription: 'Electronics batch 2',
            weightKg: 200,
            price: 8000,
          },
        ],
      });

      expect(result).toEqual(['batch-1', 'batch-2']);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledTimes(2);
    });

    it('rolls back the entire batch if any shipment fails', async () => {
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          save: jest
            .fn()
            .mockResolvedValueOnce({ id: 'batch-1' })
            .mockRejectedValueOnce(new Error('Validation error')),
        },
      };
      shipmentRepo.manager.connection.createQueryRunner.mockReturnValue(
        mockQueryRunner,
      );
      shipmentRepo.create.mockImplementation((dto) => dto as Shipment);
      historyRepo.create.mockReturnValue({} as ShipmentStatusHistory);
      historyRepo.save.mockResolvedValue({} as ShipmentStatusHistory);

      await expect(
        service.batchCreate('shipper-1', {
          shipments: [
            {
              origin: 'Lagos',
              destination: 'Abuja',
              cargoDescription: 'Valid shipment',
              weightKg: 100,
              price: 5000,
            },
            {
              origin: 'Lagos',
              destination: 'Kano',
              cargoDescription: 'Invalid shipment',
              weightKg: 200,
              price: 8000,
            },
          ],
        }),
      ).rejects.toThrow('Validation error');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    });
  });
});
