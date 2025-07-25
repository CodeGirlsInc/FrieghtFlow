import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  MaxLength,
} from 'class-validator';

export class WebhookPayloadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  source: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  eventType: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  eventId?: string;

  @IsObject()
  payload: Record<string, any>;

  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  userAgent?: string;
}
