import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { CargoType, QuoteStatus } from "../entities/freight-quote.entity"

export class QuoteResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  requesterId: string

  @ApiProperty({ enum: CargoType })
  cargoType: CargoType

  @ApiProperty()
  weight: number

  @ApiProperty()
  origin: string

  @ApiProperty()
  destination: string

  @ApiPropertyOptional()
  price?: number

  @ApiProperty({ enum: QuoteStatus })
  status: QuoteStatus

  @ApiPropertyOptional()
  distance?: number

  @ApiPropertyOptional()
  notes?: string

  @ApiPropertyOptional()
  expiresAt?: Date

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
