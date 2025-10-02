import { IsString, IsNumber, IsDateString, IsNotEmpty, Min } from 'class-validator';

export class ConfirmCapacityDto {
  @IsString()
  @IsNotEmpty()
  carrierPublicKey: string;

  @IsString()
  @IsNotEmpty()
  vesselId: string;

  @IsNumber()
  @Min(0)
  availableCapacity: number;

  @IsDateString()
  estimatedDeparture: Date;

  @IsDateString()
  estimatedArrival: Date;
}