import { Injectable, type CanActivate, type ExecutionContext, Logger, BadRequestException } from "@nestjs/common"
import type { Request } from "express"
import type { WebhookVerificationService } from "../services/webhook-verification.service"

@Injectable()
export class EmailSignatureGuard implements CanActivate {
  private readonly logger = new Logger(EmailSignatureGuard.name)

  constructor(private webhookVerificationService: WebhookVerificationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const signature = request.headers["x-email-signature"] as string

    if (!signature) {
      this.logger.warn("Missing email signature header")
      throw new BadRequestException("Missing email signature header")
    }

    // Verify the signature
    const isValid = this.webhookVerificationService.verifyEmailProviderSignature(request.body, signature)

    if (!isValid) {
      this.logger.warn("Invalid email signature")
      throw new BadRequestException("Invalid email signature")
    }

    return true
  }
}
