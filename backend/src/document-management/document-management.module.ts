import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentStorageService } from './services/document-storage.service';
import { DocumentVerificationService } from './services/document-verification.service';
import { DocumentAccessLogService } from './services/document-access-log.service';
import { Document } from './entities/document.entity';
import { DocumentVerification } from './entities/document-verification.entity';
import { DocumentAccessLog } from './entities/document-access-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentVerification, DocumentAccessLog]),
    ConfigModule,
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/tiff',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error(`File type ${file.mimetype} not allowed`), false);
        }
      },
    }),
  ],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    DocumentStorageService,
    DocumentVerificationService,
    DocumentAccessLogService,
  ],
  exports: [
    DocumentService,
    DocumentStorageService,
    DocumentVerificationService,
    DocumentAccessLogService,
  ],
})
export class DocumentManagementModule {}
