import { HttpException, HttpStatus } from "@nestjs/common"

export class StellarAccountNotFoundException extends HttpException {
  constructor(publicKey: string) {
    super(`Stellar account not found: ${publicKey}`, HttpStatus.NOT_FOUND)
  }
}

export class InsufficientBalanceException extends HttpException {
  constructor(required: string, available: string) {
    super(`Insufficient balance. Required: ${required}, Available: ${available}`, HttpStatus.BAD_REQUEST)
  }
}

export class InvalidTransactionException extends HttpException {
  constructor(message: string) {
    super(`Invalid transaction: ${message}`, HttpStatus.BAD_REQUEST)
  }
}

export class EscrowNotFoundException extends HttpException {
  constructor(escrowId: string) {
    super(`Escrow contract not found: ${escrowId}`, HttpStatus.NOT_FOUND)
  }
}

export class EscrowInvalidStatusException extends HttpException {
  constructor(currentStatus: string, requiredStatus: string) {
    super(`Escrow contract status is ${currentStatus}, but ${requiredStatus} is required`, HttpStatus.BAD_REQUEST)
  }
}
