import { IsString, IsArray, IsEnum, IsOptional, IsBoolean, IsInt, IsObject, Min } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { EventType } from "../entities/blockchain-event.entity"
import { SubscriptionStatus } from "../entities/contract-subscription.entity"

export class CreateSubscriptionDto {
  @ApiProperty({ description: "Name of the subscription", example: "FreightFlow Main Contract" })
  @IsString()
  name: string

  @ApiProperty({
    description: "StarkNet contract address",
    example: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  })
  @IsString()
  contractAddress: string

  @ApiProperty({
    enum: EventType,
    isArray: true,
    description: "Event types to subscribe to",
  })
  @IsArray()
  @IsEnum(EventType, { each: true })
  eventTypes: EventType[]

  @ApiPropertyOptional({
    enum: SubscriptionStatus,
    description: "Initial subscription status",
    default: SubscriptionStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus

  @ApiPropertyOptional({
    description: "Block number to start monitoring from",
    example: "100000",
  })
  @IsOptional()
  @IsString()
  fromBlock?: string

  @ApiPropertyOptional({
    description: "Maximum retry attempts for failed events",
    default: 3,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxRetries?: number

  @ApiPropertyOptional({
    description: "Delay between retries in milliseconds",
    default: 5000,
    minimum: 1000,
  })
  @IsOptional()
  @IsInt()
  @Min(1000)
  retryDelayMs?: number

  @ApiPropertyOptional({ description: "Additional filter criteria for events" })
  @IsOptional()
  @IsObject()
  filterCriteria?: Record<string, any>

  @ApiPropertyOptional({ description: "Description of the subscription" })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: "Whether the subscription is active", default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
