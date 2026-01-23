import { IsUUID, IsNotEmpty } from 'class-validator';

export class JoinRoomDto {
  @IsUUID()
  @IsNotEmpty()
  freightJobId: string;
}

