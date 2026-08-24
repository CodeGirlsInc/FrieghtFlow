import { Controller, Get, Post, Body } from '@nestjs/common';
import { PaymentReconciliationService, DisputeResolutionRequest } from '../services/payment-reconciliation.service';

@Controller('api/v1/payments')
export class PaymentReconciliationController {
  constructor(private readonly reconciliationService: PaymentReconciliationService) {}

  @Get('reconciliation/mismatches')
  getOpenMismatches() {
    return {
      success: true,
      mismatches: this.reconciliationService.getOpenMismatches(),
    };
  }

  @Post('dispute/resolve')
  async resolveDispute(@Body() body: DisputeResolutionRequest) {
    const res = await this.reconciliationService.resolveDispute(body);
    return {
      success: true,
      ...res,
    };
  }
}
