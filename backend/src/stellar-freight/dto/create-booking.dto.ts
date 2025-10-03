import {
  IsString,
  IsNumber,
  IsDateString,
  IsObject,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  shipperPublicKey: string;

  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsObject()
  cargoDetails: {
    type: string;
    weight: number;
    volume: number;
    specialRequirements?: string[];
  };

  @IsNumber()
  @Min(0)
  rate: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsDateString()
  validUntil: Date;
}