import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber, Min } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class PredictionRequestDto {
  @ApiProperty({ description: "Origin location", example: "New York, NY" })
  @IsString()
  @IsNotEmpty()
  origin: string

  @ApiProperty({ description: "Destination location", example: "Los Angeles, CA" })
  @IsString()
  @IsNotEmpty()
  destination: string

  @ApiProperty({ description: "Carrier name", example: "FedEx" })
  @IsString()
  @IsNotEmpty()
  carrier: string

  @ApiProperty({ description: "Shipment date", example: "2024-01-15" })
  @IsDateString()
  shipmentDate: string

  @ApiPropertyOptional({ description: "Distance in miles", example: 2800 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number

  @ApiPropertyOptional({ description: "Weather condition", example: "clear" })
  @IsOptional()
  @IsString()
  weatherCondition?: string
}
