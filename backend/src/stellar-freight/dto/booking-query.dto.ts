import { IsOptional, IsString, IsEnum } from 'class-validator';
import { BookingStatus } from '../enums/booking-status.enum';

export class BookingQueryDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  shipperPublicKey?: string;

  @IsOptional()
  @IsString()
  carrierPublicKey?: string;
}
