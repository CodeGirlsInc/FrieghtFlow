import { Controller, Post, Headers, HttpCode, HttpStatus, Get, Param, Query, UseGuards, Body } from "@nestjs/common"
import type { WebhookService } from "../services/webhook.service"
import type { WebhookRetryService } from "../services/webhook-retry.service"
import type { WebhookEventDto } from "../dto/webhook-event.dto"
import { ApiKeyGuard } from "../guards/api-key.guard"

@Controller("webhooks")
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly webhookRetryService: WebhookRetryService,
  ) {}

  @Post("generic")
  @HttpCode(HttpStatus.OK)
  async handleGenericWebhook(
    @Body() webhookData: WebhookEventDto,
    @Headers() headers: Record<string, any>,
  ): Promise<any> {
    webhookData.headers = headers
    return this.webhookService.processWebhook(webhookData)
  }

  @Get("failed")
  @UseGuards(ApiKeyGuard)
  async getFailedWebhooks(
    @Query('provider') provider?: string,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    return this.webhookService.getFailedWebhooks(provider, limit, offset)
  }

  @Post('replay/:id')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  async replayWebhook(@Param('id') id: string) {
    return this.webhookRetryService.replayWebhook(id);
  }

  @Post('replay-all-failed')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  async replayAllFailedWebhooks(@Query('provider') provider?: string) {
    return this.webhookRetryService.replayAllFailedWebhooks(provider);
  }
}
