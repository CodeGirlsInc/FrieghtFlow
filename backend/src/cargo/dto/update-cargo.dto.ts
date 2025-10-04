import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCargoDto } from './create-cargo.dto';

export class UpdateCargoDto extends PartialType(
  OmitType(CreateCargoDto, ['shipmentId'] as const),
) {}