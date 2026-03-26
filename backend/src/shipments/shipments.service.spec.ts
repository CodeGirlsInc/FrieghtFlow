import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShipmentsService } from './shipments.service';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatusHistory } from './entities/shipment-status-history.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';

// ── Helpers ───────────────────────────────────────────────────────────────────

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
    weightKg: 100,
    volumeCbm: null,
    price: 5000,
    currency: 'USD',
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

function mockRepo<T>() {
  return {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  } as unknown as jest.Mocked<{
    findOne: jest.Mock;
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
  }>;
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('ShipmentsService', () => {
  let service: ShipmentsService;
  let shipmentRepo: ReturnType<typeof mockRepo>;
  let historyRepo: ReturnType<typeof mockRepo>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    shipmentRepo = mockRepo<Shipment>();
    historyRepo = mockRepo<ShipmentStatusHistory>();
    eventEmitter = { emit: jest.fn() } as unknown as jest.Mocked<EventEmitter2>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        { provide: getRepositoryToken(Shipment), useValue: shipmentRepo },
        { provide: getRepositoryToken(ShipmentStatusHistory), useValue: historyRepo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<ShipmentsService>(ShipmentsService);
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('creates a shipment with PENDING status, records history, emits event', async () => {
      const shipment = makeShipment();
      shipmentRepo.create.mockReturnValue(shipment);
      shipmentRepo.save.mockResolvedValue(shipment);
      shipmentRepo.findOne.mockResolvedValue(shipment); // for reload after create
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

  // ── findOne ────────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('returns a shipment by id', async () => {
      const shipment = makeShipment();
      shipmentRepo.findOne.mockResolvedValue(shipment);

      const result = await service.findOne('shipment-uuid-1');
      expect(result).toEqual(shipment);
    });

    it('throws NotFoundException when shipment does not exist', async () => {
      shipmentRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ── accept ─────────────────────────────────────────────────────────────────

  describe('accept()', () => {
    it('assigns carrier and transitions to ACCEPTED', async () => {
      const shipment = makeShipment({ status: ShipmentStatus.PENDING });
      const carrier = makeUser({ id: 'carrier-uuid-1', role: UserRole.CARRIER });
      const accepted = makeShipment({ status: ShipmentStatus.ACCEPTED, carrierId: carrier.id });

      // findOne called twice: once in accept(), once in reload after save
      shipmentRepo.findOne
        .mockResolvedValueOnce(shipment)
        .mockResolvedValueOnce(accepted);
      shipmentRepo.save.mockResolvedValue(accepted);
      historyRepo.create.mockReturnValue({} as ShipmentStatusHistory);
      historyRepo.save.mockResolvedValue({} as ShipmentStatusHistory);

      const result = await service.accept('shipment-uuid-1', carrier);

      expect(shipmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ShipmentStatus.ACCEPTED, carrierId: carrier.id }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('shipment.accepted', expect.anything());
    });

    it('throws BadRequestException when shipment is already ACCEPTED (invalid transition)', async () => {
      // ACCEPTED→ACCEPTED is not a valid transition
      const shipment = makeShipment({ status: ShipmentStatus.ACCEPTED });
      const carrier = makeUser({ id: 'carrier-uuid-1', role: UserRole.CARRIER });
      shipmentRepo.findOne.mockResolvedValue(shipment);

      await expect(service.accept('shipment-uuid-1', carrier)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when shipment is not PENDING', async () => {
      const shipment = makeShipment({ status: ShipmentStatus.ACCEPTED });
      const carrier = makeUser({ id: 'carrier-uuid-1', role: UserRole.CARRIER });
      shipmentRepo.findOne.mockResolvedValue(shipment);

      await expect(service.accept('shipment-uuid-1', carrier)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── markInTransit ──────────────────────────────────────────────────────────

  describe('markInTransit()', () => {
    it('transitions ACCEPTED → IN_TRANSIT for the assigned carrier', async () => {
      const carrier = makeUser({ id: 'carrier-uuid-1', role: UserRole.CARRIER });
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
      expect(eventEmitter.emit).toHaveBeenCalledWith('shipment.in_transit', expect.anything());
    });

    it('throws ForbiddenException when a different carrier tries to mark in transit', async () => {
      const shipment = makeShipment({
        status: ShipmentStatus.ACCEPTED,
        carrierId: 'other-carrier-id',
      });
      const wrongCarrier = makeUser({ id: 'carrier-uuid-1', role: UserRole.CARRIER });
      shipmentRepo.findOne.mockResolvedValue(shipment);

      await expect(service.markInTransit('shipment-uuid-1', wrongCarrier)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ── markDelivered ──────────────────────────────────────────────────────────

  describe('markDelivered()', () => {
    it('transitions IN_TRANSIT → DELIVERED and sets actualDeliveryDate', async () => {
      const carrier = makeUser({ id: 'carrier-uuid-1', role: UserRole.CARRIER });
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
      expect(eventEmitter.emit).toHaveBeenCalledWith('shipment.delivered', expect.anything());
    });
  });

  // ── confirmDelivery ────────────────────────────────────────────────────────

  describe('confirmDelivery()', () => {
    it('transitions DELIVERED → COMPLETED for the shipper', async () => {
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
      expect(eventEmitter.emit).toHaveBeenCalledWith('shipment.completed', expect.anything());
    });

    it('throws ForbiddenException when a non-shipper tries to confirm', async () => {
      const outsider = makeUser({ id: 'outsider-id', role: UserRole.SHIPPER });
      const shipment = makeShipment({
        status: ShipmentStatus.DELIVERED,
        shipperId: 'different-shipper',
      });
      shipmentRepo.findOne.mockResolvedValue(shipment);

      await expect(service.confirmDelivery('shipment-uuid-1', outsider)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ── cancel ─────────────────────────────────────────────────────────────────

  describe('cancel()', () => {
    it('cancels a PENDING shipment with a reason', async () => {
      const shipper = makeUser({ id: 'user-uuid-1', role: UserRole.SHIPPER });
      const shipment = makeShipment({ status: ShipmentStatus.PENDING, shipperId: shipper.id });
      const cancelled = makeShipment({ status: ShipmentStatus.CANCELLED });

      shipmentRepo.findOne
        .mockResolvedValueOnce(shipment)
        .mockResolvedValueOnce(cancelled);
      shipmentRepo.save.mockResolvedValue(cancelled);
      historyRepo.create.mockReturnValue({} as ShipmentStatusHistory);
      historyRepo.save.mockResolvedValue({} as ShipmentStatusHistory);

      await service.cancel('shipment-uuid-1', shipper, 'No longer needed');

      expect(shipmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ShipmentStatus.CANCELLED }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('shipment.cancelled', expect.anything());
    });

    it('throws ForbiddenException when an unrelated user tries to cancel', async () => {
      const outsider = makeUser({ id: 'outsider-id', role: UserRole.SHIPPER });
      const shipment = makeShipment({ status: ShipmentStatus.PENDING, shipperId: 'other-user' });
      shipmentRepo.findOne.mockResolvedValue(shipment);

      await expect(service.cancel('shipment-uuid-1', outsider)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ── raiseDispute ───────────────────────────────────────────────────────────

  describe('raiseDispute()', () => {
    it('raises a dispute on a DELIVERED shipment (shipper)', async () => {
      // DELIVERED→DISPUTED: roles [SHIPPER, ADMIN]
      const shipper = makeUser({ id: 'user-uuid-1', role: UserRole.SHIPPER });
      const shipment = makeShipment({
        status: ShipmentStatus.DELIVERED,
        shipperId: shipper.id,
        carrierId: 'carrier-id',
      });
      const disputed = makeShipment({ status: ShipmentStatus.DISPUTED });

      shipmentRepo.findOne
        .mockResolvedValueOnce(shipment)
        .mockResolvedValueOnce(disputed);
      shipmentRepo.save.mockResolvedValue(disputed);
      historyRepo.create.mockReturnValue({} as ShipmentStatusHistory);
      historyRepo.save.mockResolvedValue({} as ShipmentStatusHistory);

      await service.raiseDispute('shipment-uuid-1', shipper, 'Cargo damaged');

      expect(shipmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ShipmentStatus.DISPUTED }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('shipment.disputed', expect.anything());
    });
  });

  // ── resolveDispute ─────────────────────────────────────────────────────────

  describe('resolveDispute()', () => {
    it('admin resolves a dispute as COMPLETED', async () => {
      const admin = makeUser({ id: 'admin-uuid', role: UserRole.ADMIN });
      const shipment = makeShipment({ status: ShipmentStatus.DISPUTED });
      const resolved = makeShipment({ status: ShipmentStatus.COMPLETED });

      shipmentRepo.findOne
        .mockResolvedValueOnce(shipment)
        .mockResolvedValueOnce(resolved);
      shipmentRepo.save.mockResolvedValue(resolved);
      historyRepo.create.mockReturnValue({} as ShipmentStatusHistory);
      historyRepo.save.mockResolvedValue({} as ShipmentStatusHistory);

      await service.resolveDispute(
        'shipment-uuid-1',
        admin,
        ShipmentStatus.COMPLETED,
        'Verified delivery',
      );

      expect(shipmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ShipmentStatus.COMPLETED }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'shipment.dispute_resolved',
        expect.anything(),
      );
    });

    it('throws ForbiddenException when a non-admin tries to resolve', async () => {
      const shipper = makeUser({ role: UserRole.SHIPPER });
      const shipment = makeShipment({ status: ShipmentStatus.DISPUTED });
      shipmentRepo.findOne.mockResolvedValue(shipment);

      await expect(
        service.resolveDispute(
          'shipment-uuid-1',
          shipper,
          ShipmentStatus.COMPLETED,
          'reason',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
