import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  Req,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common"
import type { Request } from "express"
import type { WebhooksService, PaginatedWebhookEvents } from "./webhooks.service"
import type { FilterWebhookEventsDto } from "./dto/filter-webhook-events.dto"
import type { WebhookEvent } from "./entities/webhook-event.entity"

@Controller("webhook")
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post(":source")
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    source: string,
    @Body() body: any,
    @Headers() headers: Record<string, string>,
    @Req() req: Request,
  ): Promise<{ success: boolean; eventId: string }> {
    // Get raw body for signature validation
    const rawBody = JSON.stringify(body)
    const ipAddress = this.getClientIp(req)

    const webhookEvent = await this.webhooksService.processWebhook(source, rawBody, headers, ipAddress)

    return {
      success: webhookEvent.signatureValid,
      eventId: webhookEvent.id,
    }
  }

  @Get("events")
  async getWebhookEvents(@Query() filterDto: FilterWebhookEventsDto): Promise<PaginatedWebhookEvents> {
    return this.webhooksService.findAll(filterDto)
  }

  @Get("events/:id")
  async getWebhookEvent(@Param("id", ParseUUIDPipe) id: string): Promise<WebhookEvent> {
    const event = await this.webhooksService.findOne(id)
    if (!event) {
      throw new BadRequestException("Webhook event not found")
    }
    return event
  }

  @Get("stats")
  async getWebhookStats(@Query("source") source?: string) {
    return this.webhooksService.getWebhookStats(source)
  }

  @Post("events/:id/retry")
  @HttpCode(HttpStatus.OK)
  async retryWebhookEvent(@Param("id", ParseUUIDPipe) id: string): Promise<WebhookEvent> {
    return this.webhooksService.retryFailedEvent(id)
  }

  private getClientIp(req: Request): string {
    return (
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      (req.headers["x-real-ip"] as string) ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      "0.0.0.0"
    )
  }
}
