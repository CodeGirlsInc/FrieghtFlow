import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateWebhookDto {
  @ApiProperty({ example: 'https://partner.example.com/webhooks/freightflow' })
  @IsUrl({ require_tld: true, require_protocol: true })
  url: string;

  @ApiProperty({
    example: 'whsec_test_123',
    description: 'Shared secret used to verify the HMAC signature.',
  })
  @IsString()
  @MaxLength(255)
  secret: string;

  @ApiPropertyOptional({ example: ['shipment.status_changed'], isArray: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  events?: string[];
}
