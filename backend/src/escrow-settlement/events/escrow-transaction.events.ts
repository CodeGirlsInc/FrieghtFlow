import type { EscrowTransaction } from "../entities/escrow-transaction.entity"

export class EscrowTransactionCreatedEvent {
  constructor(public readonly transaction: EscrowTransaction) {}
}

export class EscrowTransactionSubmittedEvent {
  constructor(
    public readonly transaction: EscrowTransaction,
    public readonly txHash: string,
  ) {}
}

export class EscrowTransactionConfirmedEvent {
  constructor(public readonly transaction: EscrowTransaction) {}
}

export class EscrowTransactionFailedEvent {
  constructor(
    public readonly transaction: EscrowTransaction,
    public readonly error: string,
  ) {}
}

export class EscrowTransactionExpiredEvent {
  constructor(public readonly transaction: EscrowTransaction) {}
}

export class FundsLockedEvent {
  constructor(
    public readonly transaction: EscrowTransaction,
    public readonly txHash: string,
  ) {}
}

export class FundsReleasedEvent {
  constructor(
    public readonly transaction: EscrowTransaction,
    public readonly txHash: string,
  ) {}
}

export class FundsRefundedEvent {
  constructor(
    public readonly transaction: EscrowTransaction,
    public readonly txHash: string,
  ) {}
}
