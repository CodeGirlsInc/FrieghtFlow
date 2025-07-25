import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { Repository } from 'typeorm';
import {
  type ShippingDocument,
  DocumentStatus,
} from './entities/document.entity';
import type {
  UploadDocumentDto,
  QueryDocumentsDto,
} from './dto/upload-document.dto';
import type { FileStorageService } from './services/file-storage.service';
import type { FileValidationService } from './services/file-validation.service';
import type { Express } from 'express';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(
    private documentRepository: Repository<ShippingDocument>,
    private fileStorageService: FileStorageService,
    private fileValidationService: FileValidationService,
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    uploadDto: UploadDocumentDto,
    userId?: string,
  ): Promise<ShippingDocument> {
    this.logger.log(`Starting document upload: ${file.originalname}`);

    // Validate the upload request
    const requestValidation = this.fileValidationService.validateUploadRequest(
      uploadDto,
      uploadDto.documentType,
    );
    if (!requestValidation.isValid) {
      throw new BadRequestException(
        `Validation failed: ${requestValidation.errors.join(', ')}`,
      );
    }

    // Validate the file
    const fileValidation = this.fileValidationService.validateFile(
      file,
      uploadDto.documentType,
    );
    if (!fileValidation.isValid) {
      throw new BadRequestException(
        `File validation failed: ${fileValidation.errors.join(', ')}`,
      );
    }

    try {
      // Store the file
      const storageResult = await this.fileStorageService.storeFile(
        file,
        uploadDto.documentType,
        userId,
      );

      // Create database record
      const document = this.documentRepository.create({
        originalName: file.originalname,
        fileName: storageResult.fileName,
        filePath: storageResult.filePath,
        mimeType: file.mimetype,
        fileSize: file.size,
        documentType: uploadDto.documentType,
        shipmentId: uploadDto.shipmentId,
        uploadedBy: uploadDto.uploadedBy || userId,
        description: uploadDto.description,
        checksum: storageResult.checksum,
        s3Key: storageResult.s3Key,
        s3Bucket: storageResult.s3Bucket,
        status: DocumentStatus.UPLOADED,
        metadata: {
          validationWarnings: fileValidation.warnings,
          uploadTimestamp: new Date().toISOString(),
          originalSize: file.size,
        },
      });

      const savedDocument = await this.documentRepository.save(document);

      this.logger.log(`Document uploaded successfully: ${savedDocument.id}`);
      return savedDocument;
    } catch (error) {
      this.logger.error(
        `Failed to upload document: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  async findAll(
    queryDto: QueryDocumentsDto,
  ): Promise<{ documents: ShippingDocument[]; total: number }> {
    const { documentType, shipmentId, uploadedBy, limit, offset } = queryDto;

    const queryBuilder = this.documentRepository.createQueryBuilder('document');

    if (documentType) {
      queryBuilder.andWhere('document.documentType = :documentType', {
        documentType,
      });
    }

    if (shipmentId) {
      queryBuilder.andWhere('document.shipmentId = :shipmentId', {
        shipmentId,
      });
    }

    if (uploadedBy) {
      queryBuilder.andWhere('document.uploadedBy = :uploadedBy', {
        uploadedBy,
      });
    }

    queryBuilder.orderBy('document.createdAt', 'DESC').skip(offset).take(limit);

    const [documents, total] = await queryBuilder.getManyAndCount();

    return { documents, total };
  }

  async findOne(id: string): Promise<ShippingDocument> {
    const document = await this.documentRepository.findOne({ where: { id } });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async downloadDocument(
    id: string,
  ): Promise<{ buffer: Buffer; document: ShippingDocument }> {
    const document = await this.findOne(id);

    try {
      const buffer = await this.fileStorageService.getFileStream(
        document.filePath,
        document.s3Key,
      );
      return { buffer, document };
    } catch (error) {
      this.logger.error(
        `Failed to download document ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Download failed: ${error.message}`);
    }
  }

  async deleteDocument(id: string): Promise<void> {
    const document = await this.findOne(id);

    try {
      // Delete file from storage
      await this.fileStorageService.deleteFile(
        document.filePath,
        document.s3Key,
      );

      // Delete database record
      await this.documentRepository.remove(document);

      this.logger.log(`Document deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete document ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }

  async updateDocumentStatus(
    id: string,
    status: DocumentStatus,
  ): Promise<ShippingDocument> {
    const document = await this.findOne(id);

    document.status = status;
    document.updatedAt = new Date();

    return this.documentRepository.save(document);
  }

  async getDocumentsByShipment(
    shipmentId: string,
  ): Promise<ShippingDocument[]> {
    return this.documentRepository.find({
      where: { shipmentId },
      order: { createdAt: 'DESC' },
    });
  }

  async getDocumentStats(): Promise<any> {
    const stats = await this.documentRepository
      .createQueryBuilder('document')
      .select([
        'document.documentType as documentType',
        'document.status as status',
        'COUNT(*) as count',
        'SUM(document.fileSize) as totalSize',
      ])
      .groupBy('document.documentType, document.status')
      .getRawMany();

    return stats;
  }
}
