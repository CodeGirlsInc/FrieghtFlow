import { Injectable, type CanActivate, type ExecutionContext, Logger, BadRequestException } from "@nestjs/common"
import type { Request } from "express"
import type { WebhookVerificationService } from "../services/webhook-verification.service"

interface RawBodyRequest extends Request {
  rawBody: Buffer
}

@Injectable()
export class StripeSignatureGuard implements CanActivate {
  private readonly logger = new Logger(StripeSignatureGuard.name)

  constructor(private webhookVerificationService: WebhookVerificationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RawBodyRequest>()
    const signature = request.headers["stripe-signature"] as string

    if (!signature) {
      this.logger.warn("Missing Stripe signature header")
      throw new BadRequestException("Missing Stripe signature header")
    }

    // Get the raw body from the request
    const rawBody = request.rawBody

    if (!rawBody) {
      this.logger.warn("Raw body not available")
      throw new BadRequestException("Raw body not available")
    }

    // Verify the signature
    const isValid = this.webhookVerificationService.verifyStripeSignature(rawBody, signature)

    if (!isValid) {
      this.logger.warn("Invalid Stripe signature")
      throw new BadRequestException("Invalid Stripe signature")
    }

    return true
  }
}
