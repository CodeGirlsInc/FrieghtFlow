import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional() @IsBoolean() @IsOptional() shipmentAccepted?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() shipmentInTransit?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() shipmentDelivered?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() shipmentCompleted?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() shipmentCancelled?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() shipmentDisputed?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() disputeResolved?: boolean;
}
