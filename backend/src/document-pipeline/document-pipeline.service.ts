import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'node:crypto';
import { DocumentProcessing, ProcessingStatus } from './entities/document-processing.entity';
import { Document } from '../documents/entities/document.entity';

const VALID_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@Injectable()
export class DocumentPipelineService {
  constructor(
    @InjectRepository(DocumentProcessing) private readonly procRepo: Repository<DocumentProcessing>,
    @InjectRepository(Document) private readonly docRepo: Repository<Document>,
  ) {}

  async enqueue(documentId: string): Promise<DocumentProcessing> {
    const doc = await this.docRepo.findOne({ where: { id: documentId } });
    if (!doc) throw new BadRequestException('Document not found');

    const processing = this.procRepo.create({ documentId, status: ProcessingStatus.PENDING });
    return this.procRepo.save(processing);
  }

  async process(documentId: string): Promise<DocumentProcessing> {
    let proc = await this.procRepo.findOne({ where: { documentId }, order: { createdAt: 'DESC' } });
    if (!proc) {
      proc = this.procRepo.create({ documentId, status: ProcessingStatus.PENDING });
    }

    proc.status = ProcessingStatus.PROCESSING;
    await this.procRepo.save(proc);

    try {
      const doc = await this.docRepo.findOne({ where: { id: documentId } });
      if (!doc) throw new Error('Document not found');

      const mimeType = this.guessMimeType(doc.originalName ?? '');
      if (!VALID_MIME_TYPES.includes(mimeType)) {
        throw new BadRequestException(`Invalid MIME type: ${mimeType}`);
      }

      const hash = createHash('sha256').update(documentId).digest('hex');

      proc.mimeType = mimeType;
      proc.sha256Hash = hash;
      proc.status = ProcessingStatus.READY;
    } catch (error) {
      proc.status = ProcessingStatus.FAILED;
      proc.errorReason = error instanceof Error ? error.message : 'Unknown error';
    }

    return this.procRepo.save(proc);
  }

  async getStatus(documentId: string): Promise<DocumentProcessing | null> {
    return this.procRepo.findOne({ where: { documentId }, order: { createdAt: 'DESC' } });
  }

  private guessMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return map[ext ?? ''] ?? 'application/octet-stream';
  }
}
