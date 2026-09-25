import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Document } from './entities/document.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/role.enum';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { isEnoentError, unlinkFileIfPresent } from './document-file.util';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    private readonly configService: ConfigService,
  ) {}

  get uploadDir(): string {
    return this.configService.get<string>('UPLOAD_DIR', './uploads');
  }

  // ── Guards ───────────────────────────────────────────────────────────────────

  private async getShipmentOrThrow(shipmentId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id: shipmentId },
    });
    if (!shipment)
      throw new NotFoundException(`Shipment ${shipmentId} not found`);
    return shipment;
  }

  private assertIsParty(shipment: Shipment, user: User): void {
    const isParty =
      shipment.shipperId === user.id ||
      shipment.carrierId === user.id ||
      user.role === UserRole.ADMIN;
    if (!isParty) {
      throw new ForbiddenException(
        'Only parties to this shipment can manage its documents',
      );
    }
  }

  // ── Hash ─────────────────────────────────────────────────────────────────────

  private computeSha256(filePath: string): string {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  private moveFileToTombstone(filePath: string): string | null {
    const tombstonePath = `${filePath}.${crypto.randomUUID()}.deleting`;
    try {
      fs.renameSync(filePath, tombstonePath);
      return tombstonePath;
    } catch (error) {
      if (isEnoentError(error)) {
        return null;
      }
      throw error;
    }
  }

  private restoreFileFromTombstone(
    tombstonePath: string,
    filePath: string,
  ): void {
    try {
      fs.renameSync(tombstonePath, filePath);
    } catch (error) {
      this.logger.error(
        `Failed to restore document file ${filePath} from ${tombstonePath}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private cleanupUploadedFile(filePath: string): void {
    if (!filePath) return;

    try {
      unlinkFileIfPresent(filePath);
    } catch (error) {
      this.logger.error(
        `Failed to clean up uploaded document ${filePath}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  // ── Upload ───────────────────────────────────────────────────────────────────

  async upload(
    file: Express.Multer.File,
    dto: UploadDocumentDto,
    uploader: User,
  ): Promise<Document> {
    try {
      const shipment = await this.getShipmentOrThrow(dto.shipmentId);
      this.assertIsParty(shipment, uploader);

      const sha256Hash = this.computeSha256(file.path);

      const doc = this.documentRepo.create({
        shipmentId: dto.shipmentId,
        uploaderId: uploader.id,
        documentType: dto.documentType,
        originalName: file.originalname,
        storedName: file.filename,
        mimetype: file.mimetype,
        sizeBytes: file.size,
        sha256Hash,
        ipfsCid: null,
        onChainDocumentId: null,
        notes: dto.notes ?? null,
      });

      return await this.documentRepo.save(doc);
    } catch (error) {
      // Multer has already written the file before this service is called.
      // Every failed service path must release that newly-created file.
      this.cleanupUploadedFile(file.path);
      throw error;
    }
  }

  // ── List ─────────────────────────────────────────────────────────────────────

  async listByShipment(shipmentId: string, user: User): Promise<Document[]> {
    const shipment = await this.getShipmentOrThrow(shipmentId);
    this.assertIsParty(shipment, user);

    return this.documentRepo.find({
      where: { shipmentId },
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  // ── Single ───────────────────────────────────────────────────────────────────

  async findOne(id: string, user: User): Promise<Document> {
    const doc = await this.documentRepo.findOne({
      where: { id },
      relations: ['uploader'],
    });
    if (!doc) throw new NotFoundException(`Document ${id} not found`);

    const shipment = await this.getShipmentOrThrow(doc.shipmentId);
    this.assertIsParty(shipment, user);
    return doc;
  }

  // ── Download ─────────────────────────────────────────────────────────────────

  async getFilePath(
    id: string,
    user: User,
  ): Promise<{ filePath: string; originalName: string }> {
    const doc = await this.findOne(id, user);
    const filePath = path.join(this.uploadDir, doc.storedName);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on server');
    }

    return { filePath, originalName: doc.originalName };
  }

  // ── Delete ───────────────────────────────────────────────────────────────────

  async delete(id: string, user: User): Promise<void> {
    const doc = await this.findOne(id, user);

    // Only the uploader or admin can delete
    if (doc.uploaderId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only the uploader or an admin can delete this document',
      );
    }

    const filePath = path.join(this.uploadDir, doc.storedName);

    // Move the file out of the public path first.  The tombstone prevents a
    // concurrent download from observing a half-completed delete.  If the DB
    // operation fails, move it back and leave the existing metadata intact.
    const tombstonePath = this.moveFileToTombstone(filePath);

    try {
      await this.documentRepo.remove(doc);
    } catch (error) {
      if (tombstonePath) {
        this.restoreFileFromTombstone(tombstonePath, filePath);
      }
      throw error;
    }

    // The row is gone, so the tombstone can now be permanently removed.  A
    // missing tombstone is already the desired end state.
    if (!tombstonePath) return;

    try {
      unlinkFileIfPresent(tombstonePath);
    } catch (error) {
      // If the final unlink fails, restore both sides of the logical record
      // rather than leaving metadata pointing at a tombstone-only file.
      try {
        await this.documentRepo.save(doc);
      } catch (restoreError) {
        this.logger.error(
          `Failed to restore document ${doc.id} after final file deletion failed: ${
            restoreError instanceof Error
              ? restoreError.message
              : String(restoreError)
          }`,
        );
      }
      this.restoreFileFromTombstone(tombstonePath, filePath);
      throw error;
    }
  }
}
