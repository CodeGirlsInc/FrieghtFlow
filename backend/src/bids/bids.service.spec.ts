import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BidsService } from './bids.service';
import { Bid, BidStatus } from './entities/bid.entity';
import { Not } from 'typeorm';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';

const mockBidRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  manager: {
    connection: {
      createQueryRunner: jest.fn(),
    },
  },
});

const mockShipmentRepo = () => ({
  findOne: jest.fn(),
  update: jest.fn(),
});

const mockQueryRunner = () => ({
  connect: jest.fn().mockResolvedValue(undefined),
  startTransaction: jest.fn().mockResolvedValue(undefined),
  commitTransaction: jest.fn().mockResolvedValue(undefined),
  rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  release: jest.fn().mockResolvedValue(undefined),
  manager: { update: jest.fn().mockResolvedValue(undefined) },
});

const pendingShipment = (overrides = {}): Partial<Shipment> => ({
  id: 'ship1',
  shipperId: 'shipper1',
  status: ShipmentStatus.PENDING,
  ...overrides,
});

describe('BidsService', () => {
  let service: BidsService;
  let bidRepo: ReturnType<typeof mockBidRepo>;
  let shipmentRepo: ReturnType<typeof mockShipmentRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidsService,
        { provide: getRepositoryToken(Bid), useFactory: mockBidRepo },
        { provide: getRepositoryToken(Shipment), useFactory: mockShipmentRepo },
      ],
    }).compile();

    service = module.get(BidsService);
    bidRepo = module.get(getRepositoryToken(Bid));
    shipmentRepo = module.get(getRepositoryToken(Shipment));
  });

  describe('submitBid', () => {
    it('creates a bid on a PENDING shipment', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      bidRepo.findOne.mockResolvedValue(null);
      const bid = {
        id: 'bid1',
        shipmentId: 'ship1',
        carrierId: 'carrier1',
        proposedPrice: 100,
      };
      bidRepo.create.mockReturnValue(bid);
      bidRepo.save.mockResolvedValue(bid);

      const result = await service.submitBid('ship1', 'carrier1', {
        proposedPrice: 100,
      });
      expect(result).toEqual(bid);
    });

    it('throws if shipment not PENDING', async () => {
      shipmentRepo.findOne.mockResolvedValue(
        pendingShipment({ status: ShipmentStatus.ACCEPTED }),
      );
      await expect(
        service.submitBid('ship1', 'carrier1', { proposedPrice: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws if carrier is the shipper', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      await expect(
        service.submitBid('ship1', 'shipper1', { proposedPrice: 100 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws if carrier already has a pending bid', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      bidRepo.findOne.mockResolvedValue({ id: 'existing' });
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

    it('returns bids for the shipment owner', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      bidRepo.find.mockResolvedValue([]);
      const result = await service.getBids('ship1', 'shipper1');
      expect(result).toEqual([]);
    });
  });

  describe('acceptBid', () => {
    it('accepts bid and rejects others in one transaction', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      const bid = {
        id: 'bid1',
        shipmentId: 'ship1',
        carrierId: 'carrier1',
        status: BidStatus.PENDING,
      };
      bidRepo.findOne.mockResolvedValue(bid);
      const queryRunner = mockQueryRunner();
      bidRepo.manager.connection.createQueryRunner.mockReturnValue(queryRunner);

      const result = await service.acceptBid('ship1', 'bid1', 'shipper1');

      expect(result.status).toBe(BidStatus.ACCEPTED);
      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        Bid,
        { id: 'bid1' },
        { status: BidStatus.ACCEPTED },
      );
      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        Bid,
        { shipmentId: 'ship1', status: BidStatus.PENDING, id: Not('bid1') },
        { status: BidStatus.REJECTED },
      );
      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        Shipment,
        'ship1',
        expect.objectContaining({ carrierId: 'carrier1' }),
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(bidRepo.update).not.toHaveBeenCalled();
      expect(shipmentRepo.update).not.toHaveBeenCalled();
    });

    it('rolls back all writes when a step fails (BE-150)', async () => {
      shipmentRepo.findOne.mockResolvedValue(pendingShipment());
      const bid = {
        id: 'bid1',
        shipmentId: 'ship1',
        carrierId: 'carrier1',
        status: BidStatus.PENDING,
      };
      bidRepo.findOne.mockResolvedValue(bid);
      const queryRunner = mockQueryRunner();
      queryRunner.manager.update.mockRejectedValue(
        new Error('connection dropped'),
      );
      bidRepo.manager.connection.createQueryRunner.mockReturnValue(queryRunner);

      await expect(
        service.acceptBid('ship1', 'bid1', 'shipper1'),
      ).rejects.toThrow('connection dropped');

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
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
});
