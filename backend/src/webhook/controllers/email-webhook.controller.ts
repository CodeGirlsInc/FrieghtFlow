import { Controller, Post, Headers, HttpCode, HttpStatus, UseGuards, Body } from "@nestjs/common"
import type { EmailWebhookService } from "../services/email-webhook.service"
import type { EmailWebhookDto } from "../dto/webhook-event.dto"
import { EmailSignatureGuard } from "../guards/email-signature.guard"

@Controller("webhooks/email")
export class EmailWebhookController {
  constructor(private readonly emailWebhookService: EmailWebhookService) {}

  @Post()
  @UseGuards(EmailSignatureGuard)
  @HttpCode(HttpStatus.OK)
  async handleEmailWebhook(@Body() webhookData: EmailWebhookDto, @Headers() headers: Record<string, any>) {
    webhookData.headers = headers
    return this.emailWebhookService.processEmailWebhook(webhookData)
  }
}
