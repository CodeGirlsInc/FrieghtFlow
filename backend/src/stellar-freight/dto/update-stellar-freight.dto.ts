import { PartialType } from '@nestjs/mapped-types';
import { CreateStellarFreightDto } from './create-stellar-freight.dto';

export class UpdateStellarFreightDto extends PartialType(CreateStellarFreightDto) {}
