import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitPaymentDto {
  @IsString()
  @IsNotEmpty()
  signedXdr: string;
}
