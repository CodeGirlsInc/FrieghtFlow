import {
  ChainTimeoutError,
  EscrowContractError,
  SimulationError,
  StellarIntegrationError,
  SubmissionError,
} from '../../stellar/errors/stellar-integration.errors';
import {
  EscrowContractRejectedError,
  EscrowSimulationFailedError,
  EscrowSubmissionFailedError,
  PaymentFlowError,
} from './payment-flow.errors';

/**
 * Maps a StellarContractService failure to a structured, distinguishable
 * PaymentFlowError instead of letting a generic 500 reach the shipper
 * (issue #1276 acceptance criteria).
 */
export function mapStellarFundingError(error: unknown): PaymentFlowError {
  if (error instanceof EscrowContractError) {
    return new EscrowContractRejectedError(error.code, error.message);
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
