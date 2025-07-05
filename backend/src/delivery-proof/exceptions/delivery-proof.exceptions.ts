import { HttpException, HttpStatus } from "@nestjs/common"

export class DeliveryProofNotFoundException extends HttpException {
  constructor(id: string) {
    super(`Delivery proof with ID ${id} not found`, HttpStatus.NOT_FOUND)
  }
}

export class DuplicateDeliveryProofException extends HttpException {
  constructor(deliveryId: string, proofType: string) {
    super(`Delivery proof for delivery ${deliveryId} with type ${proofType} already exists`, HttpStatus.CONFLICT)
  }
}

export class InvalidProofDataException extends HttpException {
  constructor(message: string) {
    super(`Invalid proof data: ${message}`, HttpStatus.BAD_REQUEST)
  }
}

export class ProofExpiredException extends HttpException {
  constructor(id: string) {
    super(`Delivery proof with ID ${id} has expired`, HttpStatus.GONE)
  }
}

export class BlockchainUpdateFailedException extends HttpException {
  constructor(message: string) {
    super(`Blockchain update failed: ${message}`, HttpStatus.SERVICE_UNAVAILABLE)
  }
}
