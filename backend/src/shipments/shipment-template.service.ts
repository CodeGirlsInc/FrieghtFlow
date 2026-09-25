import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import {
  ShipmentTemplate,
  ShipmentTemplateDraft,
} from './entities/shipment-template.entity';
import { CreateShipmentTemplateDto } from './dto/create-shipment-template.dto';
import { UpdateShipmentTemplateDto } from './dto/update-shipment-template.dto';

/**
 * Reusable shipment drafts, persisted per user.
 *
 * Ownership is the core invariant: every read/write is scoped by
 * `userId`, a template belonging to somebody else is reported as
 * `Forbidden` (not `NotFound`) so a caller can tell "not yours" from
 * "does not exist" — matching `AddressesService`.
 */
@Injectable()
export class ShipmentTemplateService {
  constructor(
    @InjectRepository(ShipmentTemplate)
    private readonly templateRepo: Repository<ShipmentTemplate>,
  ) {}

  async create(
    userId: string,
    dto: CreateShipmentTemplateDto,
  ): Promise<ShipmentTemplate> {
    const template = this.templateRepo.create({
      userId,
      name: dto.name,
      origin: dto.origin,
      destination: dto.destination,
      cargoDescription: dto.cargoDescription,
      weightKg: dto.weightKg,
      price: dto.price,
      currency: dto.currency ?? 'USD',
    });

    try {
      return await this.templateRepo.save(template);
    } catch (error) {
      // (user_id, name) is unique — surface a 409 instead of a 500.
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          `You already have a template named "${dto.name}"`,
        );
      }
      throw error;
    }
  }

  findAll(userId: string): Promise<ShipmentTemplate[]> {
    return this.templateRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Loads a template the caller owns.
   *
   * @throws NotFoundException when no template has that id.
   * @throws ForbiddenException when the template belongs to another user.
   */
  async findOne(id: string, userId: string): Promise<ShipmentTemplate> {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException(`Template ${id} not found`);
    if (template.userId !== userId) {
      throw new ForbiddenException('You do not own this shipment template');
    }
    return template;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateShipmentTemplateDto,
  ): Promise<ShipmentTemplate> {
    const template = await this.findOne(id, userId);

    if (dto.name !== undefined) template.name = dto.name;
    if (dto.origin !== undefined) template.origin = dto.origin;
    if (dto.destination !== undefined) template.destination = dto.destination;
    if (dto.cargoDescription !== undefined) {
      template.cargoDescription = dto.cargoDescription;
    }
    if (dto.weightKg !== undefined) template.weightKg = dto.weightKg;
    if (dto.price !== undefined) template.price = dto.price;
    if (dto.currency !== undefined) template.currency = dto.currency;

    try {
      return await this.templateRepo.save(template);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          `You already have a template named "${template.name}"`,
        );
      }
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const template = await this.findOne(id, userId);
    await this.templateRepo.remove(template);
  }

  /**
   * Projects a template into the payload needed to pre-fill
   * `POST /shipments`, dropping the template's own bookkeeping fields.
   *
   * `weight_kg` / `price` are coerced back to numbers so the draft's shape
   * is identical to `CreateShipmentDto` even if a caller supplied a
   * repository that bypassed the column transformer.
   */
  async buildShipmentFromTemplate(
    id: string,
    userId: string,
  ): Promise<ShipmentTemplateDraft> {
    const template = await this.findOne(id, userId);

    return {
      origin: template.origin,
      destination: template.destination,
      cargoDescription: template.cargoDescription,
      weightKg: Number(template.weightKg),
      price: Number(template.price),
      currency: template.currency,
    };
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error as QueryFailedError & { driverError?: { code?: string } })
        .driverError?.code === '23505'
    );
  }
}
