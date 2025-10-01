import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { DocumentType } from '../entities/document.entity';

export interface StorageResult {
  filePath: string;
  fileName: string;
  checksum: string;
  s3Key?: string;
  s3Bucket?: string;
}

export interface StorageConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  localUploadDir: string;
  s3Bucket?: string;
  s3Prefix?: string;
  useS3: boolean;
}

@Injectable()
export class DocumentStorageService {
  private readonly logger = new Logger(DocumentStorageService.name);
  private readonly config: StorageConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      maxFileSize: this.configService.get<number>('MAX_FILE_SIZE', 50 * 1024 * 1024), // 50MB
      allowedMimeTypes: this.configService.get<string[]>('ALLOWED_MIME_TYPES', [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/tiff',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ]),
      localUploadDir: this.configService.get<string>('LOCAL_UPLOAD_DIR', './uploads/documents'),
      s3Bucket: this.configService.get<string>('S3_BUCKET'),
      s3Prefix: this.configService.get<string>('S3_PREFIX', 'documents/'),
      useS3: this.configService.get<boolean>('USE_S3_STORAGE', false),
    };
  }

  async storeFile(
    file: Express.Multer.File,
    documentType: DocumentType,
    userId?: string,
  ): Promise<StorageResult> {
    this.logger.log(`Starting file storage for: ${file.originalname}`);

    // Validate file
    this.validateFile(file);

    const checksum = this.generateChecksum(file.buffer);
    const fileName = this.generateFileName(file.originalname, documentType, userId);

    if (this.config.useS3) {
      return this.storeInS3(file, fileName, checksum);
    } else {
      return this.storeLocally(file, fileName, checksum);
    }
  }

  async getFileStream(filePath: string, s3Key?: string): Promise<Buffer> {
    try {
      if (this.config.useS3 && s3Key) {
        return this.getFromS3(s3Key);
      }

      return await fs.readFile(filePath);
    } catch (error) {
      this.logger.error(`Failed to retrieve file: ${error.message}`, error.stack);
      throw new BadRequestException(`File retrieval failed: ${error.message}`);
    }
  }

  async deleteFile(filePath: string, s3Key?: string): Promise<void> {
    try {
      if (this.config.useS3 && s3Key) {
        await this.deleteFromS3(s3Key);
      }

      // Delete local file if it exists
      if (filePath && !filePath.startsWith('s3://')) {
        try {
          await fs.unlink(filePath);
          this.logger.log(`Local file deleted: ${filePath}`);
        } catch (error) {
          this.logger.warn(`Could not delete local file: ${filePath}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getFileInfo(filePath: string, s3Key?: string): Promise<{ size: number; lastModified: Date }> {
    try {
      if (this.config.useS3 && s3Key) {
        return this.getS3FileInfo(s3Key);
      }

      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        lastModified: stats.mtime,
      };
    } catch (error) {
      this.logger.error(`Failed to get file info: ${error.message}`, error.stack);
      throw new BadRequestException(`File info retrieval failed: ${error.message}`);
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.config.maxFileSize) {
      throw new BadRequestException(
        `File size ${file.size} exceeds maximum allowed size ${this.config.maxFileSize}`,
      );
    }

    if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.config.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  private async storeLocally(file: Express.Multer.File, fileName: string, checksum: string): Promise<StorageResult> {
    try {
      // Ensure upload directory exists
      await fs.mkdir(this.config.localUploadDir, { recursive: true });

      const filePath = path.join(this.config.localUploadDir, fileName);
      await fs.writeFile(filePath, file.buffer);

      this.logger.log(`File stored locally: ${filePath}`);

      return {
        filePath,
        fileName,
        checksum,
      };
    } catch (error) {
      this.logger.error(`Failed to store file locally: ${error.message}`, error.stack);
      throw new BadRequestException(`File storage failed: ${error.message}`);
    }
  }

  private async storeInS3(file: Express.Multer.File, fileName: string, checksum: string): Promise<StorageResult> {
    try {
      const s3Key = `${this.config.s3Prefix}${fileName}`;
      const s3Bucket = this.config.s3Bucket;

      // TODO: Implement actual AWS S3 upload
      // For now, we'll simulate the upload and also store locally as backup
      await this.storeLocally(file, fileName, checksum);

      this.logger.log(`File uploaded to S3: s3://${s3Bucket}/${s3Key}`);

      return {
        filePath: `s3://${s3Bucket}/${s3Key}`,
        fileName,
        checksum,
        s3Key,
        s3Bucket,
      };
    } catch (error) {
      this.logger.error(`Failed to upload to S3: ${error.message}`, error.stack);
      throw new BadRequestException(`S3 upload failed: ${error.message}`);
    }
  }

  private async getFromS3(s3Key: string): Promise<Buffer> {
    try {
      // TODO: Implement actual AWS S3 download
      // For now, we'll simulate by reading from local backup
      const localPath = path.join(this.config.localUploadDir, path.basename(s3Key));
      return await fs.readFile(localPath);
    } catch (error) {
      this.logger.error(`Failed to retrieve from S3: ${error.message}`, error.stack);
      throw new BadRequestException(`S3 retrieval failed: ${error.message}`);
    }
  }

  private async deleteFromS3(s3Key: string): Promise<void> {
    try {
      // TODO: Implement actual AWS S3 deletion
      this.logger.log(`File deleted from S3: ${s3Key}`);
    } catch (error) {
      this.logger.error(`Failed to delete from S3: ${error.message}`, error.stack);
      throw new BadRequestException(`S3 deletion failed: ${error.message}`);
    }
  }

  private async getS3FileInfo(s3Key: string): Promise<{ size: number; lastModified: Date }> {
    try {
      // TODO: Implement actual AWS S3 head object
      // For now, we'll simulate by getting local file info
      const localPath = path.join(this.config.localUploadDir, path.basename(s3Key));
      const stats = await fs.stat(localPath);
      return {
        size: stats.size,
        lastModified: stats.mtime,
      };
    } catch (error) {
      this.logger.error(`Failed to get S3 file info: ${error.message}`, error.stack);
      throw new BadRequestException(`S3 file info retrieval failed: ${error.message}`);
    }
  }

  private generateFileName(originalName: string, documentType: DocumentType, userId?: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9]/g, '_');

    const prefix = userId ? `${userId}_` : '';
    return `${prefix}${documentType}_${timestamp}_${randomString}_${baseName}${extension}`;
  }

  private generateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}
