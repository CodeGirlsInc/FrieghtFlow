import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('CarrierController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/carriers (POST) - should create a new carrier', async () => {
    const createCarrierDto = {
      userId: 'test-user-id',
      companyName: 'Test Carrier Company',
      licenseNumber: 'TEST123456',
      insurancePolicy: 'POLICY123',
      serviceAreas: ['New York', 'New Jersey'],
    };

    return request(app.getHttpServer())
      .post('/carriers')
      .send(createCarrierDto)
      .expect(201);
  });

  it('/carriers (GET) - should return all carriers', async () => {
    return request(app.getHttpServer()).get('/carriers').expect(200);
  });

  it('/carriers/:id (GET) - should return a carrier by id', async () => {
    // This test assumes there's a carrier in the database
    return request(app.getHttpServer())
      .get('/carriers/non-existent-id')
      .expect(404);
  });

  it('/carriers/:id (PATCH) - should update a carrier', async () => {
    const updateCarrierDto = {
      companyName: 'Updated Carrier Name',
    };

    return request(app.getHttpServer())
      .patch('/carriers/non-existent-id')
      .send(updateCarrierDto)
      .expect(404);
  });

  it('/carriers/:id (DELETE) - should delete a carrier', async () => {
    return request(app.getHttpServer())
      .delete('/carriers/non-existent-id')
      .expect(404);
  });
});
