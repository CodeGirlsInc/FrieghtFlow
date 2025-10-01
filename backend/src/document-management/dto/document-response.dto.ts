import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType, DocumentStatus, DocumentPriority } from '../entities/document.entity';
import { VerificationStatus } from '../entities/document-verification.entity';

export class DocumentResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the document',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Original name of the uploaded file',
    example: 'bill_of_lading_12345.pdf',
  })
  originalName: string;

  @ApiProperty({
    description: 'Generated file name for storage',
    example: 'BILL_OF_LADING_1703123456789_abc123_bill_of_lading_12345.pdf',
  })
  fileName: string;

  @ApiProperty({
    description: 'Type of document',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @ApiProperty({
    description: 'Current status of the document',
    enum: DocumentStatus,
  })
  status: DocumentStatus;

  @ApiProperty({
    description: 'Priority level of the document',
    enum: DocumentPriority,
  })
  priority: DocumentPriority;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  mimeType: string;

  @ApiProperty({
    description: 'Size of the file in bytes',
    example: 1024000,
  })
  fileSize: number;

  @ApiPropertyOptional({
    description: 'ID of the shipment this document belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  shipmentId?: string;

  @ApiPropertyOptional({
    description: 'ID of the user who uploaded the document',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uploadedBy?: string;

  @ApiPropertyOptional({
    description: 'Description of the document',
    example: 'Bill of lading for shipment #12345',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the document',
    example: { source: 'manual_upload', department: 'logistics' },
  })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Checksum of the file for integrity verification',
    example: 'a1b2c3d4e5f6...',
  })
  checksum?: string;

  @ApiPropertyOptional({
    description: 'Version of the document',
    example: '1.0',
  })
  version?: string;

  @ApiPropertyOptional({
    description: 'ID of the parent document if this is a revision',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  parentDocumentId?: string;

  @ApiPropertyOptional({
    description: 'Expiry date of the document',
    example: '2024-12-31T23:59:59Z',
  })
  expiryDate?: Date;

  @ApiPropertyOptional({
    description: 'Reason for rejection if status is REJECTED',
    example: 'Document is not legible',
  })
  rejectionReason?: string;

  @ApiPropertyOptional({
    description: 'ID of the user who validated the document',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  validatedBy?: string;

  @ApiPropertyOptional({
    description: 'Date when the document was validated',
    example: '2024-01-15T10:30:00Z',
  })
  validatedAt?: Date;

  @ApiPropertyOptional({
    description: 'Tags for categorizing the document',
    example: ['urgent', 'customs', 'shipping'],
  })
  tags?: string[];

  @ApiProperty({
    description: 'Whether the document is confidential',
    example: false,
  })
  isConfidential: boolean;

  @ApiProperty({
    description: 'Whether the document is required for processing',
    example: true,
  })
  isRequired: boolean;

  @ApiPropertyOptional({
    description: 'Country of origin',
    example: 'US',
  })
  countryOfOrigin?: string;

  @ApiPropertyOptional({
    description: 'Country of destination',
    example: 'CA',
  })
  countryOfDestination?: string;

  @ApiPropertyOptional({
    description: 'Customs code for the document',
    example: 'HS1234567890',
  })
  customsCode?: string;

  @ApiPropertyOptional({
    description: 'Weight of the shipment in kg',
    example: 150.5,
  })
  weight?: number;

  @ApiPropertyOptional({
    description: 'Value of the shipment',
    example: 5000.00,
  })
  value?: number;

  @ApiPropertyOptional({
    description: 'Currency code for the value',
    example: 'USD',
  })
  currency?: string;

  @ApiProperty({
    description: 'Date when the document was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the document was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}

export class DocumentWithVerificationDto extends DocumentResponseDto {
  @ApiPropertyOptional({
    description: 'Current verification status',
    enum: VerificationStatus,
  })
  verificationStatus?: VerificationStatus;

  @ApiPropertyOptional({
    description: 'Confidence score of the verification',
    example: 85.5,
  })
  verificationConfidence?: number;

  @ApiPropertyOptional({
    description: 'Date when verification was completed',
    example: '2024-01-15T10:30:00Z',
  })
  verificationCompletedAt?: Date;
}

export class DocumentStatsDto {
  @ApiProperty({
    description: 'Total number of documents',
    example: 150,
  })
  totalDocuments: number;

  @ApiProperty({
    description: 'Total size of all documents in bytes',
    example: 1024000000,
  })
  totalSize: number;

  @ApiProperty({
    description: 'Number of documents by type',
    example: { BILL_OF_LADING: 50, COMMERCIAL_INVOICE: 30, PACKING_LIST: 20 },
  })
  byType: Record<DocumentType, number>;

  @ApiProperty({
    description: 'Number of documents by status',
    example: { UPLOADED: 100, VALIDATED: 40, REJECTED: 10 },
  })
  byStatus: Record<DocumentStatus, number>;

  @ApiProperty({
    description: 'Number of documents by priority',
    example: { HIGH: 20, MEDIUM: 100, LOW: 30 },
  })
  byPriority: Record<DocumentPriority, number>;

  @ApiProperty({
    description: 'Number of confidential documents',
    example: 25,
  })
  confidentialCount: number;

  @ApiProperty({
    description: 'Number of required documents',
    example: 80,
  })
  requiredCount: number;

  @ApiProperty({
    description: 'Number of expired documents',
    example: 5,
  })
  expiredCount: number;
}
