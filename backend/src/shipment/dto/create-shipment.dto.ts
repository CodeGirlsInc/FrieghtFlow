import { IsString, IsNotEmpty, IsOptional, IsISO8601, IsNumber, Min, IsEnum, Length } from "class-validator";
import { ShipmentStatus } from "../shipment.entity";

export class CreateShipmentDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  origin: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  destination: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  carrier: string;

  @IsOptional()
  @IsISO8601()
  estimatedDelivery?: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  freightDetails?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  weightUnit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dimensions?: number;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  dimensionUnit?: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  notes?: string;
}
