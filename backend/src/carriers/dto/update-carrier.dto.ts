import { PartialType } from '@nestjs/mapped-types';
import { CreateCarrierDto } from './create-carrier.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCarrierDto extends PartialType(CreateCarrierDto) {
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}