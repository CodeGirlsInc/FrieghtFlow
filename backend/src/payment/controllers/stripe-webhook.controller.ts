import { Controller, Post, Headers, Body, Req, HttpCode, HttpStatus, UseGuards } from "@nestjs/common"
import type { Request } from "express"
import type { StripeService } from "../services/stripe.service"
import { StripeSignatureGuard } from "../../webhook/guards/stripe-signature.guard"

interface RawBodyRequest extends Request {
  rawBody: Buffer
}

@Controller("webhooks/stripe")
export class StripeWebhookController {
  constructor(private readonly stripeService: StripeService) {}

  @Post()
  @UseGuards(StripeSignatureGuard)
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(@Body() payload: any, @Headers() headers: any, @Req() request: RawBodyRequest) {
    try {
      return await this.stripeService.handleWebhook(payload, headers, request.rawBody)
    } catch (error) {
      // We always return 200 to Stripe to prevent retries
      // But we log the error internally
      console.error("Error processing Stripe webhook:", error)
      return { received: true }
    }
  }
}
