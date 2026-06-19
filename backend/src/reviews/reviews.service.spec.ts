import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'shipper-1',
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
    isTwoFactorEnabled: false,
    twoFactorSecret: null,
    recoveryCodes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: 'ship-1',
    trackingNumber: 'FF-001',
    shipperId: 'shipper-1',
    shipper: makeUser(),
    carrierId: 'carrier-1',
    carrier: makeUser({ id: 'carrier-1', role: UserRole.CARRIER }),
    origin: 'Lagos',
    destination: 'Abuja',
    cargoDescription: 'Goods',
    weightKg: 100,
    volumeCbm: null,
    price: 5000,
    currency: 'USD',
    cargoCategory: null,
    isInsured: false,
    insurancePremium: null,
    status: ShipmentStatus.COMPLETED,
    notes: null,
    pickupDate: null,
    estimatedDeliveryDate: null,
    actualDeliveryDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let shipmentRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    reviewRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    shipmentRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: getRepositoryToken(Review), useValue: reviewRepo },
        { provide: getRepositoryToken(Shipment), useValue: shipmentRepo },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  describe('create()', () => {
    it('creates a review for a completed shipment', async () => {
      const shipment = makeShipment();
      const reviewer = makeUser();
      const review = { id: 'review-1', rating: 5 } as Review;

      shipmentRepo.findOne.mockResolvedValue(shipment);
      reviewRepo.findOne.mockResolvedValue(null);
      reviewRepo.create.mockReturnValue(review);
      reviewRepo.save.mockResolvedValue(review);

      const result = await service.create('ship-1', reviewer, { rating: 5 });

      expect(result).toBe(review);
      expect(reviewRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          reviewerId: 'shipper-1',
          revieweeId: 'carrier-1',
          rating: 5,
        }),
      );
    });

    it('throws BadRequestException if shipment not COMPLETED', async () => {
      shipmentRepo.findOne.mockResolvedValue(
        makeShipment({ status: ShipmentStatus.DELIVERED }),
      );

      await expect(
        service.create('ship-1', makeUser(), { rating: 4 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException if reviewer is not a party', async () => {
      shipmentRepo.findOne.mockResolvedValue(makeShipment());
      const outsider = makeUser({ id: 'outsider-1' });

      await expect(
        service.create('ship-1', outsider, { rating: 3 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ConflictException on duplicate review', async () => {
      shipmentRepo.findOne.mockResolvedValue(makeShipment());
      reviewRepo.findOne.mockResolvedValue({ id: 'existing-review' });

      await expect(
        service.create('ship-1', makeUser(), { rating: 5 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getAverageRating()', () => {
    it('returns average rating and total reviews', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avg: '4.5', count: '10' }),
      };
      reviewRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getAverageRating('user-1');

      expect(result.averageRating).toBe(4.5);
      expect(result.totalReviews).toBe(10);
    });

    it('returns 0 when no reviews', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avg: null, count: '0' }),
      };
      reviewRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getAverageRating('user-1');

      expect(result.averageRating).toBe(0);
      expect(result.totalReviews).toBe(0);
    });
  });
});
