import { IsUUID, IsNotEmpty, IsBoolean } from 'class-validator';

export class TypingDto {
  @IsUUID()
  @IsNotEmpty()
  freightJobId: string;

  @IsBoolean()
  @IsNotEmpty()
  isTyping: boolean;
}

