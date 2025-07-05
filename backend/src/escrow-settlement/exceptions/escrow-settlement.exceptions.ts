import { HttpException, HttpStatus } from "@nestjs/common"

export class EscrowTransactionNotFoundException extends HttpException {
  constructor(transactionId: string) {
    super(`Escrow transaction with ID ${transactionId} not found`, HttpStatus.NOT_FOUND)
  }
}

export class DuplicateTransactionException extends HttpException {
  constructor(transactionId: string) {
    super(`Transaction with ID ${transactionId} already exists`, HttpStatus.CONFLICT)
  }
}

export class InvalidTransactionStateException extends HttpException {
  constructor(message: string) {
    super(`Invalid transaction state: ${message}`, HttpStatus.BAD_REQUEST)
  }
}

export class InsufficientFundsException extends HttpException {
  constructor(address: string, required: string, available: string) {
    super(
      `Insufficient funds in address ${address}. Required: ${required}, Available: ${available}`,
      HttpStatus.BAD_REQUEST,
    )
  }
}

export class StarkNetConnectionException extends HttpException {
  constructor(message: string) {
    super(`StarkNet connection error: ${message}`, HttpStatus.SERVICE_UNAVAILABLE)
  }
}

export class ContractExecutionException extends HttpException {
  constructor(message: string) {
    super(`Contract execution failed: ${message}`, HttpStatus.BAD_REQUEST)
  }
}

export class TransactionExpiredException extends HttpException {
  constructor(transactionId: string) {
    super(`Transaction ${transactionId} has expired`, HttpStatus.GONE)
  }
}

export class MaxRetriesExceededException extends HttpException {
  constructor(transactionId: string) {
    super(`Maximum retry attempts exceeded for transaction ${transactionId}`, HttpStatus.TOO_MANY_REQUESTS)
  }
}
