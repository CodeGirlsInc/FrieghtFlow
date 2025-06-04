import { Controller, Post, Headers, Body, HttpCode, HttpStatus, UseGuards } from "@nestjs/common"
import type { StellarService } from "../services/stellar.service"
import { StellarSignatureGuard } from "../guards/stellar-signature.guard"

@Controller("webhooks/stellar")
export class StellarWebhookController {
  constructor(private readonly stellarService: StellarService) {}

  @Post()
  @UseGuards(StellarSignatureGuard)
  @HttpCode(HttpStatus.OK)
  async handleStellarWebhook(@Headers() headers: any, @Body() payload: any) {
    try {
      return await this.stellarService.handleWebhook(payload, headers)
    } catch (error) {
      // We always return 200 to prevent retries
      // But we log the error internally
      console.error("Error processing Stellar webhook:", error)
      return { received: true }
    }
  }
}
