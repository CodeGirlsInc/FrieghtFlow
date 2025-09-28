import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { DocumentManagementModule } from './document-management.module';
import { Document } from './entities/document.entity';
import { DocumentVerification } from './entities/document-verification.entity';
import { DocumentAccessLog } from './entities/document-access-log.entity';
import { DocumentType, DocumentStatus, DocumentPriority } from './entities/document.entity';

describe('Document Management (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Document, DocumentVerification, DocumentAccessLog],
          synchronize: true,
        }),
        DocumentManagementModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/documents (POST)', () => {
    it('should upload a document successfully', () => {
      const uploadData = {
        documentType: DocumentType.BILL_OF_LADING,
        shipmentId: 'shipment-123',
        description: 'Test document',
        priority: DocumentPriority.MEDIUM,
        isConfidential: false,
        isRequired: true,
        countryOfOrigin: 'US',
        countryOfDestination: 'CA',
        customsCode: 'HS1234567890',
        weight: 150.5,
        value: 5000.00,
        currency: 'USD',
        tags: ['test', 'shipping'],
      };

      return request(app.getHttpServer())
        .post('/documents/upload')
        .field('documentType', uploadData.documentType)
        .field('shipmentId', uploadData.shipmentId)
        .field('description', uploadData.description)
        .field('priority', uploadData.priority)
        .field('isConfidential', uploadData.isConfidential.toString())
        .field('isRequired', uploadData.isRequired.toString())
        .field('countryOfOrigin', uploadData.countryOfOrigin)
        .field('countryOfDestination', uploadData.countryOfDestination)
        .field('customsCode', uploadData.customsCode)
        .field('weight', uploadData.weight.toString())
        .field('value', uploadData.value.toString())
        .field('currency', uploadData.currency)
        .field('tags', uploadData.tags.join(','))
        .attach('file', Buffer.from('test file content'), 'test-document.pdf')
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.documentType).toBe(uploadData.documentType);
          expect(res.body.shipmentId).toBe(uploadData.shipmentId);
          expect(res.body.description).toBe(uploadData.description);
        });
    });

    it('should reject invalid file type', () => {
      return request(app.getHttpServer())
        .post('/documents/upload')
        .field('documentType', DocumentType.BILL_OF_LADING)
        .attach('file', Buffer.from('test file content'), 'test-document.txt')
        .expect(400);
    });

    it('should reject file without required fields', () => {
      return request(app.getHttpServer())
        .post('/documents/upload')
        .attach('file', Buffer.from('test file content'), 'test-document.pdf')
        .expect(400);
    });
  });

  describe('/documents (GET)', () => {
    it('should get all documents with pagination', () => {
      return request(app.getHttpServer())
        .get('/documents')
        .query({
          limit: 10,
          offset: 0,
          documentType: DocumentType.BILL_OF_LADING,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('documents');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.documents)).toBe(true);
        });
    });

    it('should filter documents by status', () => {
      return request(app.getHttpServer())
        .get('/documents')
        .query({
          status: DocumentStatus.UPLOADED,
          limit: 5,
        })
        .expect(200);
    });

    it('should filter documents by priority', () => {
      return request(app.getHttpServer())
        .get('/documents')
        .query({
          priority: DocumentPriority.HIGH,
          limit: 5,
        })
        .expect(200);
    });

    it('should search documents by text', () => {
      return request(app.getHttpServer())
        .get('/documents')
        .query({
          search: 'test',
          limit: 5,
        })
        .expect(200);
    });
  });

  describe('/documents/stats (GET)', () => {
    it('should get document statistics', () => {
      return request(app.getHttpServer())
        .get('/documents/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalDocuments');
          expect(res.body).toHaveProperty('totalSize');
          expect(res.body).toHaveProperty('byType');
          expect(res.body).toHaveProperty('byStatus');
          expect(res.body).toHaveProperty('byPriority');
          expect(res.body).toHaveProperty('confidentialCount');
          expect(res.body).toHaveProperty('requiredCount');
          expect(res.body).toHaveProperty('expiredCount');
        });
    });
  });

  describe('/documents/:id (GET)', () => {
    let documentId: string;

    beforeAll(async () => {
      // Create a test document first
      const response = await request(app.getHttpServer())
        .post('/documents/upload')
        .field('documentType', DocumentType.BILL_OF_LADING)
        .field('description', 'Test document for retrieval')
        .attach('file', Buffer.from('test file content'), 'test-document.pdf');

      documentId = response.body.id;
    });

    it('should get a specific document by ID', () => {
      return request(app.getHttpServer())
        .get(`/documents/${documentId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(documentId);
          expect(res.body.documentType).toBe(DocumentType.BILL_OF_LADING);
        });
    });

    it('should return 404 for non-existent document', () => {
      return request(app.getHttpServer())
        .get('/documents/non-existent-id')
        .expect(404);
    });
  });

  describe('/documents/:id/download (GET)', () => {
    let documentId: string;

    beforeAll(async () => {
      // Create a test document first
      const response = await request(app.getHttpServer())
        .post('/documents/upload')
        .field('documentType', DocumentType.BILL_OF_LADING)
        .field('description', 'Test document for download')
        .attach('file', Buffer.from('test file content'), 'test-document.pdf');

      documentId = response.body.id;
    });

    it('should download a document file', () => {
      return request(app.getHttpServer())
        .get(`/documents/${documentId}/download`)
        .expect(200)
        .expect('Content-Type', /application\/pdf/);
    });

    it('should return 404 for non-existent document download', () => {
      return request(app.getHttpServer())
        .get('/documents/non-existent-id/download')
        .expect(404);
    });
  });

  describe('/documents/:id (PUT)', () => {
    let documentId: string;

    beforeAll(async () => {
      // Create a test document first
      const response = await request(app.getHttpServer())
        .post('/documents/upload')
        .field('documentType', DocumentType.BILL_OF_LADING)
        .field('description', 'Test document for update')
        .attach('file', Buffer.from('test file content'), 'test-document.pdf');

      documentId = response.body.id;
    });

    it('should update a document successfully', () => {
      const updateData = {
        description: 'Updated description',
        priority: DocumentPriority.HIGH,
        isConfidential: true,
      };

      return request(app.getHttpServer())
        .put(`/documents/${documentId}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.description).toBe(updateData.description);
          expect(res.body.priority).toBe(updateData.priority);
          expect(res.body.isConfidential).toBe(updateData.isConfidential);
        });
    });

    it('should return 404 for non-existent document update', () => {
      return request(app.getHttpServer())
        .put('/documents/non-existent-id')
        .send({ description: 'Updated description' })
        .expect(404);
    });
  });

  describe('/documents/:id (DELETE)', () => {
    let documentId: string;

    beforeAll(async () => {
      // Create a test document first
      const response = await request(app.getHttpServer())
        .post('/documents/upload')
        .field('documentType', DocumentType.BILL_OF_LADING)
        .field('description', 'Test document for deletion')
        .attach('file', Buffer.from('test file content'), 'test-document.pdf');

      documentId = response.body.id;
    });

    it('should delete a document successfully', () => {
      return request(app.getHttpServer())
        .delete(`/documents/${documentId}`)
        .expect(200);
    });

    it('should return 404 for non-existent document deletion', () => {
      return request(app.getHttpServer())
        .delete('/documents/non-existent-id')
        .expect(404);
    });
  });

  describe('/documents/shipment/:shipmentId (GET)', () => {
    it('should get documents for a specific shipment', () => {
      return request(app.getHttpServer())
        .get('/documents/shipment/shipment-123')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/documents/:id/verify (POST)', () => {
    let documentId: string;

    beforeAll(async () => {
      // Create a test document first
      const response = await request(app.getHttpServer())
        .post('/documents/upload')
        .field('documentType', DocumentType.BILL_OF_LADING)
        .field('description', 'Test document for verification')
        .attach('file', Buffer.from('test file content'), 'test-document.pdf');

      documentId = response.body.id;
    });

    it('should create a verification for a document', () => {
      const verificationData = {
        verificationType: 'AUTOMATIC',
        verificationNotes: 'Test verification',
      };

      return request(app.getHttpServer())
        .post(`/documents/${documentId}/verify`)
        .send(verificationData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.verificationType).toBe(verificationData.verificationType);
          expect(res.body.verificationNotes).toBe(verificationData.verificationNotes);
        });
    });

    it('should return 404 for non-existent document verification', () => {
      return request(app.getHttpServer())
        .post('/documents/non-existent-id/verify')
        .send({ verificationType: 'AUTOMATIC' })
        .expect(404);
    });
  });

  describe('/documents/:id/access-logs (GET)', () => {
    let documentId: string;

    beforeAll(async () => {
      // Create a test document first
      const response = await request(app.getHttpServer())
        .post('/documents/upload')
        .field('documentType', DocumentType.BILL_OF_LADING)
        .field('description', 'Test document for access logs')
        .attach('file', Buffer.from('test file content'), 'test-document.pdf');

      documentId = response.body.id;

      // Access the document to generate logs
      await request(app.getHttpServer()).get(`/documents/${documentId}`);
    });

    it('should get access logs for a document', () => {
      return request(app.getHttpServer())
        .get(`/documents/${documentId}/access-logs`)
        .query({ limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/documents/search/:query (GET)', () => {
    it('should search documents by text query', () => {
      return request(app.getHttpServer())
        .get('/documents/search/test')
        .query({ limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('documents');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.documents)).toBe(true);
        });
    });
  });

  describe('/documents/expired/documents (GET)', () => {
    it('should get expired documents', () => {
      return request(app.getHttpServer())
        .get('/documents/expired/documents')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/documents/confidential/documents (GET)', () => {
    it('should get confidential documents', () => {
      return request(app.getHttpServer())
        .get('/documents/confidential/documents')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/documents/required/documents (GET)', () => {
    it('should get required documents', () => {
      return request(app.getHttpServer())
        .get('/documents/required/documents')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
