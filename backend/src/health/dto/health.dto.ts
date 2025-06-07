import { ApiProperty } from "@nestjs/swagger"

export class HealthStatusDto {
  @ApiProperty({ example: "ok" })
  status: string

  @ApiProperty()
  info: Record<string, any>

  @ApiProperty()
  error: Record<string, any>

  @ApiProperty()
  details: Record<string, any>
}

export class DetailedHealthDto extends HealthStatusDto {
  @ApiProperty()
  metrics: {
    database: any
    system: any
    application: any
  }

  @ApiProperty()
  timestamp: string

  @ApiProperty()
  version: string

  @ApiProperty()
  environment: string
}

export class LivenessDto {
  @ApiProperty({ example: "ok" })
  status: string

  @ApiProperty()
  info: {
    uptime: any
  }
}

export class ReadinessDto {
  @ApiProperty({ example: "ok" })
  status: string

  @ApiProperty()
  info: {
    database: any
    memory_heap: any
  }
}
