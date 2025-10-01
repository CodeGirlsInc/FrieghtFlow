import { PartialType } from '@nestjs/swagger';
import { CreateSustainabilityDto } from './create-sustainability.dto';

export class UpdateSustainabilityDto extends PartialType(CreateSustainabilityDto) {}
