import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  adminId: string;

  @ApiProperty({ example: 'USER_DEACTIVATED' })
  action: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  targetType: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  targetId: string | null;

  @ApiPropertyOptional({ type: Object, nullable: true })
  metadata: Record<string, unknown> | null;

  @ApiProperty()
  createdAt: Date;
}

export class PaginatedAuditLogResponseDto {
  @ApiProperty({ type: [AuditLogResponseDto] })
  data: AuditLogResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
