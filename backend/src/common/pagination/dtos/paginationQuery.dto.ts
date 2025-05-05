import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @ApiPropertyOptional({
    example: '1',
    description: 'The page number of your query',
  })
  page?: number = 1;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @ApiPropertyOptional({
    example: '10',
    description: 'The number limit of resources you want per page',
  })
  limit?: number = 10;
}
