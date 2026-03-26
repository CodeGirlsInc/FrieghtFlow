import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
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
    isEmailVerified: false,
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

type MockRepo = Partial<Record<keyof Repository<User>, jest.Mock>>;

function mockRepository(): MockRepo {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
    count: jest.fn(),
  };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('UsersService', () => {
  let service: UsersService;
  let repo: MockRepo;

  beforeEach(async () => {
    repo = mockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('hashes the password and saves a new user', async () => {
      repo.findOne!.mockResolvedValue(null); // no duplicate
      const user = makeUser();
      repo.create!.mockReturnValue(user);
      repo.save!.mockResolvedValue(user);

      const result = await service.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.SHIPPER,
      });

      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' }),
      );
      expect(repo.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });

    it('throws ConflictException when email already exists', async () => {
      repo.findOne!.mockResolvedValue(makeUser());

      await expect(
        service.create({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('returns a user by id', async () => {
      const user = makeUser();
      repo.findOne!.mockResolvedValue(user);

      const result = await service.findOne('user-uuid-1');
      expect(result).toEqual(user);
    });

    it('throws NotFoundException when user does not exist', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── findByEmail ────────────────────────────────────────────────────────────

  describe('findByEmail()', () => {
    it('uses QueryBuilder to include select:false columns', async () => {
      const user = makeUser({ passwordHash: 'hash', refreshToken: 'rt' });
      const qb = {
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(user),
      };
      repo.createQueryBuilder!.mockReturnValue(qb);

      const result = await service.findByEmail('test@example.com');

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(qb.addSelect).toHaveBeenCalledWith('user.passwordHash');
      expect(qb.addSelect).toHaveBeenCalledWith('user.refreshToken');
      expect(result).toEqual(user);
    });
  });

  // ── verifyPassword ─────────────────────────────────────────────────────────

  describe('verifyPassword()', () => {
    it('returns true for a matching password', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      const result = await service.verifyPassword('correct-password', hash);
      expect(result).toBe(true);
    });

    it('returns false for a wrong password', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      const result = await service.verifyPassword('wrong-password', hash);
      expect(result).toBe(false);
    });
  });

  // ── updateRefreshToken ─────────────────────────────────────────────────────

  describe('updateRefreshToken()', () => {
    it('hashes the token before storing', async () => {
      repo.update!.mockResolvedValue(undefined);

      await service.updateRefreshToken('user-uuid-1', 'raw-refresh-token');

      expect(repo.update).toHaveBeenCalledWith(
        'user-uuid-1',
        expect.objectContaining({ refreshToken: expect.any(String) }),
      );
      // The stored value should NOT be the raw token
      const stored = repo.update!.mock.calls[0][1].refreshToken as string;
      expect(stored).not.toBe('raw-refresh-token');
    });

    it('stores null when token is null (logout)', async () => {
      repo.update!.mockResolvedValue(undefined);
      await service.updateRefreshToken('user-uuid-1', null);
      expect(repo.update).toHaveBeenCalledWith('user-uuid-1', { refreshToken: null });
    });
  });

  // ── setResetToken / clearResetToken ────────────────────────────────────────

  describe('setResetToken()', () => {
    it('stores the token and expiry', async () => {
      repo.update!.mockResolvedValue(undefined);
      const expiry = new Date(Date.now() + 3600_000);

      await service.setResetToken('user-uuid-1', 'reset-token', expiry);

      expect(repo.update).toHaveBeenCalledWith('user-uuid-1', {
        resetPasswordToken: 'reset-token',
        resetPasswordExpiry: expiry,
      });
    });
  });

  describe('clearResetToken()', () => {
    it('nullifies token and expiry', async () => {
      repo.update!.mockResolvedValue(undefined);

      await service.clearResetToken('user-uuid-1');

      expect(repo.update).toHaveBeenCalledWith('user-uuid-1', {
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      });
    });
  });

  // ── markEmailVerified ──────────────────────────────────────────────────────

  describe('markEmailVerified()', () => {
    it('marks user as verified and clears token', async () => {
      repo.update!.mockResolvedValue(undefined);

      await service.markEmailVerified('user-uuid-1');

      expect(repo.update).toHaveBeenCalledWith('user-uuid-1', {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      });
    });
  });

  // ── remove ─────────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('finds and removes the user', async () => {
      const user = makeUser();
      repo.findOne!.mockResolvedValue(user);
      repo.remove!.mockResolvedValue(user);

      await service.remove('user-uuid-1');

      expect(repo.remove).toHaveBeenCalledWith(user);
    });

    it('throws NotFoundException when user does not exist', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
    });
  });
});
