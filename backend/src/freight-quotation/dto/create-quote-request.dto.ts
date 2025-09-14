import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { CargoType } from "../entities/freight-quote.entity"

export class CreateQuoteRequestDto {
  @ApiProperty({ description: "ID of the user requesting the quote" })
  @IsNotEmpty()
  @IsString()
  requesterId: string

  @ApiProperty({ enum: CargoType, description: "Type of cargo being shipped" })
  @IsEnum(CargoType)
  cargoType: CargoType

  @ApiProperty({ description: "Weight of cargo in kilograms", minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  weight: number

  @ApiProperty({ description: "Origin location" })
  @IsNotEmpty()
  @IsString()
  origin: string

  @ApiProperty({ description: "Destination location" })
  @IsNotEmpty()
  @IsString()
  destination: string

  @ApiPropertyOptional({ description: "Additional notes or requirements" })
  @IsOptional()
  @IsString()
  notes?: string
}
