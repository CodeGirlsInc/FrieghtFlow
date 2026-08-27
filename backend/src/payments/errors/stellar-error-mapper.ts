import {
  ChainTimeoutError,
  EscrowContractError,
  SimulationError,
  StellarIntegrationError,
  SubmissionError,
} from '../../stellar/errors/stellar-integration.errors';
import { EscrowErrorCode } from '../../stellar/errors/escrow-error-code.enum';
import {
  EscrowContractRejectedError,
  EscrowSimulationFailedError,
  EscrowSubmissionFailedError,
  PaymentFlowError,
} from './payment-flow.errors';

/**
 * Human-readable, actionable messages for every EscrowError variant.
 * Each message tells the caller *what happened* and *what to do next*,
 * so the frontend can surface a helpful notification instead of a
 * generic "something went wrong" (issue #1276).
 */
const ESCROW_ERROR_MESSAGES: Record<EscrowErrorCode, string> = {
  [EscrowErrorCode.NotInitialized]:
    'The escrow contract has not been initialised — contact support to set up the contract',
  [EscrowErrorCode.AlreadyInitialized]:
    'The escrow contract is already initialised — no further setup is needed',
  [EscrowErrorCode.NotFound]:
    'No escrow record exists for this shipment — verify the shipment ID and try again',
  [EscrowErrorCode.AlreadyFunded]:
    'This shipment has already been funded on-chain — no further action is needed',
  [EscrowErrorCode.NotFunded]:
    'The escrow for this shipment has not been funded yet — fund the escrow before attempting this action',
  [EscrowErrorCode.InvalidStatus]:
    'The escrow is not in a state that allows this operation — check the current escrow status',
  [EscrowErrorCode.Unauthorized]:
    'You are not authorised to perform this action on the escrow',
  [EscrowErrorCode.InvalidAmount]:
    'The funding amount must be a positive number',
  [EscrowErrorCode.InsufficientBalance]:
    'Insufficient token balance in the shipper wallet — top up the balance and try again',
};

/**
 * Maps a StellarContractService failure to a structured, distinguishable
 * PaymentFlowError instead of letting a generic 500 reach the shipper
 * (issue #1276 acceptance criteria).
 */
export function mapStellarFundingError(error: unknown): PaymentFlowError {
  if (error instanceof EscrowContractError) {
    const actionableMessage =
      ESCROW_ERROR_MESSAGES[error.code] ?? error.message;
    return new EscrowContractRejectedError(error.code, actionableMessage);
  }
  if (error instanceof SimulationError) {
    return new EscrowSimulationFailedError({ rawError: error.rawError });
  }
  if (error instanceof SubmissionError || error instanceof ChainTimeoutError) {
    return new EscrowSubmissionFailedError({
      rawResponse:
        error instanceof SubmissionError ? error.rawResponse : undefined,
      message: error.message,
    });
  }
  if (error instanceof StellarIntegrationError) {
    return new EscrowSubmissionFailedError({ message: error.message });
  }

  return new EscrowSubmissionFailedError(
    error instanceof Error ? error.message : String(error),
  );
}
