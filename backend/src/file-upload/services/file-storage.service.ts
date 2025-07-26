import { Injectable, Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { UPLOAD_CONFIG } from '../config/upload.config';
import type { Express } from 'express';

export interface StorageResult {
  filePath: string;
  fileName: string;
  checksum: string;
  s3Key?: string;
  s3Bucket?: string;
}

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly useS3: boolean;

  constructor(private configService: ConfigService) {
    this.useS3 = this.configService.get<boolean>('USE_S3_STORAGE', false);
  }

  async storeFile(
    file: Express.Multer.File,
    documentType: string,
    userId?: string,
  ): Promise<StorageResult> {
    const checksum = this.generateChecksum(file.buffer);
    const fileName = this.generateFileName(
      file.originalname,
      documentType,
      userId,
    );

    if (this.useS3) {
      return this.storeInS3(file, fileName, checksum);
    } else {
      return this.storeLocally(file, fileName, checksum);
    }
  }

  private async storeLocally(
    file: Express.Multer.File,
    fileName: string,
    checksum: string,
  ): Promise<StorageResult> {
    try {
      // Ensure upload directory exists
      await fs.mkdir(UPLOAD_CONFIG.LOCAL_UPLOAD_DIR, { recursive: true });

      const filePath = path.join(UPLOAD_CONFIG.LOCAL_UPLOAD_DIR, fileName);
      await fs.writeFile(filePath, file.buffer);

      this.logger.log(`File stored locally: ${filePath}`);

      return {
        filePath,
        fileName,
        checksum,
      };
    } catch (error) {
      this.logger.error(
        `Failed to store file locally: ${error.message}`,
        error.stack,
      );
      throw new Error(`File storage failed: ${error.message}`);
    }
  }

  private async storeInS3(
    file: Express.Multer.File,
    fileName: string,
    checksum: string,
  ): Promise<StorageResult> {
    try {
      // Mock S3 implementation - replace with actual AWS SDK calls
      const s3Key = `${UPLOAD_CONFIG.S3_PREFIX}${fileName}`;
      const s3Bucket = UPLOAD_CONFIG.S3_BUCKET;

      // Simulate S3 upload delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // For demo purposes, also store locally as backup
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
      this.logger.error(
        `Failed to upload to S3: ${error.message}`,
        error.stack,
      );
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  async deleteFile(filePath: string, s3Key?: string): Promise<void> {
    try {
      if (this.useS3 && s3Key) {
        // Mock S3 deletion - replace with actual AWS SDK calls
        this.logger.log(`File deleted from S3: ${s3Key}`);
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

  async getFileStream(filePath: string, s3Key?: string): Promise<Buffer> {
    try {
      if (this.useS3 && s3Key) {
        // Mock S3 file retrieval - replace with actual AWS SDK calls
        // For now, fall back to local file
        const localPath = path.join(
          UPLOAD_CONFIG.LOCAL_UPLOAD_DIR,
          path.basename(filePath),
        );
        return await fs.readFile(localPath);
      }

      return await fs.readFile(filePath);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve file: ${error.message}`,
        error.stack,
      );
      throw new Error(`File retrieval failed: ${error.message}`);
    }
  }

  private generateFileName(
    originalName: string,
    documentType: string,
    userId?: string,
  ): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName).toLowerCase();
    const baseName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9]/g, '_');

    return `${documentType}_${timestamp}_${randomString}_${baseName}${extension}`;
  }

  private generateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}
