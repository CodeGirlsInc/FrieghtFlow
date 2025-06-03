import { IsUUID } from 'class-validator';

export class CreateShipmentDto {
  @IsUUID()
  shipperId: string;

  @IsUUID()
  customerId: string;
}
