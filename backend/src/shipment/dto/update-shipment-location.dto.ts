import { IsNumber, IsUUID, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateShipmentLocationDto {
  @IsUUID()
  shipmentId: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @IsOptional()
  @IsNumber()
  speed?: number;

  @IsOptional()
  @IsNumber()
  heading?: number;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}
