import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as crypto from 'crypto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Document } from './entities/document.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/role.enum';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Readable } from 'stream';

const CLOUDINARY_FOLDER = 'freightflow/documents';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    private readonly cloudinary: CloudinaryService,
    private readonly httpService: HttpService,
  ) {}

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

  private assertOwnerOrAdmin(doc: Document, user: User): void {
    if (doc.uploaderId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only the uploader or an admin can access this document',
      );
    }
  }

  private computeSha256(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  async upload(
    file: Express.Multer.File,
    dto: UploadDocumentDto,
    uploader: User,
  ): Promise<Document> {
    const shipment = await this.getShipmentOrThrow(dto.shipmentId);
    this.assertIsParty(shipment, uploader);

    const sha256Hash = this.computeSha256(file.buffer);

    const result = await this.cloudinary.uploadBuffer(
      file.buffer,
      CLOUDINARY_FOLDER,
      sha256Hash,
    );

    const doc = this.documentRepo.create({
      shipmentId: dto.shipmentId,
      uploaderId: uploader.id,
      documentType: dto.documentType,
      originalName: file.originalname,
      storedName: result.public_id,
      mimetype: file.mimetype,
      sizeBytes: file.size,
      sha256Hash,
      storedUrl: result.secure_url,
      ipfsCid: null,
      notes: dto.notes ?? null,
    });

    const saved = await this.documentRepo.save(doc);

    this.enqueueIpfsPin(saved.id, saved.storedUrl!).catch(() => {
      // Silently ignore — job will be retried or handled by worker
    });

    return saved;
  }

  private async enqueueIpfsPin(
    documentId: string,
    cloudinaryUrl: string,
  ): Promise<void> {
    // TODO: Replace with BullMQ queue.add('ipfs-pin', { documentId, cloudinaryUrl })
    console.log(
      `[IPFS Pin] Enqueued: documentId=${documentId}, url=${cloudinaryUrl}`,
    );
  }

  async listUserDocuments(
    user: User,
    page = 1,
    limit = 20,
    documentType?: string,
    shipmentId?: string,
  ): Promise<{ data: Document[]; total: number; page: number; limit: number }> {
    const qb = this.documentRepo
      .createQueryBuilder('doc')
      .where('doc.uploader_id = :userId', { userId: user.id })
      .andWhere('doc.deleted_at IS NULL');

    if (documentType) {
      qb.andWhere('doc.document_type = :documentType', { documentType });
    }
    if (shipmentId) {
      qb.andWhere('doc.shipment_id = :shipmentId', { shipmentId });
    }

    qb.orderBy('doc.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async listByShipment(shipmentId: string, user: User): Promise<Document[]> {
    const shipment = await this.getShipmentOrThrow(shipmentId);
    this.assertIsParty(shipment, user);

    return this.documentRepo.find({
      where: { shipmentId },
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User): Promise<Document> {
    const doc = await this.documentRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['uploader'],
    });
    if (!doc) throw new NotFoundException(`Document ${id} not found`);

    this.assertOwnerOrAdmin(doc, user);
    return doc;
  }

  async download(
    id: string,
    user: User,
  ): Promise<{ stream: Readable; mimetype: string; originalName: string }> {
    const doc = await this.findOne(id, user);

    if (!doc.storedUrl) {
      throw new NotFoundException('File URL not available');
    }

    const response = await firstValueFrom(
      this.httpService.get(doc.storedUrl, { responseType: 'stream' }),
    );

    return {
      stream: response.data as Readable,
      mimetype: doc.mimetype,
      originalName: doc.originalName,
    };
  }

  async delete(id: string, user: User): Promise<void> {
    const doc = await this.findOne(id, user);
    this.assertOwnerOrAdmin(doc, user);

    if (doc.storedName) {
      await this.cloudinary.destroy(doc.storedName);
    }

    await this.documentRepo.softRemove(doc);
  }
}
