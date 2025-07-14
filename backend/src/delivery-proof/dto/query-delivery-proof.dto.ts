import { Transform, Type } from "class-transformer"
import { IsOptional, IsEnum, IsString, IsNumber, Min, Max, IsDateString } from "class-validator"
import { ProofType, ProofStatus } from "../entities/delivery-proof.entity"

export class QueryDeliveryProofDto {
  @IsOptional()
  @IsString()
  deliveryId?: string

  @IsOptional()
  @IsEnum(ProofType)
  proofType?: ProofType

  @IsOptional()
  @IsEnum(ProofStatus)
  status?: ProofStatus

  @IsOptional()
  @IsDateString()
  fromDate?: string

  @IsOptional()
  @IsDateString()
  toDate?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0

  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt"

  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  @Transform(({ value }) => value?.toUpperCase())
  sortOrder?: "ASC" | "DESC" = "DESC"
}
