import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { FileStorageService } from './services/file-storage.service';
import { FileValidationService } from './services/file-validation.service';
import { ShippingDocument } from './entities/document.entity';
import { UPLOAD_CONFIG } from './config/upload.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShippingDocument]),
    ConfigModule,
    MulterModule.register({
      limits: {
        fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
      },
      fileFilter: (req, file, callback) => {
        if (UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error(`File type ${file.mimetype} not allowed`), false);
        }
      },
    }),
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService, FileStorageService, FileValidationService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
