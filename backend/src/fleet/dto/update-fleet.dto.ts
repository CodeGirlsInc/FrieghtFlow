import { PartialType } from '@nestjs/mapped-types';
import { CreateFleetDto } from './create-carrier.dto';

export class UpdateFleetDto extends PartialType(CreateFleetDto) {}
