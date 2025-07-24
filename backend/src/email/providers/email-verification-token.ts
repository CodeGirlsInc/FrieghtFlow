import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailVerificationTokenProvider {
  private readonly tokenLength = 32;
  private readonly tokenExpiryMinutes = 30;

  generateToken(): { token: string; expiresAt: Date } {
    const token = crypto.randomBytes(this.tokenLength).toString('hex');
    const expiresAt = new Date(Date.now() + this.tokenExpiryMinutes * 60 * 1000);

    return { token, expiresAt };
  }

  isTokenExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  validateToken(providedToken: string, savedToken: string, expiresAt: Date): boolean {
    return providedToken === savedToken && !this.isTokenExpired(expiresAt);
  }
}