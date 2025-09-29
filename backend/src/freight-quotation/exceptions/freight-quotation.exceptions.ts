import { BadRequestException, NotFoundException } from "@nestjs/common"

export class QuoteNotFoundException extends NotFoundException {
  constructor(quoteId: string) {
    super(`Freight quote with ID ${quoteId} not found`)
  }
}

export class InvalidStatusTransitionException extends BadRequestException {
  constructor(currentStatus: string, newStatus: string) {
    super(`Invalid status transition from ${currentStatus} to ${newStatus}`)
  }
}

export class QuoteExpiredException extends BadRequestException {
  constructor(quoteId: string) {
    super(`Quote ${quoteId} has expired and cannot be modified`)
  }
}

export class PricingConfigNotFoundException extends NotFoundException {
  constructor(cargoType: string) {
    super(`No active pricing configuration found for cargo type: ${cargoType}`)
  }
}

export class InvalidQuoteStatusException extends BadRequestException {
  constructor(operation: string, currentStatus: string) {
    super(`Cannot ${operation} quote with status: ${currentStatus}`)
  }
}
