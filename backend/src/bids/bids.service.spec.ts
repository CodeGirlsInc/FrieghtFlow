import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BidsService } from './bids.service';
import { Bid, BidStatus } from './entities/bid.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';

const mockBidRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
});

const mockShipmentRepo = () => ({
  findOne: jest.fn(),
  update: jest.fn(),
});

const mockEventEmitter = () => ({ emit: jest.fn() });

const pendingShipment = (overrides = {}): Partial<Shipment> => ({
  id: 'ship1',
  shipperId: 'shipper1',
  status: ShipmentStatus.PENDING,
  ...overrides,
});

const makeBid = (overrides: Partial<Bid> = {}): Bid => {
  const bid = Object.assign(new Bid(), {
    id: 'bid1',
    shipmentId: 'ship1',
    carrierId: 'carrier1',
    proposedPrice: 100,
    status: BidStatus.PENDING,
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    ...overrides,
  });
  return bid;
};

describe('BidsService', () => {
  let service: BidsService;
  let bidRepo: ReturnType<typeof mockBidRepo>;
  let shipmentRepo: ReturnType<typeof mockShipmentRepo>;
  let eventEmitter: ReturnType<typeof mockEventEmitter>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidsService,
        { provide: getRepositoryToken(Bid), useFactory: mockBidRepo },
        { provide: getRepositoryToken(Shipment), useFactory: mockShipmentRepo },
        { provide: EventEmitter2, useFactory: mockEventEmitter },
      ],
    }).compile();

    service = module.get(BidsService);
    bidRepo = module.get(getRepositoryToken(Bid));
    shipmentRepo = module.get(getRepositoryToken(Shipment));
    eventEmitter = module.get(EventEmitter2);
  });

  describe('submitBid', () => {
    it('creates a bid with expiresAt on a PENDING shipment', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      bidRepo.findOne.mockResolvedValue(null);
      const bid = makeBid();
      bidRepo.create.mockReturnValue(bid);
      bidRepo.save.mockResolvedValue(bid);

      const result = await service.submitBid('ship1', 'carrier1', {
        proposedPrice: 100,
      });
      expect(result).toMatchObject({ id: 'bid1' });
      expect(bidRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ expiresAt: expect.any(Date) }),
      );
    });

    it('throws if shipment not PENDING', async () => {
      shipmentRepo.findOne.mockResolvedValue(
        pendingShipment({ status: ShipmentStatus.ACCEPTED }),
      );
      await expect(
        service.submitBid('ship1', 'carrier1', { proposedPrice: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws if carrier already has a pending bid', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      bidRepo.findOne.mockResolvedValue(makeBid());
      await expect(
        service.submitBid('ship1', 'carrier1', { proposedPrice: 100 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getBids', () => {
    it('throws ForbiddenException if requester is not the shipper', async () => {
      shipmentRepo.findOne.mockResolvedValue(
        pendingShipment({ shipperId: 'other' }),
      );
      await expect(service.getBids('ship1', 'shipper1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('returns bids with isExpired for the shipment owner', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      bidRepo.find.mockResolvedValue([makeBid()]);
      const result = await service.getBids('ship1', 'shipper1');
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('isExpired');
    });
  });

  describe('acceptBid', () => {
    it('accepts bid and rejects others', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      const bid = makeBid();
      bidRepo.findOne.mockResolvedValue(bid);
      bidRepo.save.mockResolvedValue({ ...bid, status: BidStatus.ACCEPTED });
      bidRepo.update.mockResolvedValue(undefined);
      shipmentRepo.update.mockResolvedValue(undefined);

      const result = await service.acceptBid('ship1', 'bid1', 'shipper1');
      expect(result.status).toBe(BidStatus.ACCEPTED);
      expect(bidRepo.update).toHaveBeenCalled();
      expect(shipmentRepo.update).toHaveBeenCalledWith(
        'ship1',
        expect.objectContaining({ carrierId: 'carrier1' }),
      );
    });

    it('throws BadRequestException for expired bid', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      const expired = makeBid({ expiresAt: new Date(Date.now() - 1000) });
      bidRepo.findOne.mockResolvedValue(expired);
      await expect(
        service.acceptBid('ship1', 'bid1', 'shipper1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException if not the shipper', async () => {
      shipmentRepo.findOne.mockResolvedValue(
        pendingShipment({ shipperId: 'other' }),
      );
      await expect(
        service.acceptBid('ship1', 'bid1', 'shipper1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException if bid not found', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      bidRepo.findOne.mockResolvedValue(null);
      await expect(
        service.acceptBid('ship1', 'bid1', 'shipper1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('counterBid', () => {
    it('sets bid to COUNTER_OFFERED and emits event', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      const bid = makeBid();
      bidRepo.findOne.mockResolvedValue(bid);
      bidRepo.save.mockResolvedValue({
        ...bid,
        status: BidStatus.COUNTER_OFFERED,
        counterPrice: 90,
      });

      const result = await service.counterBid('ship1', 'bid1', 'shipper1', {
        counterPrice: 90,
      });
      expect(result.status).toBe(BidStatus.COUNTER_OFFERED);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'bid.countered',
        expect.anything(),
      );
    });

    it('throws if bid is expired', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      bidRepo.findOne.mockResolvedValue(
        makeBid({ expiresAt: new Date(Date.now() - 1000) }),
      );
      await expect(
        service.counterBid('ship1', 'bid1', 'shipper1', { counterPrice: 90 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException if not shipper', async () => {
      shipmentRepo.findOne.mockResolvedValue(
        pendingShipment({ shipperId: 'other' }),
      );
      await expect(
        service.counterBid('ship1', 'bid1', 'shipper1', { counterPrice: 90 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('acceptCounter', () => {
    it('accepts the counter, assigns carrier, emits shipment.accepted', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      const bid = makeBid({
        status: BidStatus.COUNTER_OFFERED,
        counterPrice: 90,
      });
      bidRepo.findOne.mockResolvedValue(bid);
      bidRepo.save.mockResolvedValue({
        ...bid,
        status: BidStatus.COUNTER_ACCEPTED,
      });
      bidRepo.update.mockResolvedValue(undefined);
      shipmentRepo.update.mockResolvedValue(undefined);

      const result = await service.acceptCounter('ship1', 'bid1', 'carrier1');
      expect(result.status).toBe(BidStatus.COUNTER_ACCEPTED);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'shipment.accepted',
        expect.anything(),
      );
    });

    it('throws ForbiddenException if not the bid owner', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      bidRepo.findOne.mockResolvedValue(
        makeBid({ status: BidStatus.COUNTER_OFFERED }),
      );
      await expect(
        service.acceptCounter('ship1', 'bid1', 'other-carrier'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException if not in COUNTER_OFFERED status', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      bidRepo.findOne.mockResolvedValue(makeBid({ status: BidStatus.PENDING }));
      await expect(
        service.acceptCounter('ship1', 'bid1', 'carrier1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('declineCounter', () => {
    it('sets bid to REJECTED and emits event', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      const bid = makeBid({
        status: BidStatus.COUNTER_OFFERED,
        counterPrice: 90,
      });
      bidRepo.findOne.mockResolvedValue(bid);
      bidRepo.save.mockResolvedValue({ ...bid, status: BidStatus.REJECTED });

      const result = await service.declineCounter('ship1', 'bid1', 'carrier1');
      expect(result.status).toBe(BidStatus.REJECTED);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'bid.counter_declined',
        expect.anything(),
      );
    });

    it('throws ForbiddenException if not the bid owner', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      bidRepo.findOne.mockResolvedValue(
        makeBid({ status: BidStatus.COUNTER_OFFERED }),
      );
      await expect(
        service.declineCounter('ship1', 'bid1', 'other'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
