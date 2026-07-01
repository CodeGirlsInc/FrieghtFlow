import { IsArray, ArrayMinSize, ArrayMaxSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateShipmentDto } from './create-shipment.dto';

export class BatchCreateShipmentsDto {
  @ApiProperty({
    type: [CreateShipmentDto],
    description: 'Array of shipment objects to create (max 50)',
    minItems: 1,
    maxItems: 50,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreateShipmentDto)
  shipments: CreateShipmentDto[];
}
