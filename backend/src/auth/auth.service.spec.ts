import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/role.enum';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-uuid-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
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
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let mailerService: jest.Mocked<MailerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findByEmail: jest.fn(),
            findByVerificationToken: jest.fn(),
            findByResetToken: jest.fn(),
            update: jest.fn(),
            updateRefreshToken: jest.fn(),
            updateVerificationToken: jest.fn(),
            markEmailVerified: jest.fn(),
            setResetToken: jest.fn(),
            clearResetToken: jest.fn(),
            verifyPassword: jest.fn(),
          } as Partial<UsersService>,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultVal?: unknown) => {
              const map: Record<string, unknown> = {
                JWT_SECRET: 'test-secret-at-least-32-chars-long!!',
                JWT_EXPIRES_IN: '15m',
                JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-32!!',
                JWT_REFRESH_EXPIRES_IN: '7d',
                FRONTEND_URL: 'http://localhost:3000',
              };
              return map[key] ?? defaultVal;
            }),
          },
        },
        {
          provide: MailerService,
          useValue: { sendMail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    mailerService = module.get(MailerService);
  });

  // ── register ───────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('creates user, sends verification email, returns tokens', async () => {
      const user = makeUser();
      usersService.create.mockResolvedValue(user);
      usersService.updateVerificationToken.mockResolvedValue(undefined);
      usersService.updateRefreshToken.mockResolvedValue(undefined);
      mailerService.sendMail.mockResolvedValue(undefined as never);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.SHIPPER,
      });

      expect(usersService.create).toHaveBeenCalled();
      expect(usersService.updateVerificationToken).toHaveBeenCalled();
      expect(mailerService.sendMail).toHaveBeenCalled();
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user).not.toHaveProperty('refreshToken');
    });

    it('still returns tokens even if verification email fails', async () => {
      const user = makeUser();
      usersService.create.mockResolvedValue(user);
      usersService.updateVerificationToken.mockResolvedValue(undefined);
      usersService.updateRefreshToken.mockResolvedValue(undefined);
      mailerService.sendMail.mockRejectedValue(new Error('SMTP error'));
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.SHIPPER,
      });

      expect(result.accessToken).toBe('access-token');
    });
  });

  // ── login ──────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('generates tokens for an active user', async () => {
      const user = makeUser();
      usersService.updateRefreshToken.mockResolvedValue(undefined);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login(user);

      expect(result.accessToken).toBe('access-token');
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        user.id,
        'refresh-token',
      );
    });

    it('throws UnauthorizedException for inactive users', async () => {
      const user = makeUser({ isActive: false });
      await expect(service.login(user)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── refresh ────────────────────────────────────────────────────────────────

  describe('refresh()', () => {
    it('issues new tokens when refresh token is valid', async () => {
      const rawToken = 'raw-refresh-token';
      const hashedToken = await bcrypt.hash(rawToken, 10);
      const user = makeUser({ refreshToken: hashedToken });

      usersService.findOne.mockResolvedValue(user);
      usersService.findByEmail.mockResolvedValue(user);
      usersService.updateRefreshToken.mockResolvedValue(undefined);
      jwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await service.refresh(user.id, rawToken);

      expect(result.accessToken).toBe('new-access-token');
    });

    it('throws UnauthorizedException when refresh token does not match', async () => {
      const hashedToken = await bcrypt.hash('correct-token', 10);
      const user = makeUser({ refreshToken: hashedToken });

      usersService.findOne.mockResolvedValue(user);
      usersService.findByEmail.mockResolvedValue(user);

      await expect(service.refresh(user.id, 'wrong-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when user has no refresh token stored', async () => {
      const user = makeUser({ refreshToken: null });

      usersService.findOne.mockResolvedValue(user);
      usersService.findByEmail.mockResolvedValue(user);

      await expect(service.refresh(user.id, 'any-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ── logout ─────────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('clears the refresh token', async () => {
      usersService.updateRefreshToken.mockResolvedValue(undefined);

      await service.logout('user-uuid-1');

      expect(usersService.updateRefreshToken).toHaveBeenCalledWith('user-uuid-1', null);
    });
  });

  // ── verifyEmail ────────────────────────────────────────────────────────────

  describe('verifyEmail()', () => {
    it('marks email verified when token is valid', async () => {
      const expiry = new Date(Date.now() + 3600_000); // future
      const user = makeUser({ verificationToken: 'valid-token', verificationTokenExpiry: expiry });
      usersService.findByVerificationToken.mockResolvedValue(user);
      usersService.markEmailVerified.mockResolvedValue(undefined);

      const result = await service.verifyEmail('valid-token');

      expect(usersService.markEmailVerified).toHaveBeenCalledWith(user.id);
      expect(result.message).toMatch(/verified/i);
    });

    it('throws BadRequestException when token not found', async () => {
      usersService.findByVerificationToken.mockResolvedValue(null);
      await expect(service.verifyEmail('bad-token')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when token has expired', async () => {
      const expiry = new Date(Date.now() - 1000); // past
      const user = makeUser({ verificationToken: 'expired-token', verificationTokenExpiry: expiry });
      usersService.findByVerificationToken.mockResolvedValue(user);

      await expect(service.verifyEmail('expired-token')).rejects.toThrow(BadRequestException);
    });
  });

  // ── forgotPassword ─────────────────────────────────────────────────────────

  describe('forgotPassword()', () => {
    it('sets a reset token and sends email when user exists', async () => {
      const user = makeUser();
      usersService.findByEmail.mockResolvedValue(user);
      usersService.setResetToken.mockResolvedValue(undefined);
      mailerService.sendMail.mockResolvedValue(undefined as never);

      const result = await service.forgotPassword('test@example.com');

      expect(usersService.setResetToken).toHaveBeenCalled();
      expect(mailerService.sendMail).toHaveBeenCalled();
      expect(result.message).toBeDefined();
    });

    it('returns the same generic message even when user does not exist (anti-enumeration)', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword('nobody@example.com');

      expect(usersService.setResetToken).not.toHaveBeenCalled();
      expect(result.message).toBeDefined();
    });

    it('still returns success message when email sending fails', async () => {
      const user = makeUser();
      usersService.findByEmail.mockResolvedValue(user);
      usersService.setResetToken.mockResolvedValue(undefined);
      mailerService.sendMail.mockRejectedValue(new Error('SMTP error'));

      const result = await service.forgotPassword('test@example.com');

      expect(result.message).toBeDefined();
    });
  });

  // ── resetPassword ──────────────────────────────────────────────────────────

  describe('resetPassword()', () => {
    it('updates password, clears token, invalidates sessions', async () => {
      const expiry = new Date(Date.now() + 3600_000);
      const user = makeUser({ resetPasswordToken: 'valid-token', resetPasswordExpiry: expiry });
      usersService.findByResetToken.mockResolvedValue(user);
      usersService.update.mockResolvedValue(user);
      usersService.clearResetToken.mockResolvedValue(undefined);
      usersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.resetPassword('valid-token', 'NewPassword123!');

      expect(usersService.update).toHaveBeenCalledWith(user.id, { password: 'NewPassword123!' });
      expect(usersService.clearResetToken).toHaveBeenCalledWith(user.id);
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(user.id, null);
      expect(result.message).toMatch(/reset/i);
    });

    it('throws BadRequestException when token is not found', async () => {
      usersService.findByResetToken.mockResolvedValue(null);
      await expect(service.resetPassword('bad-token', 'pass')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when reset token has expired', async () => {
      const expiry = new Date(Date.now() - 1000); // past
      const user = makeUser({ resetPasswordToken: 'expired-token', resetPasswordExpiry: expiry });
      usersService.findByResetToken.mockResolvedValue(user);

      await expect(service.resetPassword('expired-token', 'pass')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── validateUser ───────────────────────────────────────────────────────────

  describe('validateUser()', () => {
    it('returns the user when credentials are valid', async () => {
      const user = makeUser({ passwordHash: 'hashed' });
      usersService.findByEmail.mockResolvedValue(user);
      usersService.verifyPassword.mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual(user);
    });

    it('returns null when user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const result = await service.validateUser('nobody@example.com', 'password');
      expect(result).toBeNull();
    });

    it('returns null when password does not match', async () => {
      const user = makeUser({ passwordHash: 'hashed' });
      usersService.findByEmail.mockResolvedValue(user);
      usersService.verifyPassword.mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong-pass');
      expect(result).toBeNull();
    });
  });
});
