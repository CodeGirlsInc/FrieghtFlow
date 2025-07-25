import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  Max,
} from 'class-validator';

export class SetCacheDto {
  @IsString()
  key: string;

  value: any;

  @IsOptional()
  @IsNumber()
  @Min(1)
  ttl?: number;

  @IsOptional()
  @IsString()
  namespace?: string;

  @IsOptional()
  @IsBoolean()
  nx?: boolean;
}

export class GetCacheDto {
  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  namespace?: string;
}

export class DeleteCacheDto {
  @IsArray()
  @IsString({ each: true })
  keys: string[];

  @IsOptional()
  @IsString()
  namespace?: string;
}

export class ExpireCacheDto {
  @IsString()
  key: string;

  @IsNumber()
  @Min(1)
  seconds: number;

  @IsOptional()
  @IsString()
  namespace?: string;
}

export class KeysDto {
  @IsString()
  pattern: string;

  @IsOptional()
  @IsString()
  namespace?: string;
}

export class ClearCacheDto {
  @IsOptional()
  @IsString()
  namespace?: string;
}

export class WarmupCacheDto {
  @IsArray()
  @IsString({ each: true })
  shipmentIds: string[];
}

export class ShipmentQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}
