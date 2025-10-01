import { PartialType } from '@nestjs/swagger';
import { CreateEmissionDto } from './create-emission.dto';

export class UpdateEmissionDto extends PartialType(CreateEmissionDto) {}
