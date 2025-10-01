import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomsDocument, DocumentType, DocumentStatus } from '../entities/customs-document.entity';
import { CustomsRequirement } from '../entities/customs-requirement.entity';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: any;
}

export interface DocumentValidationRules {
  maxFileSize?: number; // in bytes
  allowedMimeTypes?: string[];
  requiredFields?: string[];
  formatValidation?: any;
  expiryCheck?: boolean;
  signatureRequired?: boolean;
}

@Injectable()
export class DocumentValidationService {
  constructor(
    @InjectRepository(CustomsDocument)
    private readonly documentRepo: Repository<CustomsDocument>,
    @InjectRepository(CustomsRequirement)
    private readonly requirementRepo: Repository<CustomsRequirement>,
  ) {}

  /**
   * Validates a customs document based on its type and associated requirements
   */
  async validateDocument(documentId: string): Promise<ValidationResult> {
    const document = await this.documentRepo.findOne({
      where: { id: documentId },
      relations: ['requirement'],
    });

    if (!document) {
      throw new BadRequestException('Document not found');
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    let metadata: any = {};

    // Basic file validation
    await this.validateFileFormat(document, errors, warnings);
    
    // Document type specific validation
    await this.validateDocumentType(document, errors, warnings, metadata);
    
    // Requirement-based validation
    if (document.requirement) {
      await this.validateAgainstRequirement(document, document.requirement, errors, warnings, metadata);
    }

    // Expiry date validation
    await this.validateExpiryDate(document, errors, warnings);

    // Update document status based on validation results
    const newStatus = errors.length > 0 ? DocumentStatus.REJECTED : 
                     warnings.length > 0 ? DocumentStatus.UNDER_REVIEW : 
                     DocumentStatus.APPROVED;

    await this.documentRepo.update(documentId, {
      status: newStatus,
      validationNotes: errors.length > 0 ? errors.join('; ') : 
                      warnings.length > 0 ? warnings.join('; ') : 'Document validated successfully',
      rejectionReason: errors.length > 0 ? errors.join('; ') : null,
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata,
    };
  }

  /**
   * Validates file format and basic properties
   */
  private async validateFileFormat(
    document: CustomsDocument, 
    errors: string[], 
    warnings: string[]
  ): Promise<void> {
    // Check file size (assuming max 10MB for most documents)
    if (document.fileSize) {
      const sizeInBytes = this.parseFileSize(document.fileSize);
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (sizeInBytes > maxSize) {
        errors.push(`File size (${document.fileSize}) exceeds maximum allowed size (10MB)`);
      }
    }

    // Check MIME type
    if (document.mimeType) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(document.mimeType)) {
        warnings.push(`File type ${document.mimeType} may not be supported by customs authorities`);
      }
    }

    // Check file extension
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    const hasValidExtension = allowedExtensions.some(ext => 
      document.fileName.toLowerCase().endsWith(ext)
    );
    if (!hasValidExtension) {
      warnings.push('File extension may not be supported');
    }
  }

  /**
   * Validates document based on its specific type
   */
  private async validateDocumentType(
    document: CustomsDocument,
    errors: string[],
    warnings: string[],
    metadata: any
  ): Promise<void> {
    switch (document.documentType) {
      case DocumentType.COMMERCIAL_INVOICE:
        await this.validateCommercialInvoice(document, errors, warnings, metadata);
        break;
      case DocumentType.PACKING_LIST:
        await this.validatePackingList(document, errors, warnings, metadata);
        break;
      case DocumentType.CERTIFICATE_OF_ORIGIN:
        await this.validateCertificateOfOrigin(document, errors, warnings, metadata);
        break;
      case DocumentType.BILL_OF_LADING:
      case DocumentType.AIR_WAYBILL:
        await this.validateTransportDocument(document, errors, warnings, metadata);
        break;
      default:
        warnings.push(`No specific validation rules defined for document type: ${document.documentType}`);
    }
  }

  /**
   * Validates commercial invoice specific requirements
   */
  private async validateCommercialInvoice(
    document: CustomsDocument,
    errors: string[],
    warnings: string[],
    metadata: any
  ): Promise<void> {
    // Commercial invoices typically require specific information
    const requiredFields = ['invoice_number', 'date', 'seller', 'buyer', 'goods_description', 'value'];
    
    if (document.metadata) {
      try {
        const docMetadata = JSON.parse(document.metadata);
        metadata.invoiceData = docMetadata;
        
        // Check for required fields in metadata
        for (const field of requiredFields) {
          if (!docMetadata[field]) {
            warnings.push(`Commercial invoice may be missing required field: ${field}`);
          }
        }

        // Validate invoice value
        if (docMetadata.value) {
          const value = parseFloat(docMetadata.value);
          if (isNaN(value) || value <= 0) {
            errors.push('Invalid invoice value');
          }
        }
      } catch (e) {
        warnings.push('Could not parse document metadata for validation');
      }
    } else {
      warnings.push('No metadata provided for commercial invoice validation');
    }
  }

  /**
   * Validates packing list specific requirements
   */
  private async validatePackingList(
    document: CustomsDocument,
    errors: string[],
    warnings: string[],
    metadata: any
  ): Promise<void> {
    if (document.metadata) {
      try {
        const docMetadata = JSON.parse(document.metadata);
        metadata.packingData = docMetadata;
        
        // Check for item count and weights
        if (docMetadata.itemCount && parseInt(docMetadata.itemCount) <= 0) {
          errors.push('Invalid item count in packing list');
        }
        
        if (docMetadata.totalWeight && parseFloat(docMetadata.totalWeight) <= 0) {
          errors.push('Invalid total weight in packing list');
        }
      } catch (e) {
        warnings.push('Could not parse packing list metadata');
      }
    }
  }

  /**
   * Validates certificate of origin specific requirements
   */
  private async validateCertificateOfOrigin(
    document: CustomsDocument,
    errors: string[],
    warnings: string[],
    metadata: any
  ): Promise<void> {
    // Certificates of origin typically have strict format requirements
    if (document.mimeType !== 'application/pdf') {
      warnings.push('Certificate of origin should preferably be in PDF format');
    }
    
    if (document.metadata) {
      try {
        const docMetadata = JSON.parse(document.metadata);
        metadata.originData = docMetadata;
        
        if (!docMetadata.country_of_origin) {
          errors.push('Certificate of origin must specify country of origin');
        }
      } catch (e) {
        warnings.push('Could not parse certificate of origin metadata');
      }
    }
  }

  /**
   * Validates transport documents (BOL, AWB)
   */
  private async validateTransportDocument(
    document: CustomsDocument,
    errors: string[],
    warnings: string[],
    metadata: any
  ): Promise<void> {
    if (document.metadata) {
      try {
        const docMetadata = JSON.parse(document.metadata);
        metadata.transportData = docMetadata;
        
        // Check for transport document number
        if (!docMetadata.document_number) {
          errors.push('Transport document must have a document number');
        }
        
        // Check for carrier information
        if (!docMetadata.carrier) {
          warnings.push('Transport document should specify carrier information');
        }
      } catch (e) {
        warnings.push('Could not parse transport document metadata');
      }
    }
  }

  /**
   * Validates document against specific customs requirements
   */
  private async validateAgainstRequirement(
    document: CustomsDocument,
    requirement: CustomsRequirement,
    errors: string[],
    warnings: string[],
    metadata: any
  ): Promise<void> {
    // Check document format requirement
    if (requirement.documentFormat && document.mimeType) {
      const requiredFormat = this.getMimeTypeFromFormat(requirement.documentFormat);
      if (requiredFormat && document.mimeType !== requiredFormat) {
        errors.push(`Document format must be ${requirement.documentFormat} as per requirement ${requirement.requirementCode}`);
      }
    }

    // Check validity period
    if (requirement.validityDays && document.expiryDate) {
      const daysUntilExpiry = Math.ceil((document.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry < 0) {
        errors.push('Document has expired');
      } else if (daysUntilExpiry < 7) {
        warnings.push('Document expires within 7 days');
      }
    }

    // Parse and apply validation rules
    if (requirement.validationRules) {
      try {
        const rules = JSON.parse(requirement.validationRules);
        await this.applyValidationRules(document, rules, errors, warnings, metadata);
      } catch (e) {
        warnings.push('Could not parse validation rules from requirement');
      }
    }
  }

  /**
   * Validates document expiry date
   */
  private async validateExpiryDate(
    document: CustomsDocument,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    if (document.expiryDate) {
      const now = new Date();
      if (document.expiryDate <= now) {
        errors.push('Document has expired');
      } else {
        const daysUntilExpiry = Math.ceil((document.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 30) {
          warnings.push(`Document expires in ${daysUntilExpiry} days`);
        }
      }
    }
  }

  /**
   * Applies custom validation rules from requirements
   */
  private async applyValidationRules(
    document: CustomsDocument,
    rules: DocumentValidationRules,
    errors: string[],
    warnings: string[],
    metadata: any
  ): Promise<void> {
    // File size validation
    if (rules.maxFileSize && document.fileSize) {
      const sizeInBytes = this.parseFileSize(document.fileSize);
      if (sizeInBytes > rules.maxFileSize) {
        errors.push(`File size exceeds maximum allowed size of ${this.formatFileSize(rules.maxFileSize)}`);
      }
    }

    // MIME type validation
    if (rules.allowedMimeTypes && document.mimeType) {
      if (!rules.allowedMimeTypes.includes(document.mimeType)) {
        errors.push(`File type ${document.mimeType} is not allowed`);
      }
    }

    // Required fields validation
    if (rules.requiredFields && document.metadata) {
      try {
        const docMetadata = JSON.parse(document.metadata);
        for (const field of rules.requiredFields) {
          if (!docMetadata[field]) {
            errors.push(`Required field '${field}' is missing`);
          }
        }
      } catch (e) {
        errors.push('Could not parse document metadata for required fields validation');
      }
    }
  }

  /**
   * Helper method to parse file size string to bytes
   */
  private parseFileSize(sizeStr: string): number {
    const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);
    if (match) {
      const size = parseFloat(match[1]);
      const unit = match[2].toUpperCase();
      return size * (units[unit] || 1);
    }
    return 0;
  }

  /**
   * Helper method to format file size in bytes to human readable format
   */
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Helper method to get MIME type from format string
   */
  private getMimeTypeFromFormat(format: string): string | null {
    const formatMap: { [key: string]: string } = {
      'PDF': 'application/pdf',
      'JPEG': 'image/jpeg',
      'PNG': 'image/png',
      'DOC': 'application/msword',
      'DOCX': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return formatMap[format.toUpperCase()] || null;
  }

  /**
   * Batch validates multiple documents
   */
  async validateDocuments(documentIds: string[]): Promise<{ [documentId: string]: ValidationResult }> {
    const results: { [documentId: string]: ValidationResult } = {};
    
    for (const documentId of documentIds) {
      try {
        results[documentId] = await this.validateDocument(documentId);
      } catch (error) {
        results[documentId] = {
          isValid: false,
          errors: [error.message],
          warnings: [],
        };
      }
    }
    
    return results;
  }
}
