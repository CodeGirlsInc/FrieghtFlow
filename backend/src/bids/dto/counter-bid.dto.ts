import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CounterBidDto {
  @ApiProperty({ example: 1200.0 })
  @IsNumber()
  @IsPositive()
  counterPrice: number;

  @ApiPropertyOptional({ example: 'We can do it for a lower price.' })
  @IsString()
  @IsOptional()
  counterMessage?: string;
}
