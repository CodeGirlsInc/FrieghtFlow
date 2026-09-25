import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, MoreThan, Repository } from 'typeorm';
import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { TwoFactorOtp } from './entities/two-factor-otp.entity';

const OTP_MIN = 100_000;
const OTP_MAX = 1_000_000;
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_HASH_LENGTH = 64;

type OtpState = Partial<
  Pick<TwoFactorOtp, 'enabled' | 'otpCodeHash' | 'otpExpiresAt' | 'otpUsed'>
>;
type OtpCriteria = string | FindOptionsWhere<TwoFactorOtp>;
type OtpPatch = OtpState;

@Injectable()
export class TwoFactorService {
  constructor(
    @InjectRepository(TwoFactorOtp)
    private readonly otpRepo: Repository<TwoFactorOtp>,
  ) {}

  async isEnabled(userId: string): Promise<boolean> {
    const state = await this.findState(userId);
    return state?.enabled === true;
  }

  async enable(userId: string): Promise<void> {
    // Clearing the OTP fields on enrollment prevents a stale code from being
    // resurrected if an older row is re-enabled.
    await this.writeState(userId, {
      enabled: true,
      otpCodeHash: null,
      otpExpiresAt: null,
      otpUsed: false,
    });
  }

  async disable(userId: string): Promise<void> {
    // Do not upsert here. A conditional UPDATE lets a concurrent generation
    // either happen before this clear (and be cleared) or fail its enabled
    // predicate, so a disabled user can never retain a live OTP.
    await this.updateState(
      { userId },
      {
        enabled: false,
        otpCodeHash: null,
        otpExpiresAt: null,
        otpUsed: false,
      },
    );
  }

  async generateOtp(userId: string): Promise<string> {
    // randomInt uses a cryptographically secure source and an unbiased
    // rejection-sampling implementation under the hood.
    const code = randomInt(OTP_MIN, OTP_MAX).toString().padStart(6, '0');
    const otpCodeHash = this.hashOtp(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    const result = await this.updateState(
      { userId, enabled: true },
      {
        otpCodeHash,
        otpExpiresAt: expiresAt,
        otpUsed: false,
      },
    );

    if (result?.affected !== 1) {
      const state = await this.findState(userId);
      if (!state?.enabled) {
        // Clean up a legacy disabled row without touching a concurrent
        // re-enable: the predicate below only matches enabled=false.
        await this.updateState(
          { userId, enabled: false },
          {
            otpCodeHash: null,
            otpExpiresAt: null,
            otpUsed: false,
          },
        );
        throw new BadRequestException('2FA is not enabled');
      }

      throw new ConflictException('2FA state changed concurrently');
    }

    return code;
  }

  async verifyOtp(userId: string, code: string): Promise<void> {
    const state = await this.findState(userId);
    if (!state?.otpCodeHash || !state.otpExpiresAt) {
      throw new UnauthorizedException('No OTP issued');
    }
    if (!state.enabled) {
      throw new UnauthorizedException('2FA is not enabled');
    }
    if (state.otpUsed) {
      throw new UnauthorizedException('OTP already used');
    }

    const nowTimestamp = Date.now();
    const now = new Date(nowTimestamp);
    if (state.otpExpiresAt.getTime() <= nowTimestamp) {
      await this.clearOtpIfCurrent(userId, {
        otpCodeHash: state.otpCodeHash,
        otpExpiresAt: state.otpExpiresAt,
        otpUsed: state.otpUsed,
      });
      throw new UnauthorizedException('OTP expired');
    }

    const otpCodeHash = this.hashOtp(code);
    if (!this.hashesMatch(state.otpCodeHash, otpCodeHash)) {
      throw new BadRequestException('Invalid OTP');
    }

    // The complete predicate is evaluated in one SQL UPDATE. A concurrent
    // disable, replacement, expiry, or second verifier therefore cannot make
    // a stale read succeed.
    const result = await this.updateState(
      {
        userId,
        enabled: true,
        otpCodeHash,
        otpUsed: false,
        otpExpiresAt: MoreThan(now),
      },
      { otpUsed: true },
    );

    if (result?.affected !== 1) {
      const current = await this.findState(userId);
      if (!current?.otpCodeHash || !current.otpExpiresAt) {
        throw new UnauthorizedException('No OTP issued');
      }
      if (!current.enabled) {
        throw new UnauthorizedException('2FA is not enabled');
      }
      if (current.otpUsed) {
        throw new UnauthorizedException('OTP already used');
      }
      if (current.otpExpiresAt.getTime() <= Date.now()) {
        await this.clearOtpIfCurrent(userId, {
          otpCodeHash: current.otpCodeHash,
          otpExpiresAt: current.otpExpiresAt,
          otpUsed: current.otpUsed,
        });
        throw new UnauthorizedException('OTP expired');
      }
      throw new BadRequestException('Invalid OTP');
    }
  }

  private async findState(userId: string): Promise<TwoFactorOtp | null> {
    return this.otpRepo.findOne({ where: { userId } });
  }

  private hashOtp(code: string): string {
    return createHash('sha256').update(code, 'utf8').digest('hex');
  }

  private hashesMatch(storedHash: string, suppliedHash: string): boolean {
    if (
      storedHash.length !== OTP_HASH_LENGTH ||
      suppliedHash.length !== OTP_HASH_LENGTH ||
      !/^[0-9a-f]{64}$/i.test(storedHash) ||
      !/^[0-9a-f]{64}$/i.test(suppliedHash)
    ) {
      return false;
    }

    return timingSafeEqual(
      Buffer.from(storedHash, 'hex'),
      Buffer.from(suppliedHash, 'hex'),
    );
  }

  private async writeState(userId: string, state: OtpState): Promise<void> {
    const values = { userId, ...state } as Parameters<
      Repository<TwoFactorOtp>['upsert']
    >[0];

    await this.otpRepo.upsert(values, ['userId']);
  }

  private async updateState(
    criteria: OtpCriteria,
    patch: OtpPatch,
  ): Promise<{ affected?: number }> {
    return this.otpRepo.update(criteria, patch);
  }

  private async clearOtpIfCurrent(
    userId: string,
    expected: {
      otpCodeHash: string;
      otpExpiresAt: Date;
      otpUsed: boolean;
    },
  ): Promise<void> {
    await this.updateState(
      {
        userId,
        enabled: true,
        otpCodeHash: expected.otpCodeHash,
        otpExpiresAt: expected.otpExpiresAt,
        otpUsed: expected.otpUsed,
      },
      {
        otpCodeHash: null,
        otpExpiresAt: null,
        otpUsed: false,
      },
    );
  }
}
