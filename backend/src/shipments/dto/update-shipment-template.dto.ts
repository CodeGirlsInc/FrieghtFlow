import { PartialType } from '@nestjs/swagger';
import { CreateShipmentTemplateDto } from './create-shipment-template.dto';

/**
 * Body for `PATCH /shipments/templates/:id`. `name` is mutable, but the
 * owning `userId` never is.
 */
export class UpdateShipmentTemplateDto extends PartialType(
  CreateShipmentTemplateDto,
) {}
