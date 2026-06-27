import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { MailService } from '../mailer/mail.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash' | 'refreshToken'>;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const isMatch = await this.usersService.verifyPassword(
      password,
      user.passwordHash,
    );
    if (!isMatch) return null;
    return user;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role: registerDto.role,
    });

    const verificationToken = uuidv4();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.usersService.updateVerificationToken(
      user.id,
      verificationToken,
      expiry,
    );

    try {
      await this.sendVerificationEmail(user, verificationToken);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Failed to send verification email to ${user.email}: ${message}`,
      );
    }

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return this.buildAuthResponse(user, tokens);
  }

  async login(user: User): Promise<AuthResponse> {
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }
    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return this.buildAuthResponse(user, tokens);
  }

  async refresh(
    userId: string,
    rawRefreshToken: string,
  ): Promise<AuthResponse> {
    const baseUser = await this.usersService.findOne(userId);
    if (!baseUser) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.usersService.findByEmail(baseUser.email);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await bcrypt.compare(rawRefreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return this.buildAuthResponse(user, tokens);
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }
    if (
      !user.verificationTokenExpiry ||
      user.verificationTokenExpiry < new Date()
    ) {
      throw new BadRequestException('Verification token has expired');
    }
    await this.usersService.markEmailVerified(user.id);
    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    // Always return the same message to avoid email enumeration
    if (!user) {
      return {
        message: 'If that email is registered, a reset link has been sent.',
      };
    }

    const resetToken = uuidv4();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await this.usersService.setResetToken(user.id, resetToken, expiry);

    try {
      await this.sendPasswordResetEmail(user, resetToken);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Failed to send password reset email to ${user.email}: ${message}`,
      );
    }

    return {
      message: 'If that email is registered, a reset link has been sent.',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByResetToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    if (!user.resetPasswordExpiry || user.resetPasswordExpiry < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    await this.usersService.update(user.id, { password: newPassword });
    await this.usersService.clearResetToken(user.id);
    // Invalidate any existing sessions
    await this.usersService.updateRefreshToken(user.id, null);

    return {
      message:
        'Password reset successfully. Please log in with your new password.',
    };
  }

  async updateProfile(
    userId: string,
    dto: { firstName?: string; lastName?: string; walletAddress?: string },
  ): Promise<Omit<User, 'passwordHash' | 'refreshToken'>> {
    await this.usersService.update(userId, dto);
    const updated = await this.usersService.findOne(userId);
    const { passwordHash: _ph, refreshToken: _rt, ...safeUser } = updated;
    return safeUser;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(
      (await this.usersService.findOne(userId)).email,
    );
    if (!user) throw new UnauthorizedException('User not found');

    const isValid = await this.usersService.verifyPassword(
      currentPassword,
      user.passwordHash,
    );
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.usersService.update(userId, { password: newPassword });
    // Invalidate all existing sessions so other devices are logged out
    await this.usersService.updateRefreshToken(userId, null);

    return { message: 'Password changed successfully. Please log in again.' };
  }

  async sendPasswordResetEmail(user: User, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    await this.mailService.send(
      user.email,
      'Reset your FreightFlow password',
      'password-reset',
      {
        recipientName: `${user.firstName} ${user.lastName}`,
        ctaUrl: `${frontendUrl}/reset-password?token=${token}`,
        ctaLabel: 'Reset Password',
      },
    );
  }

  async sendVerificationEmail(user: User, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    await this.mailService.send(
      user.email,
      'Verify your FreightFlow account',
      'email-verification',
      {
        recipientName: `${user.firstName} ${user.lastName}`,
        ctaUrl: `${frontendUrl}/auth/verify-email?token=${token}`,
        ctaLabel: 'Verify Email',
      },
    );
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_EXPIRES_IN',
          '15m',
        ) as StringValue,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
          '7d',
        ) as StringValue,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private buildAuthResponse(user: User, tokens: AuthTokens): AuthResponse {
    const { passwordHash: _ph, refreshToken: _rt, ...safeUser } = user;
    return {
      user: { ...safeUser, avatarUrl: user.avatarUrl },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
