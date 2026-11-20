import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAuditLogDto {
  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by action type' })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiPropertyOptional({ description: 'Only entries performed by this admin' })
  @IsUUID()
  @IsOptional()
  adminId?: string;

  @ApiPropertyOptional({ description: 'Filter by target type, e.g. payment' })
  @IsString()
  @IsOptional()
  targetType?: string;

  @ApiPropertyOptional({ description: 'Filter by target id' })
  @IsString()
  @IsOptional()
  targetId?: string;

  @ApiPropertyOptional({ description: 'Only entries created at or after this ISO date' })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ description: 'Only entries created at or before this ISO date' })
  @IsDateString()
  @IsOptional()
  to?: string;
}
