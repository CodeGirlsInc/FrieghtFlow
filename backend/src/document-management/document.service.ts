import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Document, DocumentStatus, DocumentType, DocumentPriority } from './entities/document.entity';
import { DocumentVerification } from './entities/document-verification.entity';
import { DocumentAccessLog, AccessAction } from './entities/document-access-log.entity';
import { UploadDocumentDto, QueryDocumentsDto, UpdateDocumentDto } from './dto';
import { DocumentResponseDto, DocumentWithVerificationDto, DocumentStatsDto } from './dto/document-response.dto';
import { DocumentStorageService } from './services/document-storage.service';
import { DocumentVerificationService } from './services/document-verification.service';
import { DocumentAccessLogService } from './services/document-access-log.service';
import { CreateVerificationDto } from './dto/verify-document.dto';
import { Request } from 'express';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(DocumentVerification)
    private verificationRepository: Repository<DocumentVerification>,
    @InjectRepository(DocumentAccessLog)
    private accessLogRepository: Repository<DocumentAccessLog>,
    private documentStorageService: DocumentStorageService,
    private verificationService: DocumentVerificationService,
    private accessLogService: DocumentAccessLogService,
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    uploadDto: UploadDocumentDto,
    userId?: string,
    request?: Request,
  ): Promise<DocumentResponseDto> {
    this.logger.log(`Starting document upload: ${file.originalname}`);

    try {
      // Store the file
      const storageResult = await this.documentStorageService.storeFile(
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
        uploadedBy: userId,
        description: uploadDto.description,
        priority: uploadDto.priority || DocumentPriority.MEDIUM,
        isConfidential: uploadDto.isConfidential || false,
        isRequired: uploadDto.isRequired || false,
        countryOfOrigin: uploadDto.countryOfOrigin,
        countryOfDestination: uploadDto.countryOfDestination,
        customsCode: uploadDto.customsCode,
        weight: uploadDto.weight,
        value: uploadDto.value,
        currency: uploadDto.currency,
        expiryDate: uploadDto.expiryDate ? new Date(uploadDto.expiryDate) : null,
        tags: uploadDto.tags ? uploadDto.tags.join(',') : null,
        checksum: storageResult.checksum,
        s3Key: storageResult.s3Key,
        s3Bucket: storageResult.s3Bucket,
        status: DocumentStatus.UPLOADED,
        metadata: {
          ...uploadDto.metadata,
          validationWarnings: [],
          uploadTimestamp: new Date().toISOString(),
          originalSize: file.size,
        },
      });

      const savedDocument = await this.documentRepository.save(document);

      // Log access
      if (request) {
        await this.accessLogService.logAccess(
          savedDocument.id,
          AccessAction.VIEW,
          request,
          userId,
          'Document uploaded',
        );
      }

      this.logger.log(`Document uploaded successfully: ${savedDocument.id}`);
      return this.mapToResponseDto(savedDocument);
    } catch (error) {
      this.logger.error(`Failed to upload document: ${error.message}`, error.stack);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  async findAll(queryDto: QueryDocumentsDto, userId?: string): Promise<{
    documents: DocumentResponseDto[];
    total: number;
  }> {
    const {
      documentType,
      status,
      priority,
      shipmentId,
      uploadedBy,
      countryOfOrigin,
      countryOfDestination,
      customsCode,
      isConfidential,
      isRequired,
      tags,
      createdAfter,
      createdBefore,
      expiresAfter,
      expiresBefore,
      search,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.documentRepository.createQueryBuilder('document');

    // Apply filters
    if (documentType) {
      queryBuilder.andWhere('document.documentType = :documentType', { documentType });
    }

    if (status) {
      queryBuilder.andWhere('document.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('document.priority = :priority', { priority });
    }

    if (shipmentId) {
      queryBuilder.andWhere('document.shipmentId = :shipmentId', { shipmentId });
    }

    if (uploadedBy) {
      queryBuilder.andWhere('document.uploadedBy = :uploadedBy', { uploadedBy });
    }

    if (countryOfOrigin) {
      queryBuilder.andWhere('document.countryOfOrigin = :countryOfOrigin', { countryOfOrigin });
    }

    if (countryOfDestination) {
      queryBuilder.andWhere('document.countryOfDestination = :countryOfDestination', {
        countryOfDestination,
      });
    }

    if (customsCode) {
      queryBuilder.andWhere('document.customsCode = :customsCode', { customsCode });
    }

    if (isConfidential !== undefined) {
      queryBuilder.andWhere('document.isConfidential = :isConfidential', { isConfidential });
    }

    if (isRequired !== undefined) {
      queryBuilder.andWhere('document.isRequired = :isRequired', { isRequired });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('document.tags ILIKE ANY(:tags)', {
        tags: tags.map(tag => `%${tag}%`),
      });
    }

    if (createdAfter) {
      queryBuilder.andWhere('document.createdAt >= :createdAfter', {
        createdAfter: new Date(createdAfter),
      });
    }

    if (createdBefore) {
      queryBuilder.andWhere('document.createdAt <= :createdBefore', {
        createdBefore: new Date(createdBefore),
      });
    }

    if (expiresAfter) {
      queryBuilder.andWhere('document.expiryDate >= :expiresAfter', {
        expiresAfter: new Date(expiresAfter),
      });
    }

    if (expiresBefore) {
      queryBuilder.andWhere('document.expiryDate <= :expiresBefore', {
        expiresBefore: new Date(expiresBefore),
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(document.originalName ILIKE :search OR document.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    const validSortFields = ['createdAt', 'updatedAt', 'fileName', 'fileSize', 'expiryDate', 'priority'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`document.${sortField}`, sortOrder);

    // Apply pagination
    queryBuilder.skip(offset).take(limit);

    const [documents, total] = await queryBuilder.getManyAndCount();

    return {
      documents: documents.map(doc => this.mapToResponseDto(doc)),
      total,
    };
  }

  async findOne(id: string, userId?: string, request?: Request): Promise<DocumentWithVerificationDto> {
    const document = await this.documentRepository.findOne({ where: { id } });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Check access permissions
    if (document.isConfidential && document.uploadedBy !== userId) {
      throw new ForbiddenException('Access denied: Document is confidential');
    }

    // Log access
    if (request) {
      await this.accessLogService.logAccess(
        id,
        AccessAction.VIEW,
        request,
        userId,
        'Document viewed',
      );
    }

    // Get verification information
    const verifications = await this.verificationService.getDocumentVerifications(id);
    const latestVerification = verifications[0];

    const response = this.mapToResponseDto(document) as DocumentWithVerificationDto;
    if (latestVerification) {
      response.verificationStatus = latestVerification.status;
      response.verificationConfidence = latestVerification.confidenceScore;
      response.verificationCompletedAt = latestVerification.completedAt;
    }

    return response;
  }

  async downloadDocument(id: string, userId?: string, request?: Request): Promise<{
    buffer: Buffer;
    document: DocumentResponseDto;
  }> {
    const document = await this.findOne(id, userId, request);

    try {
      const buffer = await this.documentStorageService.getFileStream(
        document.filePath,
        document.s3Key,
      );

      // Log download access
      if (request) {
        await this.accessLogService.logAccess(
          id,
          AccessAction.DOWNLOAD,
          request,
          userId,
          'Document downloaded',
        );
      }

      return { buffer, document };
    } catch (error) {
      this.logger.error(`Failed to download document ${id}: ${error.message}`, error.stack);
      throw new BadRequestException(`Download failed: ${error.message}`);
    }
  }

  async updateDocument(
    id: string,
    updateDto: UpdateDocumentDto,
    userId?: string,
    request?: Request,
  ): Promise<DocumentResponseDto> {
    const document = await this.documentRepository.findOne({ where: { id } });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Check permissions
    if (document.uploadedBy !== userId) {
      throw new ForbiddenException('Access denied: Only the uploader can modify this document');
    }

    // Update fields
    Object.assign(document, updateDto);

    if (updateDto.tags) {
      document.tags = updateDto.tags.join(',');
    }

    if (updateDto.expiryDate) {
      document.expiryDate = new Date(updateDto.expiryDate);
    }

    if (updateDto.status === DocumentStatus.REJECTED && updateDto.rejectionReason) {
      document.rejectionReason = updateDto.rejectionReason;
    }

    if (updateDto.status === DocumentStatus.VALIDATED) {
      document.validatedBy = userId;
      document.validatedAt = new Date();
    }

    const updatedDocument = await this.documentRepository.save(document);

    // Log access
    if (request) {
      await this.accessLogService.logAccess(
        id,
        AccessAction.EDIT,
        request,
        userId,
        'Document updated',
        { updatedFields: Object.keys(updateDto) },
      );
    }

    return this.mapToResponseDto(updatedDocument);
  }

  async deleteDocument(id: string, userId?: string, request?: Request): Promise<void> {
    const document = await this.documentRepository.findOne({ where: { id } });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Check permissions
    if (document.uploadedBy !== userId) {
      throw new ForbiddenException('Access denied: Only the uploader can delete this document');
    }

    try {
      // Delete file from storage
      await this.documentStorageService.deleteFile(document.filePath, document.s3Key);

      // Delete database record
      await this.documentRepository.remove(document);

      // Log access
      if (request) {
        await this.accessLogService.logAccess(
          id,
          AccessAction.DELETE,
          request,
          userId,
          'Document deleted',
        );
      }

      this.logger.log(`Document deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete document ${id}: ${error.message}`, error.stack);
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }

  async getDocumentsByShipment(shipmentId: string): Promise<DocumentResponseDto[]> {
    const documents = await this.documentRepository.find({
      where: { shipmentId },
      order: { createdAt: 'DESC' },
    });

    return documents.map(doc => this.mapToResponseDto(doc));
  }

  async getDocumentStats(): Promise<DocumentStatsDto> {
    const [
      totalDocuments,
      totalSize,
      byType,
      byStatus,
      byPriority,
      confidentialCount,
      requiredCount,
      expiredCount,
    ] = await Promise.all([
      this.documentRepository.count(),
      this.documentRepository
        .createQueryBuilder('document')
        .select('SUM(document.fileSize)', 'totalSize')
        .getRawOne()
        .then(result => parseInt(result.totalSize) || 0),
      this.documentRepository
        .createQueryBuilder('document')
        .select(['document.documentType', 'COUNT(*) as count'])
        .groupBy('document.documentType')
        .getRawMany()
        .then(results => {
          const stats: Record<DocumentType, number> = {} as any;
          results.forEach(result => {
            stats[result.documentType] = parseInt(result.count);
          });
          return stats;
        }),
      this.documentRepository
        .createQueryBuilder('document')
        .select(['document.status', 'COUNT(*) as count'])
        .groupBy('document.status')
        .getRawMany()
        .then(results => {
          const stats: Record<DocumentStatus, number> = {} as any;
          results.forEach(result => {
            stats[result.status] = parseInt(result.count);
          });
          return stats;
        }),
      this.documentRepository
        .createQueryBuilder('document')
        .select(['document.priority', 'COUNT(*) as count'])
        .groupBy('document.priority')
        .getRawMany()
        .then(results => {
          const stats: Record<DocumentPriority, number> = {} as any;
          results.forEach(result => {
            stats[result.priority] = parseInt(result.count);
          });
          return stats;
        }),
      this.documentRepository.count({ where: { isConfidential: true } }),
      this.documentRepository.count({ where: { isRequired: true } }),
      this.documentRepository.count({
        where: {
          expiryDate: Between(new Date(0), new Date()),
        },
      }),
    ]);

    return {
      totalDocuments,
      totalSize,
      byType,
      byStatus,
      byPriority,
      confidentialCount,
      requiredCount,
      expiredCount,
    };
  }

  async createVerification(
    documentId: string,
    createDto: CreateVerificationDto,
    userId?: string,
  ): Promise<DocumentVerification> {
    return this.verificationService.createVerification(documentId, createDto, userId);
  }

  async getDocumentAccessLogs(documentId: string, limit: number = 50): Promise<DocumentAccessLog[]> {
    return this.accessLogService.getDocumentAccessLogs(documentId, limit);
  }

  private mapToResponseDto(document: Document): DocumentResponseDto {
    return {
      id: document.id,
      originalName: document.originalName,
      fileName: document.fileName,
      documentType: document.documentType,
      status: document.status,
      priority: document.priority,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      shipmentId: document.shipmentId,
      uploadedBy: document.uploadedBy,
      description: document.description,
      metadata: document.metadata,
      checksum: document.checksum,
      version: document.version,
      parentDocumentId: document.parentDocumentId,
      expiryDate: document.expiryDate,
      rejectionReason: document.rejectionReason,
      validatedBy: document.validatedBy,
      validatedAt: document.validatedAt,
      tags: document.tags ? document.tags.split(',') : [],
      isConfidential: document.isConfidential,
      isRequired: document.isRequired,
      countryOfOrigin: document.countryOfOrigin,
      countryOfDestination: document.countryOfDestination,
      customsCode: document.customsCode,
      weight: document.weight,
      value: document.value,
      currency: document.currency,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
