import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';
import { DocumentType } from '../enums/document-type.enum';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Shipment, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Column({ name: 'shipment_id' })
  shipmentId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'uploader_id' })
  uploader: User;

  @Column({ name: 'uploader_id' })
  uploaderId: string;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTHER,
  })
  documentType: DocumentType;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'stored_name' })
  storedName: string;

  @Column()
  mimetype: string;

  @Column({ name: 'size_bytes', type: 'int' })
  sizeBytes: number;

  /** SHA-256 hex digest of the file contents */
  @Column({ name: 'sha256_hash', length: 64 })
  sha256Hash: string;

  /** IPFS CID — populated later if/when pinned to IPFS */
  @Column({ name: 'ipfs_cid', nullable: true, type: 'varchar' })
  ipfsCid: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
