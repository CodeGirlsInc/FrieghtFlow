import {
  INestApplication,
  ValidationPipe,
  ExecutionContext,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Server } from 'node:http';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { forgotPasswordTracker } from '../common/throttler-trackers';

// ── Tracker unit tests ────────────────────────────────────────────────────────

function mockContext(email?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        body: email !== undefined ? { email } : {},
      }),
    }),
  } as ExecutionContext;
}

describe('forgotPasswordTracker', () => {
  it('keys by email only', () => {
    const key = forgotPasswordTracker(mockContext('a@b.com'));
    expect(key).toBe('fp:a@b.com');
  });

  it('normalises email to lowercase', () => {
    expect(forgotPasswordTracker(mockContext('A@B.COM'))).toBe('fp:a@b.com');
  });

  it('trims whitespace from email', () => {
    expect(forgotPasswordTracker(mockContext('  a@b.com  '))).toBe(
      'fp:a@b.com',
    );
  });

  it('produces the SAME key for the same email regardless of caller context', () => {
    const key1 = forgotPasswordTracker(mockContext('victim@test.com'));
    const key2 = forgotPasswordTracker(mockContext('victim@test.com'));
    expect(key1).toBe(key2);
  });

  it('produces DIFFERENT keys for different emails', () => {
    const key1 = forgotPasswordTracker(mockContext('alice@test.com'));
    const key2 = forgotPasswordTracker(mockContext('bob@test.com'));
    expect(key1).not.toBe(key2);
  });

  it('handles missing email gracefully', () => {
    const key = forgotPasswordTracker(mockContext());
    expect(key).toBe('fp:');
  });
});

// ── Integration tests ─────────────────────────────────────────────────────────

describe('AuthController – forgot-password rate limiting', () => {
  let app: INestApplication;
  let httpServer: Server;

  const authService = {
    forgotPassword: jest.fn().mockResolvedValue({
      message: 'If that email is registered, a reset link has been sent.',
    }),
  };

  // Recreate the app for each test so the in-memory throttle store is fresh.
  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({
          throttlers: [
            { name: 'default', ttl: 60_000, limit: 60 },
            { name: 'auth', ttl: 60_000, limit: 10 },
            {
              name: 'forgotPassword',
              ttl: 900_000,
              limit: 3,
              getTracker: (_req, context) => forgotPasswordTracker(context),
            },
          ],
        }),
      ],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
    httpServer = app.getHttpServer() as Server;
  });

  afterEach(async () => {
    authService.forgotPassword.mockClear();
    await app.close();
  });

  it('allows up to 3 forgot-password requests for the same email', async () => {
    for (let i = 0; i < 3; i++) {
      const res = await request(httpServer)
        .post('/auth/forgot-password')
        .send({ email: 'victim@example.com' })
        .expect(200);

      expect((res.body as Record<string, string>).message).toBe(
        'If that email is registered, a reset link has been sent.',
      );
    }
    expect(authService.forgotPassword).toHaveBeenCalledTimes(3);
  });

  it('blocks the 4th forgot-password request for the same email with 429', async () => {
    // Exhaust the per-email budget
    for (let i = 0; i < 3; i++) {
      await request(httpServer)
        .post('/auth/forgot-password')
        .send({ email: 'victim@example.com' })
        .expect(200);
    }

    // 4th request should be throttled
    const response = await request(httpServer)
      .post('/auth/forgot-password')
      .send({ email: 'victim@example.com' })
      .expect(429);

    expect((response.body as Record<string, string>).message).toContain(
      'Too Many Requests',
    );
    // Service should NOT have been called for the throttled request
    expect(authService.forgotPassword).toHaveBeenCalledTimes(3);
  });

  it('throttles the same email regardless of source IP diversity', async () => {
    const targetEmail = 'target@example.com';
    const ips = ['1.1.1.1', '2.2.2.2', '3.3.3.3', '4.4.4.4'];

    // Send 4 requests for the same email from DIFFERENT IPs.
    // Because the tracker keys by email only, the 4th should be blocked
    // even though each request comes from a unique IP.
    const results: number[] = [];
    for (const ip of ips) {
      const res = await request(httpServer)
        .post('/auth/forgot-password')
        .set('x-forwarded-for', ip)
        .send({ email: targetEmail });
      results.push(res.status);
    }

    // First 3 succeed, 4th is throttled
    expect(results.slice(0, 3).every((s) => s === 200)).toBe(true);
    expect(results[3]).toBe(429);
  });

  it('different emails have independent rate-limit budgets', async () => {
    // Send 3 requests for email A — exhausts A's budget
    for (let i = 0; i < 3; i++) {
      await request(httpServer)
        .post('/auth/forgot-password')
        .send({ email: 'alice@example.com' })
        .expect(200);
    }

    // Email A is now throttled
    await request(httpServer)
      .post('/auth/forgot-password')
      .send({ email: 'alice@example.com' })
      .expect(429);

    // Email B should still succeed (independent budget)
    await request(httpServer)
      .post('/auth/forgot-password')
      .send({ email: 'bob@example.com' })
      .expect(200);
  });
});
