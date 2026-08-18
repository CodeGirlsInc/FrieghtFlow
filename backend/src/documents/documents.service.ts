import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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

@Injectable()
export class DocumentsService {
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

  // ── Upload ───────────────────────────────────────────────────────────────────

  async upload(
    file: Express.Multer.File,
    dto: UploadDocumentDto,
    uploader: User,
  ): Promise<Document> {
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
      notes: dto.notes ?? null,
    });

    return this.documentRepo.save(doc);
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
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.documentRepo.remove(doc);
  }
}
