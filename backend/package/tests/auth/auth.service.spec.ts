import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../src/mailer/mail.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let mailService: MailService;
  let userRepository: Repository<User>;

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    updateRefreshToken: jest.fn(),
    verifyPassword: jest.fn(),
    updateVerificationToken: jest.fn(),
    markEmailVerified: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockMailService = {
    send: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      const registerDto = {
        email: 'test@test.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      };
      const user = {
        id: '1',
        ...registerDto,
        passwordHash: 'hashedPassword',
        refreshToken: null,
        isActive: true,
        verificationToken: '',
        verificationTokenExpiry: new Date(),
      };

      mockUsersService.create.mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue('test-token');

      const result = await authService.register(registerDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
      expect(mockMailService.send).toHaveBeenCalled();
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        user.id,
        'test-token',
      );
      expect(result).toHaveProperty('accessToken', 'test-token');
      expect(result).toHaveProperty('refreshToken', 'test-token');
    });

    it('should throw ConflictException if email is already taken', async () => {
      const registerDto = {
        email: 'test@test.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      };
      mockUsersService.create.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for weak passwords', async () => {
      const registerDto = {
        email: 'test@test.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      };
      mockUsersService.create.mockRejectedValue(
        new BadRequestException('Password is too weak'),
      );

      await expect(authService.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should login a user and return tokens', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        passwordHash: 'hashedPassword',
        refreshToken: null,
        isActive: true,
        role: 'user',
      };
      mockJwtService.signAsync.mockResolvedValue('test-token');

      const result = await authService.login(user as any);

      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        user.id,
        'test-token',
      );
      expect(result).toHaveProperty('accessToken', 'test-token');
      expect(result).toHaveProperty('refreshToken', 'test-token');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        passwordHash: 'hashedPassword',
        refreshToken: null,
        isActive: true,
        role: 'user',
      };
      mockUsersService.verifyPassword.mockResolvedValue(false);

      await expect(
        authService.validateUser('test@test.com', 'wrongpassword'),
      ).resolves.toBeNull();
    });

    it('should throw ForbiddenException for unverified email', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        passwordHash: 'hashedPassword',
        refreshToken: null,
        isActive: false,
        role: 'user',
      };

      await expect(authService.login(user as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        passwordHash: 'hashedPassword',
        refreshToken: 'hashed-refresh-token',
        isActive: true,
        role: 'user',
      };
      mockUsersService.findOne.mockResolvedValue(user);
      mockUsersService.findByEmail.mockResolvedValue(user as any);
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('new-test-token');

      const result = await authService.refresh('1', 'raw-refresh-token');

      expect(result).toHaveProperty('accessToken', 'new-test-token');
      expect(result).toHaveProperty('refreshToken', 'new-test-token');
    });

    it('should throw UnauthorizedException for expired token', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      await expect(
        authService.refresh('1', 'raw-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for tampered token', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        passwordHash: 'hashedPassword',
        refreshToken: 'hashed-refresh-token',
        isActive: true,
        role: 'user',
      };
      mockUsersService.findOne.mockResolvedValue(user);
      mockUsersService.findByEmail.mockResolvedValue(user as any);
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

      await expect(
        authService.refresh('1', 'raw-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should clear the refresh token from the DB', async () => {
      await authService.logout('1');
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        '1',
        null,
      );
    });
  });
});
