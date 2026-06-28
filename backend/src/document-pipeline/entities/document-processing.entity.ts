import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}

@Entity('document_processing')
export class DocumentProcessing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'document_id', type: 'uuid' })
  documentId: string;

  @Column({
    type: 'enum',
    enum: ProcessingStatus,
    default: ProcessingStatus.PENDING,
  })
  status: ProcessingStatus;

  @Column({ name: 'mime_type', nullable: true, length: 100 })
  mimeType: string | null;

  @Column({ name: 'sha256_hash', nullable: true, length: 64 })
  sha256Hash: string | null;

  @Column({ name: 'error_reason', type: 'text', nullable: true })
  errorReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
