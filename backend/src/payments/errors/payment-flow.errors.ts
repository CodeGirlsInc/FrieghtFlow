import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Every structured payment-flow error carries a stable `code` in its
 * response body, distinct from the HTTP status, so a client can branch on
 * the specific failure (issue #1276: "actionable, distinguishable error,
 * not generic 500").
 */
export type PaymentFlowErrorCode =
  | 'SHIPMENT_NOT_ACCEPTED'
  | 'FORBIDDEN_PAYMENT_ACTION'
  | 'PAYMENT_ALREADY_FUNDED'
  | 'PAYMENT_ALREADY_IN_FLIGHT'
  | 'MISSING_WALLET_ADDRESS'
  | 'ESCROW_SIMULATION_FAILED'
  | 'ESCROW_SUBMISSION_FAILED'
  | 'ESCROW_CONTRACT_REJECTED';

export abstract class PaymentFlowError extends HttpException {
  protected constructor(
    readonly code: PaymentFlowErrorCode,
    message: string,
    status: HttpStatus,
    details?: unknown,
  ) {
    super({ code, message, details }, status);
  }
}

export class ShipmentNotAcceptedError extends PaymentFlowError {
  constructor() {
    super(
      'SHIPMENT_NOT_ACCEPTED',
      'Funding requires the shipment to be in ACCEPTED status',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ForbiddenPaymentActionError extends PaymentFlowError {
  constructor() {
    super(
      'FORBIDDEN_PAYMENT_ACTION',
      'Only the shipment owner can fund this shipment',
      HttpStatus.FORBIDDEN,
    );
  }
}

export class PaymentAlreadyFundedError extends PaymentFlowError {
  constructor(readonly paymentId: string) {
    super(
      'PAYMENT_ALREADY_FUNDED',
      'This shipment has already been funded',
      HttpStatus.CONFLICT,
      { paymentId },
    );
  }
}

/**
 * Thrown when a duplicate submit request loses the atomic PENDING→FUNDING
 * claim (see PaymentsService.submitFunding) — the concurrency guarantee
 * required by issue #1276 ("concurrent duplicate funding requests never
 * produce two chain calls").
 */
export class PaymentAlreadyInFlightError extends PaymentFlowError {
  constructor(readonly paymentId: string) {
    super(
      'PAYMENT_ALREADY_IN_FLIGHT',
      'A funding submission for this shipment is already in progress',
      HttpStatus.CONFLICT,
      { paymentId },
    );
  }
}

export class MissingWalletAddressError extends PaymentFlowError {
  constructor(readonly party: 'shipper' | 'carrier') {
    super(
      'MISSING_WALLET_ADDRESS',
      `The ${party} has not configured a Stellar wallet address`,
      HttpStatus.UNPROCESSABLE_ENTITY,
      { party },
    );
  }
}

/**
 * Simulation failed before anything was submitted — most commonly the
 * shipper's token balance or `approve` allowance to the escrow contract is
 * insufficient (the escrow contract's `fund_escrow` calls
 * `token.transfer_from`, which panics inside the token contract, not the
 * escrow contract, for either case).
 */
export class EscrowSimulationFailedError extends PaymentFlowError {
  constructor(details?: unknown) {
    super(
      'ESCROW_SIMULATION_FAILED',
      "The funding transaction could not be simulated — check the shipper wallet's balance and token allowance",
      HttpStatus.UNPROCESSABLE_ENTITY,
      details,
    );
  }
}

export class EscrowSubmissionFailedError extends PaymentFlowError {
  constructor(details?: unknown) {
    super(
      'ESCROW_SUBMISSION_FAILED',
      'The funding transaction was rejected by the network',
      HttpStatus.UNPROCESSABLE_ENTITY,
      details,
    );
  }
}

export class EscrowContractRejectedError extends PaymentFlowError {
  constructor(
    readonly escrowErrorCode: number,
    message: string,
  ) {
    super(
      'ESCROW_CONTRACT_REJECTED',
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      {
        escrowErrorCode,
      },
    );
  }
}
