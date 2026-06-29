import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'admin-uuid' })
  adminId: string;

  @ApiProperty({ example: 'USER_DEACTIVATED' })
  action: string;

  @ApiPropertyOptional({ example: 'User', nullable: true })
  targetType: string | null;

  @ApiPropertyOptional({ example: 'target-uuid', nullable: true })
  targetId: string | null;

  @ApiPropertyOptional({ nullable: true, additionalProperties: true })
  metadata: Record<string, unknown> | null;

  @ApiProperty()
  createdAt: Date;
}
