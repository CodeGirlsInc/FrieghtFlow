import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';
import * as crypto from 'node:crypto';

interface StoredOtp {
  id: string;
  userId: string;
  enabled: boolean;
  otpCodeHash: string | null;
  otpExpiresAt: Date | null;
  otpUsed: boolean;
}

type Criteria = string | Record<string, unknown>;

const isMoreThan = (
  value: unknown,
): value is { _type: 'moreThan'; _value: Date } =>
  typeof value === 'object' &&
  value !== null &&
  '_type' in value &&
  value._type === 'moreThan' &&
  '_value' in value &&
  value._value instanceof Date;

const matchesCriteria = (row: StoredOtp, criteria: Criteria): boolean => {
  if (typeof criteria === 'string') return row.userId === criteria;

  if ('userId' in criteria && criteria.userId !== row.userId) return false;
  if ('enabled' in criteria && criteria.enabled !== row.enabled) return false;
  if ('otpCodeHash' in criteria && criteria.otpCodeHash !== row.otpCodeHash) {
    return false;
  }
  if ('otpUsed' in criteria && criteria.otpUsed !== row.otpUsed) return false;
  if ('otpExpiresAt' in criteria) {
    const expected = criteria.otpExpiresAt;
    if (isMoreThan(expected)) {
      if (
        !row.otpExpiresAt ||
        row.otpExpiresAt.getTime() <= expected._value.getTime()
      ) {
        return false;
      }
    } else if (
      expected instanceof Date &&
      (!row.otpExpiresAt || row.otpExpiresAt.getTime() !== expected.getTime())
    ) {
      return false;
    }
  }

  return true;
};

const createRepository = () => {
  const rows: Record<string, StoredOtp> = {};
  const nextId = () => `otp-${Object.keys(rows).length + 1}`;
  const clone = (row: StoredOtp): StoredOtp => ({
    ...row,
    otpExpiresAt: row.otpExpiresAt
      ? new Date(row.otpExpiresAt.getTime())
      : null,
  });

  const repo = {
    findOne: jest.fn(({ where }: { where: { userId: string } }) => {
      const row = rows[where.userId];
      return row ? clone(row) : null;
    }),
    upsert: jest.fn((values: Partial<StoredOtp>) => {
      const userId = values.userId as string;
      const current = rows[userId];
      const row: StoredOtp = {
        id: current?.id ?? nextId(),
        userId,
        enabled: current?.enabled ?? false,
        otpCodeHash: current?.otpCodeHash ?? null,
        otpExpiresAt: current?.otpExpiresAt ?? null,
        otpUsed: current?.otpUsed ?? false,
        ...values,
      };
      rows[userId] = row;
      return { identifiers: [{ id: row.id }] };
    }),
    update: jest.fn((criteria: Criteria, values: Partial<StoredOtp>) => {
      const userId = typeof criteria === 'string' ? criteria : criteria.userId;
      const row = typeof userId === 'string' ? rows[userId] : undefined;
      if (!row || !matchesCriteria(row, criteria)) return { affected: 0 };
      Object.assign(row, values);
      return { affected: 1 };
    }),
    create: jest.fn((values: Partial<StoredOtp>) => values),
    save: jest.fn((values: Partial<StoredOtp>) => {
      const userId = values.userId as string;
      const current = rows[userId];
      const row: StoredOtp = {
        id: current?.id ?? nextId(),
        userId,
        enabled: current?.enabled ?? false,
        otpCodeHash: current?.otpCodeHash ?? null,
        otpExpiresAt: current?.otpExpiresAt ?? null,
        otpUsed: current?.otpUsed ?? false,
        ...values,
      };
      rows[userId] = row;
      return row;
    }),
  };

  return { repo, rows };
};

describe('TwoFactorService', () => {
  let service: TwoFactorService;
  let state: ReturnType<typeof createRepository>;

  beforeEach(() => {
    state = createRepository();
    service = new TwoFactorService(state.repo as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses the Node CSPRNG and persists only a fixed-length digest', async () => {
    const randomIntSpy = jest.spyOn(crypto, 'randomInt');
    await service.enable('user-1');

    const code = await service.generateOtp('user-1');
    const stored = state.rows['user-1'];

    expect(randomIntSpy).toHaveBeenCalledWith(100000, 1000000);
    expect(code).toMatch(/^\d{6}$/);
    expect(stored.otpCodeHash).toMatch(/^[0-9a-f]{64}$/);
    expect(stored.otpCodeHash).not.toBe(code);
  });

  it('keeps only the newest outstanding OTP for a user', async () => {
    const randomIntMock = jest.spyOn(
      crypto,
      'randomInt',
    ) as unknown as jest.Mock;
    randomIntMock.mockReturnValueOnce(111111).mockReturnValueOnce(222222);
    await service.enable('user-1');

    const firstCode = await service.generateOtp('user-1');
    const secondCode = await service.generateOtp('user-1');

    expect(firstCode).toBe('111111');
    expect(secondCode).toBe('222222');
    await expect(service.verifyOtp('user-1', firstCode)).rejects.toThrow(
      BadRequestException,
    );
    await expect(
      service.verifyOtp('user-1', secondCode),
    ).resolves.toBeUndefined();
  });

  it('does not generate or accept an OTP while 2FA is disabled', async () => {
    await service.enable('user-1');
    await service.disable('user-1');

    await expect(service.generateOtp('user-1')).rejects.toThrow(
      BadRequestException,
    );
    expect(state.rows['user-1'].otpCodeHash).toBeNull();
    expect(await service.isEnabled('user-1')).toBe(false);
  });

  it('generates, verifies, and then rejects reused OTPs', async () => {
    await service.enable('user-1');
    const code = await service.generateOtp('user-1');

    await service.verifyOtp('user-1', code);

    await expect(service.verifyOtp('user-1', code)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects invalid OTPs without consuming the outstanding digest', async () => {
    await service.enable('user-1');
    const code = await service.generateOtp('user-1');

    await expect(service.verifyOtp('user-1', '000000')).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.verifyOtp('user-1', code)).resolves.toBeUndefined();
  });

  it('expires OTPs after ten minutes and clears only the current digest', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    try {
      await service.enable('user-1');
      await service.generateOtp('user-1');
      jest.advanceTimersByTime(10 * 60 * 1000);

      await expect(service.verifyOtp('user-1', '123456')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(state.rows['user-1'].otpCodeHash).toBeNull();
      expect(state.rows['user-1'].enabled).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not let an expired verification clear a replacement OTP', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    try {
      await service.enable('user-1');
      const expiredCode = await service.generateOtp('user-1');
      jest.advanceTimersByTime(10 * 60 * 1000 + 1);
      const replacementCode = await service.generateOtp('user-1');

      await expect(service.verifyOtp('user-1', expiredCode)).rejects.toThrow(
        BadRequestException,
      );
      await expect(
        service.verifyOtp('user-1', replacementCode),
      ).resolves.toBeUndefined();
    } finally {
      jest.useRealTimers();
    }
  });

  it('allows only one concurrent verifier to consume an OTP', async () => {
    await service.enable('user-1');
    const code = await service.generateOtp('user-1');

    const results = await Promise.allSettled([
      service.verifyOtp('user-1', code),
      service.verifyOtp('user-1', code),
    ]);

    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    const rejected = results.find((result) => result.status === 'rejected');
    expect(rejected).toBeDefined();
    expect((rejected as PromiseRejectedResult).reason).toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('keeps disable as the final state when generation races with it', async () => {
    await service.enable('user-1');

    const generation = service.generateOtp('user-1');
    const disabling = service.disable('user-1');
    await expect(generation).resolves.toMatch(/^\d{6}$/);
    await disabling;

    expect(await service.isEnabled('user-1')).toBe(false);
    expect(state.rows['user-1'].otpCodeHash).toBeNull();
  });

  it('does not resurrect a live OTP when disabled generation is attempted', async () => {
    await service.enable('user-1');
    const disabling = service.disable('user-1');
    const generation = service.generateOtp('user-1');

    await disabling;
    await expect(generation).rejects.toThrow(BadRequestException);
    expect(state.rows['user-1'].otpCodeHash).toBeNull();
  });

  it('shares enabled state and OTPs across service instances', async () => {
    const stateForInstances = createRepository();
    const first = new TwoFactorService(stateForInstances.repo as never);
    const second = new TwoFactorService(stateForInstances.repo as never);

    await first.enable('user-1');
    expect(await second.isEnabled('user-1')).toBe(true);

    const code = await first.generateOtp('user-1');
    await expect(second.verifyOtp('user-1', code)).resolves.toBeUndefined();
    await expect(first.verifyOtp('user-1', code)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
