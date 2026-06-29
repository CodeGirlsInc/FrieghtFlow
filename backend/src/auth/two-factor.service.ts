/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { authenticator } from '@otplib/preset-v11';
import * as qrcode from 'qrcode';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from '../users/entities/user.entity';
import { TwoFactorRecovery } from '../users/entities/two-factor-recovery.entity';

const SETUP_TTL_MS = 10 * 60 * 1000; // 10 minutes

@Injectable()
export class TwoFactorService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TwoFactorRecovery)
    private readonly recoveryRepository: Repository<TwoFactorRecovery>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async initiateSetup(userId: number, email: string) {
    const secret = authenticator.generateSecret();
    const appName = 'YieldLadder platform';
    const otpauthUrl = authenticator.keyuri(email, appName, secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    await this.cacheManager.set(`2fa:setup:${userId}`, secret, SETUP_TTL_MS);

    return { otpauthUrl, qrCodeDataUrl, secret };
  }

  async confirmEnable(userId: number, otp: string) {
    const cacheKey = `2fa:setup:${userId}`;
    const secret = await this.cacheManager.get<string>(cacheKey);

    if (!secret) {
      throw new BadRequestException(
        '2FA setup session expired. Please regenerate the QR configuration.',
      );
    }

    const isValid = authenticator.verify({ token: otp, secret });
    if (!isValid) {
      throw new BadRequestException(
        'Invalid confirmation code. Verification rejected.',
      );
    }

    await this.userRepository.update(userId, {
      twoFactorSecret: secret,
      isTwoFactorEnabled: true,
    });

    await this.cacheManager.del(cacheKey);

    const plainRecoveryCodes: string[] = [];
    const entityPool: Partial<TwoFactorRecovery>[] = [];

    for (let i = 0; i < 8; i++) {
      // Create readable 8-character structural split code chunks
      const plainCode = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();
      plainRecoveryCodes.push(plainCode);

      const codeHash = await bcrypt.hash(plainCode, 10);
      entityPool.push({ userId, codeHash, usedAt: null });
    }

    await this.recoveryRepository.save(entityPool);

    return { recoveryCodes: plainRecoveryCodes };
  }

  async verifyTokenOrRecovery(
    userId: number,
    inputToken: string,
  ): Promise<boolean> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.twoFactorSecret')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException(
        'Multi-factor authorization is not configured for this account.',
      );
    }

    // Path A: Validate via standard time-based dynamic OTP first
    const isTotpValid = authenticator.verify({
      token: inputToken,
      secret: user.twoFactorSecret,
    });
    if (isTotpValid) return true;

    // Path B: Fall back to un-used emergency recovery tokens
    const records = await this.recoveryRepository.find({
      where: { userId, usedAt: IsNull() },
    });

    for (const record of records) {
      const match = await bcrypt.compare(inputToken, record.codeHash);
      if (match) {
        await this.recoveryRepository.update(record.id, { usedAt: new Date() });
        return true;
      }
    }

    return false;
  }

  async deactivate(userId: number) {
    await this.userRepository.update(userId, {
      twoFactorSecret: '' as unknown as string,
      isTwoFactorEnabled: false,
    });
    await this.recoveryRepository.delete({ userId });
  }
}
