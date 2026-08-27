import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BatchItemResultDto {
  @ApiProperty({
    description: 'Index of the item in the original batch (0-based)',
  })
  index: number;

  @ApiProperty({ description: 'Whether this item was successfully created' })
  success: boolean;

  @ApiPropertyOptional({
    description: 'ID of the created shipment (only present if success=true)',
  })
  id?: string;

  @ApiPropertyOptional({
    description:
      'Error message if the item failed (only present if success=false)',
  })
  error?: string;
}

export class BatchCreateResultDto {
  @ApiProperty({ description: 'Total number of items in the batch' })
  total: number;

  @ApiProperty({ description: 'Number of items successfully created' })
  succeeded: number;

  @ApiProperty({ description: 'Number of items that failed validation' })
  failed: number;

  @ApiProperty({
    type: [BatchItemResultDto],
    description: 'Per-item results with success/failure status and details',
  })
  items: BatchItemResultDto[];
}
