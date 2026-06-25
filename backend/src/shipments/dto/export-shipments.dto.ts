import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class ExportShipmentsDto {
  @ApiPropertyOptional({
    enum: ['csv', 'json', 'xlsx'],
    default: 'json',
    description:
      'Export format. CSV and JSON responses are streamed; XLSX is buffered.',
  })
  @IsOptional()
  @IsIn(['csv', 'json', 'xlsx'])
  format: 'csv' | 'json' | 'xlsx' = 'json';
}
