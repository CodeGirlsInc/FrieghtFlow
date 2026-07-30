import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  // Email notification toggles
  @ApiPropertyOptional() @IsBoolean() @IsOptional() shipmentAccepted?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() shipmentInTransit?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() shipmentDelivered?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() shipmentCompleted?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() shipmentCancelled?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() shipmentDisputed?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() disputeResolved?: boolean;
  
  // SMS notification toggles
  @ApiPropertyOptional() @IsBoolean() @IsOptional() smsEnabled?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() smsShipmentAccepted?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() smsShipmentInTransit?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() smsShipmentDelivered?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() smsShipmentCompleted?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() smsShipmentCancelled?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() smsShipmentDisputed?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() smsDisputeResolved?: boolean;
}