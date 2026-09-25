import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { Server } from 'http';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController – POST /auth/refresh body validation (BE-147)', () => {
  let app: INestApplication;
  let httpServer: Server;

  const authService = {
    refresh: jest.fn().mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    }),
    // Unused route deps are provided so the controller can be instantiated.
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    verifyEmail: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    httpServer = app.getHttpServer() as Server;
  });

  afterEach(async () => {
    authService.refresh.mockClear();
    await app.close();
  });

  it('accepts a well-formed refresh body', async () => {
    const res = await request(httpServer)
      .post('/auth/refresh')
      .send({ userId: 'user-1', refreshToken: 'token-1' });

    expect(res.status).toBe(200);
    expect(authService.refresh).toHaveBeenCalledWith('user-1', 'token-1');
  });

  it('rejects a missing refreshToken with a clean 400', async () => {
    const res = await request(httpServer)
      .post('/auth/refresh')
      .send({ userId: 'user-1' });

    expect(res.status).toBe(400);
    expect(authService.refresh).not.toHaveBeenCalled();
  });

  it('rejects an empty userId with a clean 400', async () => {
    const res = await request(httpServer)
      .post('/auth/refresh')
      .send({ userId: '', refreshToken: 'token-1' });

    expect(res.status).toBe(400);
    expect(authService.refresh).not.toHaveBeenCalled();
  });

  it('forbids non-whitelisted fields in the refresh body', async () => {
    const res = await request(httpServer)
      .post('/auth/refresh')
      .send({ userId: 'user-1', refreshToken: 'token-1', admin: true });

    expect(res.status).toBe(400);
    expect(authService.refresh).not.toHaveBeenCalled();
  });
});
