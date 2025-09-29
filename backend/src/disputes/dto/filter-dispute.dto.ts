import { IsOptional, IsEnum, IsUUID, IsDateString, IsString } from 'class-validator';
import { DisputeStatus, DisputeCategory } from '../entities/dispute.entity';

export class FilterDisputeDto {
  @IsOptional()
  @IsEnum(DisputeStatus)
  status?: DisputeStatus;

  @IsOptional()
  @IsEnum(DisputeCategory)
  category?: DisputeCategory;

  @IsOptional()
  @IsUUID()
  raisedByUserId?: string;

  @IsOptional()
  @IsUUID()
  againstPartnerId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  search?: string;
}