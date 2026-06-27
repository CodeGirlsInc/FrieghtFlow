import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { BidExpiryService } from './bid-expiry.service';
import { Bid, BidStatus } from '../bids/entities/bid.entity';

describe('BidExpiryService', () => {
  let service: BidExpiryService;

  const mockBidRepo = {
    update: jest.fn().mockResolvedValue({ affected: 5 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidExpiryService,
        { provide: getRepositoryToken(Bid), useValue: mockBidRepo },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(72) } },
      ],
    }).compile();
    service = module.get(BidExpiryService);
  });

  it('expires bids older than threshold', async () => {
    await service.expireStaleBids();
    expect(mockBidRepo.update).toHaveBeenCalled();
  });
});
