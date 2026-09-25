import { BadRequestException, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document } from './entities/document.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import {
  isAllowedDocumentMimeType,
  unsupportedDocumentMimeTypeMessage,
} from './document-upload.constants';
import { UploadCleanupInterceptor } from './upload-cleanup.interceptor';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Shipment]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uploadDir = config.get<string>('UPLOAD_DIR', './uploads');
        fs.mkdirSync(uploadDir, { recursive: true });

        return {
          storage: diskStorage({
            destination: uploadDir,
            filename: (_req, file, cb) => {
              const unique = `${Date.now()}-${uuidv4()}${extname(file.originalname)}`;
              cb(null, unique);
            },
          }),
          fileFilter: (_req, file, callback) => {
            if (!isAllowedDocumentMimeType(file.mimetype)) {
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
          limits: { fileSize: MAX_FILE_SIZE },
        };
      },
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, UploadCleanupInterceptor],
  exports: [DocumentsService],
})
export class DocumentsModule {}
