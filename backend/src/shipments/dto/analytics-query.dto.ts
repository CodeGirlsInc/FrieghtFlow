import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    description:
      'Start of the date range (ISO 8601). Date-only values (YYYY-MM-DD) are treated as the start of that day (00:00:00 UTC).',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description:
      'End of the date range (ISO 8601, inclusive). A date-only value (YYYY-MM-DD) is treated as the end of that day: shipments created on that day are included. Full timestamps keep their exact meaning.',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
