import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsIn(['billing', 'delivery', 'bug', 'other'])
  category: string;

  @IsString()
  subject: string;

  @IsString()
  message: string;
}
