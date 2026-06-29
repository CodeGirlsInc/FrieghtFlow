import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiKeyResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'Payment Integration Key' })
  name: string;

  @ApiProperty({ example: 'a1b2c3d4', description: 'First 8 chars of the key' })
  prefix: string;

  @ApiPropertyOptional({ nullable: true })
  expiresAt: Date | null;

  @ApiPropertyOptional({ nullable: true })
  lastUsedAt: Date | null;

  @ApiProperty()
  createdAt: Date;
}

export class CreateApiKeyResponseDto extends ApiKeyResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4e5f6...',
    description: 'Full API key — shown once only, store it securely',
  })
  key: string;
}
