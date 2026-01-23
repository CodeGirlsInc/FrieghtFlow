import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from './notifications.module';
import { Notification, NotificationPreference, NotificationType } from './entities';

describe('Notifications Module (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Notification, NotificationPreference],
          synchronize: true,
          logging: false,
        }),
        NotificationModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/notifications', () => {
    it('should return notifications for user', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/notifications')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /api/v1/notifications/preferences/current', () => {
    it('should return user preferences', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/notifications/preferences/current')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('userId');
          expect(res.body).toHaveProperty('emailEnabled');
          expect(res.body).toHaveProperty('smsEnabled');
          expect(res.body).toHaveProperty('inAppEnabled');
        });
    });
  });

  describe('PATCH /api/v1/notifications/preferences/current', () => {
    it('should update user preferences', async () => {
      return request(app.getHttpServer())
        .patch('/api/v1/notifications/preferences/current')
        .send({
          emailEnabled: false,
          smsEnabled: true,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.emailEnabled).toBe(false);
          expect(res.body.smsEnabled).toBe(true);
        });
    });
  });

  describe('GET /api/v1/notifications/unread/count', () => {
    it('should return unread notification count', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/notifications/unread/count')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('unreadCount');
          expect(typeof res.body.unreadCount).toBe('number');
        });
    });
  });
});
