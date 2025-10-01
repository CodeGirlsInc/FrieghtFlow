import { IsUUID } from 'class-validator';

export class AssignCarrierDto {
  @IsUUID()
  shipmentId: string;

  @IsUUID()
  carrierId: string;
}
