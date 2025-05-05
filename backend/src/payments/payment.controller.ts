import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  type RawBodyRequest,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import type { Request } from "express"
import type { PaymentService } from "./payment.service"
import type { CreatePaymentDto, PaymentResponseDto } from "./interfaces/payment-provider.interface"

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post(':provider')
  async createPayment(
    @Param('provider') providerName: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.createPayment(providerName, createPaymentDto);
  }

  @Get(':id')')
  async getPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentService.getPayment(id);
  }

  @Post(':id/cancel')
  async cancelPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentService.cancelPayment(id);
  }

  @Post(':id/refund')
  async refundPayment(
    @Param('id') id: string,
    @Body('amount') amount?: number,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.refundPayment(id, amount);
  }

  @Post('webhooks/stripe')
  @HttpCode(HttpStatus.OK)
  async stripeWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<any> {
    const payload = request.rawBody;
    return this.paymentService.handleWebhook('stripe', payload, signature);
  }

  @Post('webhooks/starknet')
  @HttpCode(HttpStatus.OK)
  async starknetWebhook(@Body() payload: any): Promise<any> {
    return this.paymentService.handleWebhook('starknet', payload);
  }
}
