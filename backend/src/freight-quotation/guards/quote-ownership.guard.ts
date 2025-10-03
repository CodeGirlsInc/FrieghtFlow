import { Injectable, type CanActivate, type ExecutionContext, ForbiddenException } from "@nestjs/common"
import type { FreightQuotationService } from "../services/freight-quotation.service"

/**
 * Guard to ensure users can only access their own quotes
 * This is a basic implementation - in production you'd integrate with your auth system
 */
@Injectable()
export class QuoteOwnershipGuard implements CanActivate {
  constructor(private readonly freightQuotationService: FreightQuotationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const quoteId = request.params.id
    const userId = request.user?.id // Assumes user is attached to request by auth middleware

    if (!userId) {
      throw new ForbiddenException("User not authenticated")
    }

    if (!quoteId) {
      return true // No specific quote being accessed
    }

    try {
      const quote = await this.freightQuotationService.findQuoteById(quoteId)

      if (quote.requesterId !== userId) {
        throw new ForbiddenException("You can only access your own quotes")
      }

      return true
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error
      }
      // Quote not found - let the controller handle it
      return true
    }
  }
}
