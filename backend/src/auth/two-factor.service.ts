import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';

interface OtpRecord {
  code: string;
  expiresAt: number;
  used: boolean;
}

@Injectable()
export class TwoFactorService {
  // In production, store in Redis or DB
  private readonly store = new Map<string, OtpRecord>();
  private readonly enabled2FA = new Set<string>();

  isEnabled(userId: string): boolean {
    return this.enabled2FA.has(userId);
  }

  enable(userId: string): void {
    this.enabled2FA.add(userId);
  }

  disable(userId: string): void {
    this.enabled2FA.delete(userId);
    this.store.delete(userId);
  }

  generateOtp(userId: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.store.set(userId, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      used: false,
    });
    return code;
  }

  verifyOtp(userId: string, code: string): void {
    const record = this.store.get(userId);

    if (!record) throw new UnauthorizedException('No OTP issued');
    if (record.used) throw new UnauthorizedException('OTP already used');
    if (Date.now() > record.expiresAt) {
      this.store.delete(userId);
      throw new UnauthorizedException('OTP expired');
    }
    if (record.code !== code) throw new BadRequestException('Invalid OTP');

    record.used = true;
  }
}
