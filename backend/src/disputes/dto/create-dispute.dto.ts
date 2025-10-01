import { IsEnum, IsOptional, IsString, IsUUID, IsArray, ArrayMaxSize, ArrayUnique, Length } from 'class-validator';
import { DisputeCategory } from '../entities/dispute.entity';

export class CreateDisputeDto {
  @IsString()
  @Length(3, 255)
  title: string;

  @IsString()
  @Length(10, 5000)
  description: string;

  @IsEnum(DisputeCategory)
  category: DisputeCategory;

  @IsOptional()
  @IsUUID()
  againstPartnerId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique()
  evidenceUrls?: string[];
}