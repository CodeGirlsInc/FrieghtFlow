import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsIn(['open', 'closed', 'escalated'])
  status: string;
}
