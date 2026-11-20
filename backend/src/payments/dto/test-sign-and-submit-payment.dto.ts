import { IsNotEmpty, IsString } from 'class-validator';

// TEST ONLY — see PaymentsService.testSignAndSubmitFunding. Never used by
// the real (non-custodial) diner/shipper-facing flow.
export class TestSignAndSubmitPaymentDto {
  @IsString()
  @IsNotEmpty()
  shipperSecret: string;
}
