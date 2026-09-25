import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { Server } from 'http';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

// Issue #1565 (BE-177): with JwtAuthGuard registered globally, an
// unauthenticated GET / — the liveness-probe route — returned 401 instead of
// 200 because getHello() had no @Public() decorator.
describe('AppController – GET / is exempt from the global JwtAuthGuard (BE-177)', () => {
  let app: INestApplication;
  let httpServer: Server;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        Reflector,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer() as Server;
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 200 with no Authorization header', async () => {
    const res = await request(httpServer).get('/');

    expect(res.status).toBe(200);
    expect(res.text).toBe('Hello World!');
  });
});
