import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import type {
  EscrowTransactionCreatedEvent,
  EscrowTransactionSubmittedEvent,
  EscrowTransactionConfirmedEvent,
  EscrowTransactionFailedEvent,
  EscrowTransactionExpiredEvent,
  FundsLockedEvent,
  FundsReleasedEvent,
  FundsRefundedEvent,
} from "../events/escrow-transaction.events"

@Injectable()
export class EscrowSettlementListener {
  private readonly logger = new Logger(EscrowSettlementListener.name)

  @OnEvent("escrow-transaction.created")
  async handleTransactionCreated(event: EscrowTransactionCreatedEvent): Promise<void> {
    this.logger.log(`Escrow transaction created: ${event.transaction.transactionId}`)

    // Additional processing after transaction creation
    // Could trigger notifications, logging, etc.
  }

  @OnEvent("escrow-transaction.submitted")
  async handleTransactionSubmitted(event: EscrowTransactionSubmittedEvent): Promise<void> {
    this.logger.log(`Escrow transaction submitted: ${event.transaction.transactionId}, TX: ${event.txHash}`)

    // Additional processing after transaction submission
    // Could update external systems, send notifications, etc.
  }

  @OnEvent("escrow-transaction.confirmed")
  async handleTransactionConfirmed(event: EscrowTransactionConfirmedEvent): Promise<void> {
    this.logger.log(`Escrow transaction confirmed: ${event.transaction.transactionId}`)

    // Additional processing after confirmation
    // Could trigger delivery notifications, update order status, etc.
  }

  @OnEvent("escrow-transaction.failed")
  async handleTransactionFailed(event: EscrowTransactionFailedEvent): Promise<void> {
    this.logger.warn(`Escrow transaction failed: ${event.transaction.transactionId}, Error: ${event.error}`)

    // Handle failed transactions
    // Could trigger alerts, retry mechanisms, customer notifications, etc.
  }

  @OnEvent("escrow-transaction.expired")
  async handleTransactionExpired(event: EscrowTransactionExpiredEvent): Promise<void> {
    this.logger.warn(`Escrow transaction expired: ${event.transaction.transactionId}`)

    // Handle expired transactions
    // Could trigger cleanup, notifications, etc.
  }

  @OnEvent("funds.locked")
  async handleFundsLocked(event: FundsLockedEvent): Promise<void> {
    this.logger.log(
      `Funds locked: ${event.transaction.amount} ${event.transaction.currency} for transaction ${event.transaction.transactionId}`,
    )

    // Additional processing after funds are locked
    // Could update order status, notify parties, etc.
  }

  @OnEvent("funds.released")
  async handleFundsReleased(event: FundsReleasedEvent): Promise<void> {
    this.logger.log(
      `Funds released: ${event.transaction.amount} ${event.transaction.currency} for transaction ${event.transaction.transactionId}`,
    )

    // Additional processing after funds are released
    // Could complete order, send receipts, update accounting, etc.
  }

  @OnEvent("funds.refunded")
  async handleFundsRefunded(event: FundsRefundedEvent): Promise<void> {
    this.logger.log(
      `Funds refunded: ${event.transaction.amount} ${event.transaction.currency} for transaction ${event.transaction.transactionId}`,
    )

    // Additional processing after funds are refunded
    // Could update order status, send notifications, etc.
  }
}
