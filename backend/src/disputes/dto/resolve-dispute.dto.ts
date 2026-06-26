import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResolveDisputeDto {
  @ApiProperty({ example: 'Refund issued to shipper' })
  @IsString()
  resolutionNote: string;
}
