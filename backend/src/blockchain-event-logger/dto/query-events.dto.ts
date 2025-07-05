import { IsOptional, IsEnum, IsString, IsInt, IsDateString, Min, Max } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { EventType, EventStatus } from "../entities/blockchain-event.entity"
import { Transform } from "class-transformer"

export class QueryEventsDto {
  @ApiPropertyOptional({ description: "Filter by contract address" })
  @IsOptional()
  @IsString()
  contractAddress?: string

  @ApiPropertyOptional({ enum: EventType, description: "Filter by event type" })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType

  @ApiPropertyOptional({ enum: EventStatus, description: "Filter by event status" })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus

  @ApiPropertyOptional({ description: "Filter by transaction hash" })
  @IsOptional()
  @IsString()
  transactionHash?: string

  @ApiPropertyOptional({ description: "Filter events from this block number" })
  @IsOptional()
  @IsString()
  fromBlock?: string

  @ApiPropertyOptional({ description: "Filter events to this block number" })
  @IsOptional()
  @IsString()
  toBlock?: string

  @ApiPropertyOptional({ description: "Filter events from this date" })
  @IsOptional()
  @IsDateString()
  fromDate?: string

  @ApiPropertyOptional({ description: "Filter events to this date" })
  @IsOptional()
  @IsDateString()
  toDate?: string

  @ApiPropertyOptional({ description: "Number of results per page", default: 50, minimum: 1, maximum: 1000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  @Transform(({ value }) => Number.parseInt(value))
  limit?: number = 50

  @ApiPropertyOptional({ description: "Page offset", default: 0, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => Number.parseInt(value))
  offset?: number = 0

  @ApiPropertyOptional({ description: "Sort order", enum: ["ASC", "DESC"], default: "DESC" })
  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC" = "DESC"
}
