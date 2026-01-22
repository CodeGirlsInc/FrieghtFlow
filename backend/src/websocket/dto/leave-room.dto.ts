import { IsUUID, IsNotEmpty } from 'class-validator';

export class LeaveRoomDto {
  @IsUUID()
  @IsNotEmpty()
  freightJobId: string;
}

