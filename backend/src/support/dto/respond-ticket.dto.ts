import { IsNotEmpty, IsString } from 'class-validator';

export class RespondTicketDto {
  @IsNotEmpty()
  @IsString()
  responderId: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
