import {
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
  IsObject,
  ValidateNested,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FreightJobStatus, Address } from '../entities/freight-job.entity';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateAddressDto implements Address {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ description: 'City name' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State or province' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({ description: 'Country name' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Latitude coordinate', required: false })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiProperty({ description: 'Longitude coordinate', required: false })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}

export class CreateFreightJobDto {
  @ApiProperty({ description: 'Job title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Detailed job description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Origin address', type: CreateAddressDto })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  originAddress: CreateAddressDto;

  @ApiProperty({ description: 'Destination address', type: CreateAddressDto })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  destinationAddress: CreateAddressDto;

  @ApiProperty({ description: 'Type of cargo (e.g., electronics, furniture)' })
  @IsString()
  @IsNotEmpty()
  cargoType: string;

  @ApiProperty({ description: 'Weight of cargo in kg' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  cargoWeight: number;

  @ApiProperty({ description: 'Pickup date and time' })
  @IsDateString()
  pickupDate: string;

  @ApiProperty({ description: 'Delivery date and time' })
  @IsDateString()
  deliveryDate: string;
}

export class UpdateFreightJobDto extends PartialType(CreateFreightJobDto) {
  @ApiProperty({ description: 'Job status', enum: FreightJobStatus, required: false })
  @IsOptional()
  @IsEnum(FreightJobStatus)
  status?: FreightJobStatus;
}

export class AssignCarrierDto {
  @ApiProperty({ description: 'Carrier ID to assign to the job' })
  @IsUUID()
  @IsNotEmpty()
  carrierId: string;
}

export class FreightJobResponseDto {
  @ApiProperty({ description: 'Job ID' })
  id: string;

  @ApiProperty({ description: 'Shipper ID' })
  shipperId: string;

  @ApiProperty({ description: 'Assigned Carrier ID', nullable: true })
  carrierId: string | null;

  @ApiProperty({ description: 'Job title' })
  title: string;

  @ApiProperty({ description: 'Job description' })
  description: string;

  @ApiProperty({ description: 'Origin address', type: CreateAddressDto })
  originAddress: Address;

  @ApiProperty({ description: 'Destination address', type: CreateAddressDto })
  destinationAddress: Address;

  @ApiProperty({ description: 'Cargo type' })
  cargoType: string;

  @ApiProperty({ description: 'Cargo weight in kg' })
  cargoWeight: number;

  @ApiProperty({ description: 'Estimated cost' })
  estimatedCost: number;

  @ApiProperty({ description: 'Job status', enum: FreightJobStatus })
  status: FreightJobStatus;

  @ApiProperty({ description: 'Pickup date' })
  pickupDate: Date;

  @ApiProperty({ description: 'Delivery date' })
  deliveryDate: Date;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export class PaginationDto {
  @ApiProperty({ description: 'Page number', default: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', default: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class FilterFreightJobsDto extends PaginationDto {
  @ApiProperty({ description: 'Filter by status', enum: FreightJobStatus, required: false })
  @IsOptional()
  @IsEnum(FreightJobStatus)
  status?: FreightJobStatus;

  @ApiProperty({ description: 'Filter by start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'Filter by end date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Search by title or description', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by city', required: false })
  @IsOptional()
  @IsString()
  city?: string;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Data items' })
  data: T[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;

  @ApiProperty({ description: 'Has next page' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Has previous page' })
  hasPreviousPage: boolean;
}
