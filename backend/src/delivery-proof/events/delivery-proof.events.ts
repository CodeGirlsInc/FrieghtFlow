import type { DeliveryProof } from "../entities/delivery-proof.entity"

export class DeliveryProofCreatedEvent {
  constructor(public readonly deliveryProof: DeliveryProof) {}
}

export class DeliveryProofVerifiedEvent {
  constructor(public readonly deliveryProof: DeliveryProof) {}
}

export class DeliveryProofFailedEvent {
  constructor(
    public readonly deliveryProof: DeliveryProof,
    public readonly error: string,
  ) {}
}

export class BlockchainUpdateRequestedEvent {
  constructor(public readonly deliveryProof: DeliveryProof) {}
}

export class BlockchainUpdateCompletedEvent {
  constructor(
    public readonly deliveryProof: DeliveryProof,
    public readonly txHash: string,
    public readonly blockNumber: string,
  ) {}
}
