import { IsString, IsEnum, IsInt, IsOptional, IsBoolean, IsObject, Min } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { SLAType, SLAPriority } from "../entities/sla-rule.entity"

export class CreateSLARuleDto {
  @ApiProperty({ description: "Name of the SLA rule", example: "Standard Delivery SLA" })
  @IsString()
  name: string

  @ApiPropertyOptional({ description: "Description of the SLA rule" })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ enum: SLAType, description: "Type of SLA rule" })
  @IsEnum(SLAType)
  ruleType: SLAType

  @ApiProperty({ enum: SLAPriority, description: "Priority level of the SLA" })
  @IsEnum(SLAPriority)
  priority: SLAPriority

  @ApiProperty({ description: "SLA threshold in minutes", example: 4320, minimum: 1 })
  @IsInt()
  @Min(1)
  thresholdMinutes: number

  @ApiPropertyOptional({ description: "Grace period in minutes", example: 60, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  gracePeriodMinutes?: number

  @ApiPropertyOptional({ description: "Additional conditions for the SLA rule" })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>

  @ApiProperty({
    description: "Actions to take when SLA is breached",
    example: {
      alertEmails: ["admin@company.com"],
      webhookUrl: "https://api.company.com/sla-breach",
      penaltyAmount: 100,
    },
  })
  @IsObject()
  actions: {
    alertEmails?: string[]
    webhookUrl?: string
    smartContractAddress?: string
    penaltyAmount?: number
    escalationLevel?: number
  }

  @ApiPropertyOptional({ description: "Whether the rule is active", default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
