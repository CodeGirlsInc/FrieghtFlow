import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { QuoteStatus } from "../entities/freight-quote.entity"

export class UpdateQuoteDto {
  @ApiPropertyOptional({ description: "Updated price for the quote" })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number

  @ApiPropertyOptional({ enum: QuoteStatus, description: "Updated status" })
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus

  @ApiPropertyOptional({ description: "Additional notes" })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiPropertyOptional({ description: "Distance in kilometers" })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  distance?: number
}
