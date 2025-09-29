import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoyaltyAccount } from '../entities/loyalty-account.entity';
import { StellarService } from './stellar.service';

const POINTS_PER_SHIPMENT = 100;
const POINTS_TO_TOKEN_RATIO = 10; // 10 points = 1 token (or 1 XLM)

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(
    @InjectRepository(LoyaltyAccount)
    private readonly loyaltyRepository: Repository<LoyaltyAccount>,
    private readonly stellarService: StellarService,
  ) {}

  async awardPointsForShipment(userId: string): Promise<LoyaltyAccount> {
    let account = await this.loyaltyRepository.findOne({ where: { userId } });

    if (!account) {
      account = this.loyaltyRepository.create({ userId, points: 0 });
    }

    account.points += POINTS_PER_SHIPMENT;
    this.logger.log(`Awarded ${POINTS_PER_SHIPMENT} points to user ${userId}. New balance: ${account.points}`);
    return this.loyaltyRepository.save(account);
  }

  async redeemPoints(userId: string, pointsToRedeem: number, stellarAddress: string): Promise<{ transactionHash: string; newBalance: number }> {
    const account = await this.loyaltyRepository.findOne({ where: { userId } });

    if (!account || account.points < pointsToRedeem) {
      throw new BadRequestException('Insufficient points for redemption.');
    }
    if (pointsToRedeem <= 0) {
      throw new BadRequestException('Points to redeem must be positive.');
    }

    const tokenAmount = (pointsToRedeem / POINTS_TO_TOKEN_RATIO).toFixed(7);

    // 1. Process the payment on the Stellar network
    const transactionHash = await this.stellarService.sendRewardTokens(stellarAddress, tokenAmount.toString());

    // 2. If payment is successful, deduct points from the user's account
    account.points -= pointsToRedeem;
    await this.loyaltyRepository.save(account);

    this.logger.log(`User ${userId} redeemed ${pointsToRedeem} points for ${tokenAmount} tokens. Tx: ${transactionHash}`);
    
    return {
      transactionHash,
      newBalance: account.points,
    };
  }
  
  async getPointsBalance(userId: string): Promise<number> {
    const account = await this.loyaltyRepository.findOne({ where: { userId } });
    return account ? account.points : 0;
  }
}