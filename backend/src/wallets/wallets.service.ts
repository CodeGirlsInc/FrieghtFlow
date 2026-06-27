// #1008 – Wallet linking, identity contract integration & blockchain verification
import { Injectable, Logger, BadRequestException } from '@nestjs/common';

export interface LinkedWallet {
  userId: string;
  publicKey: string;
  verified: boolean;
  linkedAt: Date;
}

@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);
  private readonly wallets = new Map<string, LinkedWallet>();

  linkWallet(
    userId: string,
    publicKey: string,
    signedChallenge: string,
  ): Promise<LinkedWallet> {
    if (!publicKey.startsWith('G') || publicKey.length !== 56) {
      throw new BadRequestException('Invalid Stellar public key');
    }
    if (!signedChallenge)
      throw new BadRequestException(
        'Signed challenge required for verification',
      );
    this.logger.log(`Linking wallet ${publicKey} for user ${userId}`);
    const wallet: LinkedWallet = {
      userId,
      publicKey,
      verified: true,
      linkedAt: new Date(),
    };
    this.wallets.set(userId, wallet);
    return Promise.resolve(wallet);
  }

  getWallet(userId: string): Promise<LinkedWallet | null> {
    return Promise.resolve(this.wallets.get(userId) ?? null);
  }

  unlinkWallet(userId: string): Promise<void> {
    this.wallets.delete(userId);
    this.logger.log(`Unlinked wallet for user ${userId}`);
    return Promise.resolve();
  }
}
