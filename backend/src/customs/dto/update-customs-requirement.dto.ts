import { PartialType } from '@nestjs/swagger';
import { CreateCustomsRequirementDto } from './create-customs-requirement.dto';

export class UpdateCustomsRequirementDto extends PartialType(CreateCustomsRequirementDto) {}
