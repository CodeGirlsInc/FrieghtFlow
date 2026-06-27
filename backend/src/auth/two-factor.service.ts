import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateSecret, verify, generateURI } from 'otplib';
import { Repository, IsNull } from 'typeorm';
import { TOTP, generateURI } from 'otplib';
// import { authenticator } from 'otplib';
import { authenticator } from '@otplib/preset-v11';
import * as qrcode from 'qrcode';
import * as bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import { User } from '../users/entities/user.entity';
import { TwoFactorRecovery } from '../users/entities/two-factor-recovery.entity';
import { IsNull } from 'typeorm';

const authenticator = new TOTP();

@Injectable()
export class TwoFactorService {
  private readonly redisClient: Redis;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TwoFactorRecovery)
    private readonly recoveryRepository: Repository<TwoFactorRecovery>,
  ) {
    // Standard workspace constructor assignment for Redis connection
    this.redisClient = new Redis(
      process.env.REDIS_URL || 'redis://localhost:6379',
    );
  }

  async initiateSetup(userId: number, email: string) {
    const secret = generateSecret();
    const appName = 'YieldLadder platform';
    const otpauthUrl = generateURI({ secret, issuer: appName, label: email });
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    // Cache the temporary secret safely inside Redis with a strict 10 minute TTL
    const redisKey = `2fa:setup:${userId}`;
    await this.redisClient.setex(redisKey, 600, secret);

    return { otpauthUrl, qrCodeDataUrl, secret };
  }

  async confirmEnable(userId: number, otp: string) {
    const redisKey = `2fa:setup:${userId}`;
    const secret = await this.redisClient.get(redisKey);

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

    // Persist configuration settings to user entity
    await this.userRepository.update(userId, {
      twoFactorSecret: secret,
      isTwoFactorEnabled: true,
    });

    // Clear temporary setup parameters out of cache memory immediately
    await this.redisClient.del(redisKey);

    // Generate 8 individual secure backup validation tokens
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
    // const records = await this.recoveryRepository.find({ where: { userId, usedAt: null } });
    const records = await this.recoveryRepository.find({
      where: { userId, usedAt: IsNull() },
    });

    for (const record of records) {
      const match = await bcrypt.compare(inputToken, record.codeHash);
      if (match) {
        // Invalidate single-use tracking item upon execution match matching Acceptance Criteria
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
    // Wipe matching system recovery database objects safely
    await this.recoveryRepository.delete({ userId });
  }
}
