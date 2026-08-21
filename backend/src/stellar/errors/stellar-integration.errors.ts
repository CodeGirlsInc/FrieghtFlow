import { EscrowErrorCode, escrowErrorCodeName } from './escrow-error-code.enum';

/** Base type for every error this module throws — never a generic Error. */
export abstract class StellarIntegrationError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/**
 * Simulation itself failed — before anything was ever submitted to the
 * network. Distinct from SubmissionError so callers can tell "nothing
 * happened" apart from "something may have happened, unclear."
 */
export class SimulationError extends StellarIntegrationError {
  constructor(
    message: string,
    readonly rawError: string,
  ) {
    super(message);
  }
}

/**
 * Simulation succeeded but sendTransaction/getTransaction reported failure,
 * a network partition, or an RPC timeout. Simulation succeeding but
 * submission failing is exactly the case this type exists to distinguish
 * from SimulationError, so a later retry-policy issue can decide whether
 * it's safe to retry (it usually is NOT safe to blindly retry a
 * submission whose outcome is unknown).
 */
export class SubmissionError extends StellarIntegrationError {
  constructor(
    message: string,
    readonly rawResponse?: unknown,
  ) {
    super(message);
  }
}

/** The chain didn't confirm within the time this call was willing to wait. */
export class ChainTimeoutError extends StellarIntegrationError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * A specific, typed `EscrowError` variant returned by the contract itself
 * (e.g. calling releasePayment on a Pending escrow surfaces
 * EscrowErrorCode.InvalidStatus here), parsed out of the simulation
 * error string rather than left as an opaque RPC error.
 */
export class EscrowContractError extends StellarIntegrationError {
  constructor(
    readonly code: EscrowErrorCode,
    readonly rawError: string,
  ) {
    super(
      `Escrow contract rejected the call: ${escrowErrorCodeName(code)} (#${code})`,
    );
  }
}
