import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsUUID, IsNotEmpty } from "class-validator"
import { RouteStatus } from "../entities/logistics-route.entity"

export class CreateLogisticsRouteDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  origin: string

  @IsString()
  @IsNotEmpty()
  destination: string

  @IsNumber()
  distance: number

  @IsNumber()
  estimatedDuration: number

  @IsNumber()
  cost: number

  @IsEnum(RouteStatus)
  @IsOptional()
  status?: RouteStatus

  @IsArray()
  @IsOptional()
  waypoints?: string[]

  @IsUUID()
  organizationId: string
}
