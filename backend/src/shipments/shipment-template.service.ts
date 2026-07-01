import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

export interface ShipmentTemplate {
  id: string;
  userId: string;
  name: string;
  origin: string;
  destination: string;
  cargoDescription: string;
  weightKg: number;
  price: number;
  currency: string;
}

type CreateTemplateDto = Omit<ShipmentTemplate, 'id'>;
type UpdateTemplateDto = Partial<Omit<ShipmentTemplate, 'id' | 'userId'>>;

@Injectable()
export class ShipmentTemplateService {
  // In production, replace with TypeORM repository
  private readonly templates = new Map<string, ShipmentTemplate>();
  private idSeq = 1;

  create(dto: CreateTemplateDto): ShipmentTemplate {
    const template: ShipmentTemplate = { id: String(this.idSeq++), ...dto };
    this.templates.set(template.id, template);
    return template;
  }

  findAll(userId: string): ShipmentTemplate[] {
    return [...this.templates.values()].filter((t) => t.userId === userId);
  }

  findOne(id: string, userId: string): ShipmentTemplate {
    const t = this.templates.get(id);
    if (!t) throw new NotFoundException('Template not found');
    if (t.userId !== userId) throw new ForbiddenException();
    return t;
  }

  update(id: string, userId: string, dto: UpdateTemplateDto): ShipmentTemplate {
    const t = this.findOne(id, userId);
    const updated = { ...t, ...dto };
    this.templates.set(id, updated);
    return updated;
  }

  remove(id: string, userId: string): void {
    this.findOne(id, userId);
    this.templates.delete(id);
  }

  buildShipmentFromTemplate(id: string, userId: string): Omit<ShipmentTemplate, 'id' | 'userId' | 'name'> {
    const { name: _n, id: _id, userId: _u, ...shipmentData } = this.findOne(id, userId);
    return shipmentData;
  }
}
