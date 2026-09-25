import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Document } from './entities/document.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/role.enum';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { DocumentType } from './enums/document-type.enum';
import {
  isSupportedDocumentMimeType,
  verifyDocumentFileType,
  type VerifiedDocumentType,
} from './document-file.util';
import { CarrierCertification } from '../carriers/entities/carrier-certification.entity';

type PersistedUpload = VerifiedDocumentType & {
  storedName: string;
  filePath: string;
  sha256Hash: string;
  sizeBytes: number;
};

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(CarrierCertification)
    private readonly certificationRepo: Repository<CarrierCertification>,
    private readonly configService: ConfigService,
  ) {}

  get uploadDir(): string {
    return path.resolve(
      this.configService.get<string>('UPLOAD_DIR', './uploads'),
    );
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

  // ── Safe file handling ───────────────────────────────────────────────────────

  private isPathInsideRoot(candidate: string, root = this.uploadDir): boolean {
    const relative = path.relative(root, candidate);
    return (
      relative !== '' &&
      !relative.startsWith('..') &&
      !path.isAbsolute(relative)
    );
  }

  private getFileBuffer(file: Express.Multer.File): Buffer {
    if (Buffer.isBuffer(file.buffer)) return file.buffer;
    // Kept as a defensive fallback for callers/tests using a disk-backed file.
    // The configured Multer storage is memory-backed, so normal requests never
    // write a file before validation and signature verification complete. A
    // fallback path is accepted only when it is contained by the upload root.
    if (file.path && this.isPathInsideRoot(path.resolve(file.path))) {
      return fs.readFileSync(file.path);
    }
    throw new BadRequestException('Uploaded file contents are unavailable');
  }

  private resolveStoredPath(storedName: string): string {
    if (!storedName || path.basename(storedName) !== storedName) {
      throw new BadRequestException('Invalid stored document path');
    }

    const resolved = path.resolve(this.uploadDir, storedName);
    if (!this.isPathInsideRoot(resolved)) {
      throw new BadRequestException('Invalid stored document path');
    }
    return resolved;
  }

  private getErrorCode(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return undefined;
    }
    const code = (error as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }

  private removeFileIfExists(filePath: string, quiet = false): void {
    try {
      fs.unlinkSync(filePath);
    } catch (error: unknown) {
      const code = this.getErrorCode(error);
      if (code !== 'ENOENT' && !quiet) throw error;
    }
  }

  private sanitizeOriginalName(originalName: string): string {
    const basename = Array.from(path.basename(originalName || 'upload'))
      .filter((character) => {
        const code = character.charCodeAt(0);
        return code >= 32 && code !== 127;
      })
      .join('')
      .trim();
    return (basename || 'upload').slice(0, 255);
  }

  private persistFile(file: Express.Multer.File | undefined): PersistedUpload {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!isSupportedDocumentMimeType(file.mimetype)) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }

    const buffer = this.getFileBuffer(file);
    let verifiedType: VerifiedDocumentType;
    try {
      verifiedType = verifyDocumentFileType(buffer, file.mimetype);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(message);
    }

    const storedName = `${uuidv4()}${verifiedType.extension}`;
    const filePath = this.resolveStoredPath(storedName);
    const sha256Hash = crypto.createHash('sha256').update(buffer).digest('hex');
    fs.mkdirSync(this.uploadDir, { recursive: true });

    try {
      // The extension comes only from the verified signature, never from the
      // client filename. `wx` prevents overwriting an existing object.
      fs.writeFileSync(filePath, buffer, { flag: 'wx' });
    } catch (error: unknown) {
      // EEXIST means the path was already occupied; never delete a pre-existing
      // file in that case. Other write failures may have left a partial file.
      if (this.getErrorCode(error) !== 'EEXIST') {
        this.removeFileIfExists(filePath, true);
      }
      throw error;
    }

    return {
      ...verifiedType,
      storedName,
      filePath,
      sha256Hash,
      sizeBytes: buffer.length,
    };
  }

  private async persistDocument(
    file: Express.Multer.File | undefined,
    uploader: User,
    shipmentId: string | null,
    documentType: DocumentType,
    notes: string | null,
  ): Promise<Document> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const persisted = this.persistFile(file);

    try {
      const document = this.documentRepo.create({
        shipmentId,
        uploaderId: uploader.id,
        documentType,
        originalName: this.sanitizeOriginalName(file.originalname),
        storedName: persisted.storedName,
        mimetype: persisted.mimetype,
        sizeBytes: persisted.sizeBytes,
        sha256Hash: persisted.sha256Hash,
        ipfsCid: null,
        onChainDocumentId: null,
        notes,
      });

      return await this.documentRepo.save(document);
    } catch (error: unknown) {
      // Covers repository/create failures after bytes have been accepted.
      this.removeFileIfExists(persisted.filePath, true);
      throw error;
    }
  }

  /**
   * Removes a file left by a non-memory storage implementation when a
   * controller/interceptor fails. With the current memory storage this is a
   * no-op, but keeping the guarded cleanup here makes the invariant explicit.
   */
  cleanupUpload(file: Express.Multer.File | undefined): void {
    if (!file?.path) return;

    try {
      const candidate = path.resolve(file.path);
      if (this.isPathInsideRoot(candidate)) {
        this.removeFileIfExists(candidate, true);
      }
    } catch {
      // Cleanup must never mask the original request error.
    }
  }

  // ── Upload ───────────────────────────────────────────────────────────────────

  async upload(
    file: Express.Multer.File | undefined,
    dto: UploadDocumentDto,
    uploader: User,
  ): Promise<Document> {
    const shipment = await this.getShipmentOrThrow(dto.shipmentId);
    this.assertIsParty(shipment, uploader);

    return this.persistDocument(
      file,
      uploader,
      dto.shipmentId,
      dto.documentType,
      dto.notes ?? null,
    );
  }

  /**
   * Stores a certification file in the same platform-owned upload flow as
   * shipment documents. Callers receive a persisted Document id rather than an
   * arbitrary URL to submit later.
   */
  async uploadCertificationDocument(
    file: Express.Multer.File | undefined,
    uploader: User,
  ): Promise<Document> {
    if (uploader.role !== UserRole.CARRIER) {
      throw new ForbiddenException('Only carriers can upload certifications');
    }

    return this.persistDocument(
      file,
      uploader,
      null,
      DocumentType.CARRIER_CERTIFICATION,
      null,
    );
  }

  /**
   * Resolves the document id supplied with a certification and proves that it
   * was uploaded by the carrier through this service. A UUID by itself is not
   * proof of ownership, so this check happens at the service boundary.
   */
  async getOwnedCertificationDocument(
    documentId: string,
    uploaderId: string,
  ): Promise<Document> {
    const document = await this.documentRepo.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document ${documentId} not found`);
    }

    if (document.uploaderId !== uploaderId) {
      throw new ForbiddenException(
        'You can only use certification documents that you uploaded',
      );
    }

    if (
      document.documentType !== DocumentType.CARRIER_CERTIFICATION ||
      (document.shipmentId !== null && document.shipmentId !== undefined)
    ) {
      throw new BadRequestException(
        'Certification must reference a platform-hosted certification document',
      );
    }

    return document;
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

    if (doc.shipmentId === null || doc.shipmentId === undefined) {
      if (doc.uploaderId !== user.id && user.role !== UserRole.ADMIN) {
        throw new ForbiddenException(
          'Only the uploader or an admin can access this document',
        );
      }
      return doc;
    }

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
    const filePath = this.resolveStoredPath(doc.storedName);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on server');
    }

    return {
      filePath,
      originalName: this.sanitizeOriginalName(doc.originalName),
    };
  }

  // ── Delete ───────────────────────────────────────────────────────────────────

  private isForeignKeyViolation(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const candidate = error as {
      code?: unknown;
      driverError?: { code?: unknown };
    };
    return (
      candidate.code === '23503' || candidate.driverError?.code === '23503'
    );
  }

  async delete(id: string, user: User): Promise<void> {
    const doc = await this.findOne(id, user);

    // Only the uploader or admin can delete
    if (doc.uploaderId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only the uploader or an admin can delete this document',
      );
    }

    // A backing document is immutable provenance for its certification. The
    // database FK is RESTRICT as a final race-safe guard; this service check
    // turns the normal case into a useful 409 instead of a late FK error.
    const certification = await this.certificationRepo.findOne({
      where: { documentId: id },
    });
    if (certification) {
      throw new ConflictException(
        'Cannot delete a document referenced by a carrier certification',
      );
    }

    const filePath = this.resolveStoredPath(doc.storedName);
    try {
      // Remove the row first. If a certification is attached concurrently, the
      // RESTRICT FK fails and the file remains intact for the certification.
      await this.documentRepo.remove(doc);
    } catch (error: unknown) {
      if (this.isForeignKeyViolation(error)) {
        throw new ConflictException(
          'Cannot delete a document referenced by a carrier certification',
        );
      }
      throw error;
    }

    this.removeFileIfExists(filePath);
  }
}
