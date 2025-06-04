import { Controller, Post, Body, Headers, HttpCode, HttpStatus, UseGuards } from "@nestjs/common"
import type { Request } from "express"
import type { StripeWebhookService } from "../services/stripe-webhook.service"
import type { StripeWebhookDto } from "../dto/webhook-event.dto"
import { StripeSignatureGuard } from "../guards/stripe-signature.guard"

interface RawBodyRequest extends Request {
  rawBody: Buffer
}

@Controller("webhooks/stripe")
export class StripeWebhookController {
  constructor(private readonly stripeWebhookService: StripeWebhookService) {}

  @Post()
  @UseGuards(StripeSignatureGuard)
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    request: RawBodyRequest,
    @Body() webhookData: StripeWebhookDto,
    @Headers() headers: Record<string, any>,
  ) {
    webhookData.headers = headers
    return this.stripeWebhookService.processStripeWebhook(webhookData, request.rawBody)
  }
}
