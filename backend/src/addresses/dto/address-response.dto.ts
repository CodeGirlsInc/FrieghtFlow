import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'user-uuid' })
  userId: string;

  @ApiProperty({ example: 'Main Warehouse' })
  label: string;

  @ApiProperty({ example: '123 Freight Ave' })
  address: string;

  @ApiProperty({ example: 'Lagos' })
  city: string;

  @ApiProperty({ example: 'Nigeria' })
  country: string;

  @ApiPropertyOptional({ example: false })
  isDefault: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
