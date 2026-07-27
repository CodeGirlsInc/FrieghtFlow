import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a Stripe Checkout session for a shipment' })
  @ApiResponse({ status: 201, description: 'Checkout session created' })
  createCheckout(@CurrentUser() user: User, @Body() dto: CreateCheckoutDto) {
    return this.paymentsService.createCheckoutSession(dto.shipmentId, user.id);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook receiver (raw body)' })
  @ApiResponse({ status: 200, description: 'Webhook acknowledged' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = this.paymentsService.constructWebhookEvent(
      req.rawBody!,
      signature,
    );
    return this.paymentsService.handleWebhook(event);
  }

  @Get('invoice/:shipmentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invoice for a shipment' })
  @ApiParam({
    name: 'shipmentId',
    example: 'b2a1c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Invoice returned' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  getInvoice(@Param('shipmentId', ParseUUIDPipe) shipmentId: string) {
    return this.paymentsService.getInvoice(shipmentId);
  }
}
