import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { NextFunction, Request, Response } from 'express';
import { Server } from 'node:http';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as request from 'supertest';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { UploadCleanupInterceptor } from './upload-cleanup.interceptor';
import {
  isAllowedDocumentMimeType,
  unsupportedDocumentMimeTypeMessage,
} from './document-upload.constants';
import { DocumentType } from './enums/document-type.enum';
import { UserRole } from '../common/enums/role.enum';

const shipmentId = '00000000-0000-4000-8000-000000000001';

function validMultipartFields() {
  return {
    shipmentId,
    documentType: DocumentType.INVOICE,
  };
}

describe('document upload cleanup route', () => {
  let app: INestApplication;
  let uploadDir: string;
  let service: { upload: jest.Mock };
  let rejectUnsupportedBeforeWrite = true;

  beforeEach(async () => {
    uploadDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'freightflow-documents-'),
    );
    rejectUnsupportedBeforeWrite = true;
    service = { upload: jest.fn() };

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        MulterModule.register({
          storage: diskStorage({ destination: uploadDir }),
          fileFilter: (_req, file, callback) => {
            if (
              rejectUnsupportedBeforeWrite &&
              !isAllowedDocumentMimeType(file.mimetype)
            ) {
              callback(
                new BadRequestException(
                  unsupportedDocumentMimeTypeMessage(file.mimetype),
                ),
                false,
              );
              return;
            }
            callback(null, true);
          },
        }),
      ],
      controllers: [DocumentsController],
      providers: [
        UploadCleanupInterceptor,
        { provide: DocumentsService, useValue: service },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useLogger(false);
    app.use(
      (
        req: Request & { user?: { id: string; role: UserRole } },
        _res: Response,
        next: NextFunction,
      ) => {
        req.user = { id: 'shipper-1', role: UserRole.SHIPPER };
        next();
      },
    );
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    fs.rmSync(uploadDir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('removes a written file when DTO validation fails', async () => {
    await request(app.getHttpServer() as Server)
      .post('/documents/upload')
      .field('shipmentId', 'not-a-uuid')
      .field('documentType', DocumentType.INVOICE)
      .attach('file', Buffer.from('hello'), {
        filename: 'invoice.pdf',
        contentType: 'application/pdf',
      })
      .expect(400);

    expect(fs.readdirSync(uploadDir)).toEqual([]);
    expect(service.upload).not.toHaveBeenCalled();
  });

  it('removes a written file when the document service fails', async () => {
    let uploadedPath: string | undefined;
    service.upload.mockImplementation((file: Express.Multer.File) => {
      uploadedPath = file.path;
      return Promise.reject(new Error('database unavailable'));
    });

    await request(app.getHttpServer() as Server)
      .post('/documents/upload')
      .field('shipmentId', validMultipartFields().shipmentId)
      .field('documentType', validMultipartFields().documentType)
      .attach('file', Buffer.from('hello'), {
        filename: 'invoice.pdf',
        contentType: 'application/pdf',
      })
      .expect(500);

    expect(uploadedPath).toBeDefined();
    expect(fs.existsSync(uploadedPath as string)).toBe(false);
  });

  it('cleans a file when the controller rejects an unsupported MIME type', async () => {
    rejectUnsupportedBeforeWrite = false;

    await request(app.getHttpServer() as Server)
      .post('/documents/upload')
      .field('shipmentId', validMultipartFields().shipmentId)
      .field('documentType', validMultipartFields().documentType)
      .attach('file', Buffer.from('hello'), {
        filename: 'invoice.exe',
        contentType: 'application/x-msdownload',
      })
      .expect(400);

    expect(fs.readdirSync(uploadDir)).toEqual([]);
    expect(service.upload).not.toHaveBeenCalled();
  });

  it('rejects unsupported MIME types before writing a file', async () => {
    await request(app.getHttpServer() as Server)
      .post('/documents/upload')
      .field('shipmentId', validMultipartFields().shipmentId)
      .field('documentType', validMultipartFields().documentType)
      .attach('file', Buffer.from('hello'), {
        filename: 'invoice.exe',
        contentType: 'application/x-msdownload',
      })
      .expect(400);

    expect(fs.readdirSync(uploadDir)).toEqual([]);
    expect(service.upload).not.toHaveBeenCalled();
  });
});
