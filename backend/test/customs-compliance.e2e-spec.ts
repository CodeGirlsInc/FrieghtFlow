import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomsComplianceModule } from '../src/customs/customs-complaince.module';
import { CustomsRequirement } from '../src/customs/entities/customs-requirement.entity';
import { CustomsDocument } from '../src/customs/entities/customs-document.entity';
import { ComplianceCheck } from '../src/customs/entities/compliance-check.entity';
import { Shipment } from '../src/shipment/shipment.entity';
import { ShipmentStatusHistory } from '../src/shipment/shipment-status-history.entity';

describe('Customs Compliance (e2e)', () => {
  let app: INestApplication;
  let shipmentId: string;
  let requirementId: string;
  let documentId: string;
  let checkId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Shipment, ShipmentStatusHistory, CustomsRequirement, CustomsDocument, ComplianceCheck],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Shipment, ShipmentStatusHistory]),
        CustomsComplianceModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create a shipment for testing
    const dataSource = moduleFixture.get<any>('DataSource');
    const shipmentRepo = dataSource.getRepository(Shipment);
    const created = await shipmentRepo.save(
      shipmentRepo.create({
        trackingId: 'FF-20240101-ABCDE',
        origin: 'New York, NY',
        destination: 'Toronto, ON',
        carrier: 'FedEx',
      })
    );
    shipmentId = created.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Requirements Management', () => {
    it('POST /customs-compliance/requirements creates requirement', async () => {
      const dto = {
        requirementCode: 'REQ-E2E-001',
        name: 'Commercial Invoice Required',
        description: 'Commercial invoice is mandatory for US-Canada shipments',
        type: 'document',
        originCountry: 'US',
        destinationCountry: 'CA',
        isMandatory: true,
        documentFormat: 'PDF',
        validationRules: JSON.stringify({
          maxFileSize: 10 * 1024 * 1024,
          allowedMimeTypes: ['application/pdf'],
        }),
      };

      const res = await request(app.getHttpServer())
        .post('/customs-compliance/requirements')
        .send(dto)
        .expect(201);

      requirementId = res.body.id;
      expect(res.body.requirementCode).toBe(dto.requirementCode);
      expect(res.body.isMandatory).toBe(true);
    });

    it('GET /customs-compliance/requirements returns list', async () => {
      const res = await request(app.getHttpServer())
        .get('/customs-compliance/requirements')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBeGreaterThan(0);
    });

    it('GET /customs-compliance/requirements/applicable returns route-specific requirements', async () => {
      const res = await request(app.getHttpServer())
        .get('/customs-compliance/requirements/applicable')
        .query({
          originCountry: 'US',
          destinationCountry: 'CA',
        })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Document Management', () => {
    it('POST /customs-compliance/documents uploads and validates document', async () => {
      const dto = {
        shipmentId,
        requirementId,
        documentType: 'commercial_invoice',
        fileName: 'invoice.pdf',
        fileUrl: '/uploads/invoice.pdf',
        mimeType: 'application/pdf',
        fileSize: '1MB',
        metadata: JSON.stringify({
          invoice_number: 'INV-001',
          date: '2024-01-01',
          seller: 'Test Company',
          buyer: 'Buyer Company',
          goods_description: 'Test goods',
          value: '1000.00',
        }),
      };

      const res = await request(app.getHttpServer())
        .post('/customs-compliance/documents')
        .send(dto)
        .expect(201);

      documentId = res.body.id;
      expect(res.body.documentType).toBe(dto.documentType);
      expect(res.body.shipmentId).toBe(shipmentId);
    });

    it('GET /customs-compliance/documents returns list', async () => {
      const res = await request(app.getHttpServer())
        .get('/customs-compliance/documents')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBeGreaterThan(0);
    });

    it('POST /customs-compliance/documents/:id/validate validates document', async () => {
      const res = await request(app.getHttpServer())
        .post(`/customs-compliance/documents/${documentId}/validate`)
        .expect(200);

      expect(res.body).toHaveProperty('isValid');
      expect(res.body).toHaveProperty('errors');
      expect(res.body).toHaveProperty('warnings');
    });
  });

  describe('Compliance Check Management', () => {
    it('POST /customs-compliance/checks creates compliance check', async () => {
      const dto = {
        shipmentId,
        requirementId,
        checkType: 'document_validation',
        checkName: 'Document Format Validation',
        description: 'Validates document format and completeness',
        isAutomated: true,
        isMandatory: true,
        priority: 'high',
      };

      const res = await request(app.getHttpServer())
        .post('/customs-compliance/checks')
        .send(dto)
        .expect(201);

      checkId = res.body.id;
      expect(res.body.checkType).toBe(dto.checkType);
      expect(res.body.shipmentId).toBe(shipmentId);
    });

    it('GET /customs-compliance/checks returns list', async () => {
      const res = await request(app.getHttpServer())
        .get('/customs-compliance/checks')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBeGreaterThan(0);
    });

    it('POST /customs-compliance/checks/generate/:shipmentId generates checks', async () => {
      const res = await request(app.getHttpServer())
        .post(`/customs-compliance/checks/generate/${shipmentId}`)
        .expect(201);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Compliance Validation', () => {
    it('GET /customs-compliance/compliance/:shipmentId checks compliance status', async () => {
      const res = await request(app.getHttpServer())
        .get(`/customs-compliance/compliance/${shipmentId}`)
        .expect(200);

      expect(res.body).toHaveProperty('compliant');
      expect(res.body).toHaveProperty('reasons');
      expect(Array.isArray(res.body.reasons)).toBe(true);
    });

    it('GET /customs-compliance/history/:shipmentId returns compliance history', async () => {
      const res = await request(app.getHttpServer())
        .get(`/customs-compliance/history/${shipmentId}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('CRUD Operations', () => {
    it('PATCH /customs-compliance/requirements/:id updates requirement', async () => {
      const updateDto = {
        name: 'Updated Commercial Invoice Requirement',
        description: 'Updated description',
      };

      const res = await request(app.getHttpServer())
        .patch(`/customs-compliance/requirements/${requirementId}`)
        .send(updateDto)
        .expect(200);

      expect(res.body.name).toBe(updateDto.name);
    });

    it('PATCH /customs-compliance/documents/:id updates document', async () => {
      const updateDto = {
        status: 'approved',
        reviewedBy: 'test-reviewer',
      };

      const res = await request(app.getHttpServer())
        .patch(`/customs-compliance/documents/${documentId}`)
        .send(updateDto)
        .expect(200);

      expect(res.body.status).toBe(updateDto.status);
    });

    it('PATCH /customs-compliance/checks/:id updates compliance check', async () => {
      const updateDto = {
        status: 'passed',
        performedBy: 'test-performer',
        notes: 'Check completed successfully',
      };

      const res = await request(app.getHttpServer())
        .patch(`/customs-compliance/checks/${checkId}`)
        .send(updateDto)
        .expect(200);

      expect(res.body.status).toBe(updateDto.status);
    });

    it('DELETE operations work correctly', async () => {
      await request(app.getHttpServer())
        .delete(`/customs-compliance/checks/${checkId}`)
        .expect(204);

      await request(app.getHttpServer())
        .delete(`/customs-compliance/documents/${documentId}`)
        .expect(204);

      await request(app.getHttpServer())
        .delete(`/customs-compliance/requirements/${requirementId}`)
        .expect(204);
    });
  });
});
