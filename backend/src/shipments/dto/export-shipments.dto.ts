import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class ExportShipmentsDto {
  @ApiPropertyOptional({
    enum: ['csv', 'json'],
    default: 'json',
    description: 'Export format. Responses are streamed for large datasets.',
  })
  @IsOptional()
  @IsIn(['csv', 'json'])
  format: 'csv' | 'json' = 'json';
}
