import { Module, BadRequestException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { memoryStorage } from 'multer';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document } from './entities/document.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { UploadCleanupInterceptor } from './upload-cleanup.interceptor';
import { CarrierCertification } from '../carriers/entities/carrier-certification.entity';
import { isSupportedDocumentMimeType } from './document-file.util';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Shipment, CarrierCertification]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (_config: ConfigService) => ({
        // Keep bytes in memory until the service has validated the DTO and
        // verified the file signature. This prevents rejected uploads from
        // leaving files on disk before controller/ValidationPipe failures.
        storage: memoryStorage(),
        fileFilter: (_req, file, callback) => {
          if (!isSupportedDocumentMimeType(file.mimetype)) {
            callback(
              new BadRequestException(
                `Unsupported file type: ${file.mimetype}`,
              ),
              false,
            );
            return;
          }
          callback(null, true);
        },
        limits: { fileSize: MAX_FILE_SIZE },
      }),
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, UploadCleanupInterceptor],
  exports: [DocumentsService],
})
export class DocumentsModule {}
