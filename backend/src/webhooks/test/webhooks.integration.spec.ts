import { Test, type TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as request from 'supertest';
import { WebhooksModule } from '../webhooks.module';
import { WebhookEvent } from '../entities/webhook-event.entity';
import { WebhookEventListener } from '../listeners/webhook-event.listener';
import * as crypto from 'crypto';

describe('WebhooksModule (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [WebhookEvent],
          synchronize: true,
        }),
        EventEmitterModule.forRoot(),
        WebhooksModule,
      ],
      providers: [WebhookEventListener],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Webhook Processing', () => {
    it('should process a GitHub webhook', async () => {
      const payload = { ref: 'refs/heads/main', commits: [] };
      const headers = {
        'x-github-event': 'push',
        'x-github-delivery': '12345-67890',
        'content-type': 'application/json',
      };

      const response = await request(app.getHttpServer())
        .post('/webhook/github')
        .set(headers)
        .send(payload)
        .expect(200);

      expect(response.body).toMatchObject({
        success: expect.any(Boolean),
        eventId: expect.any(String),
      });
    });

    it('should process a generic webhook', async () => {
      const payload = { event_type: 'user.created', user_id: '123' };
      const headers = {
        'x-event-type': 'user.created',
        'x-event-id': 'event-123',
        'content-type': 'application/json',
      };

      const response = await request(app.getHttpServer())
        .post('/webhook/generic')
        .set(headers)
        .send(payload)
        .expect(200);

      expect(response.body).toMatchObject({
        success: expect.any(Boolean),
        eventId: expect.any(String),
      });
    });

    it('should reject webhook from unknown source', async () => {
      const payload = { test: 'data' };

      await request(app.getHttpServer())
        .post('/webhook/unknown-source')
        .send(payload)
        .expect(400);
    });

    it('should handle malformed JSON', async () => {
      await request(app.getHttpServer())
        .post('/webhook/github')
        .set('content-type', 'application/json')
        .send('invalid-json')
        .expect(400);
    });
  });

  describe('Webhook Events API', () => {
    let webhookEventId: string;

    beforeAll(async () => {
      // Create a test webhook event
      const payload = { test: 'data' };
      const response = await request(app.getHttpServer())
        .post('/webhook/generic')
        .set({
          'x-event-type': 'test.event',
          'x-event-id': 'test-123',
        })
        .send(payload);

      webhookEventId = response.body.eventId;
    });

    it('should get all webhook events', async () => {
      const response = await request(app.getHttpServer())
        .get('/webhook/events')
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.any(Array),
        total: expect.any(Number),
        page: 1,
        limit: 50,
        totalPages: expect.any(Number),
      });
    });

    it('should filter webhook events by source', async () => {
      const response = await request(app.getHttpServer())
        .get('/webhook/events?source=generic')
        .expect(200);

      expect(response.body.data).toBeDefined();
      response.body.data.forEach((event: any) => {
        expect(event.source).toBe('generic');
      });
    });

    it('should get a specific webhook event', async () => {
      const response = await request(app.getHttpServer())
        .get(`/webhook/events/${webhookEventId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: webhookEventId,
        source: 'generic',
        eventType: 'test.event',
        payload: { test: 'data' },
      });
    });

    it('should return 400 for non-existent webhook event', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';
      await request(app.getHttpServer())
        .get(`/webhook/events/${nonExistentId}`)
        .expect(400);
    });

    it('should get webhook statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/webhook/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        totalEvents: expect.any(Number),
        successfulEvents: expect.any(Number),
        failedEvents: expect.any(Number),
        pendingEvents: expect.any(Number),
        eventsBySource: expect.any(Array),
        recentActivity: expect.any(String),
      });
    });

    it('should paginate webhook events', async () => {
      // Create multiple events first
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/webhook/generic')
          .set({
            'x-event-type': `test.event.${i}`,
            'x-event-id': `test-${i}`,
          })
          .send({ index: i });
      }

      const response = await request(app.getHttpServer())
        .get('/webhook/events?page=1&limit=3')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(3);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(3);
    });
  });

  describe('Webhook Signature Validation', () => {
    it('should validate GitHub webhook signature', async () => {
      const payload = { ref: 'refs/heads/main' };
      const secret = 'test-secret';
      const payloadString = JSON.stringify(payload);
      const signature = `sha256=${crypto.createHmac('sha256', secret).update(payloadString, 'utf8').digest('hex')}`;

      // Mock the environment variable
      process.env.GITHUB_WEBHOOK_SECRET = secret;

      const response = await request(app.getHttpServer())
        .post('/webhook/github')
        .set({
          'x-github-event': 'push',
          'x-github-delivery': 'test-delivery',
          'x-hub-signature-256': signature,
        })
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject GitHub webhook with invalid signature', async () => {
      const payload = { ref: 'refs/heads/main' };
      process.env.GITHUB_WEBHOOK_SECRET = 'test-secret';

      const response = await request(app.getHttpServer())
        .post('/webhook/github')
        .set({
          'x-github-event': 'push',
          'x-github-delivery': 'test-delivery',
          'x-hub-signature-256': 'sha256=invalid-signature',
        })
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Event Filtering', () => {
    it('should filter events by date range', async () => {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      const response = await request(app.getHttpServer())
        .get(
          `/webhook/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        )
        .expect(200);

      expect(response.body.data).toBeDefined();
      response.body.data.forEach((event: any) => {
        const eventDate = new Date(event.createdAt);
        expect(eventDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(eventDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    it('should filter events by event type', async () => {
      // Create a specific event type
      await request(app.getHttpServer())
        .post('/webhook/generic')
        .set({
          'x-event-type': 'user.deleted',
          'x-event-id': 'delete-test',
        })
        .send({ user_id: '123' });

      const response = await request(app.getHttpServer())
        .get('/webhook/events?eventType=user.deleted')
        .expect(200);

      expect(response.body.data).toBeDefined();
      response.body.data.forEach((event: any) => {
        expect(event.eventType).toBe('user.deleted');
      });
    });
  });
});
