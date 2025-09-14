import { IsOptional, IsEnum, IsDateString, IsString, IsNumberString } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { QuoteStatus, CargoType } from "../entities/freight-quote.entity"

export class QuoteFiltersDto {
  @ApiPropertyOptional({ description: "Filter by requester ID" })
  @IsOptional()
  @IsString()
  requesterId?: string

  @ApiPropertyOptional({ enum: QuoteStatus, description: "Filter by quote status" })
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus

  @ApiPropertyOptional({ enum: CargoType, description: "Filter by cargo type" })
  @IsOptional()
  @IsEnum(CargoType)
  cargoType?: CargoType

  @ApiPropertyOptional({ description: "Filter from date (ISO string)" })
  @IsOptional()
  @IsDateString()
  fromDate?: string

  @ApiPropertyOptional({ description: "Filter to date (ISO string)" })
  @IsOptional()
  @IsDateString()
  toDate?: string
}

export class PaginationDto {
  @ApiPropertyOptional({ description: "Page number", default: 1, minimum: 1 })
  @IsOptional()
  @IsNumberString()
  page?: string

  @ApiPropertyOptional({ description: "Items per page", default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumberString()
  limit?: string
}
