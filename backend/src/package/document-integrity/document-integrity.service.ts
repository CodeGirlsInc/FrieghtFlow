import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { Document } from '../../documents/entities/document.entity';

export interface IntegrityResult {
  valid: boolean;
  storedHash: string;
  computedHash: string;
}

@Injectable()
export class DocumentIntegrityService {
  private readonly logger = new Logger(DocumentIntegrityService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
  ) {}

  async verifyIntegrity(documentId: string): Promise<IntegrityResult> {
    const doc = await this.documentRepo.findOne({ where: { id: documentId } });
    if (!doc) {
      throw new NotFoundException(`Document ${documentId} not found`);
    }

    const filePath = doc.storedName;
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(
        `File not found on disk for document ${documentId}`,
      );
    }

    const buffer = fs.readFileSync(filePath);
    const computedHash = crypto
      .createHash('sha256')
      .update(buffer)
      .digest('hex');

    const valid = computedHash === doc.sha256Hash;

    if (!valid) {
      this.logger.warn('Document integrity mismatch detected', {
        documentId,
        storedHash: doc.sha256Hash,
        computedHash,
      });
    }

    return { valid, storedHash: doc.sha256Hash, computedHash };
  }
}
