import {
  EscrowContractError,
  ChainTimeoutError,
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
import { mapStellarFundingError } from './stellar-error-mapper';

/**
 * Every EscrowError variant the on-chain contract can return (mirrors
 * contracts/escrow/src/lib.rs exactly). If the contract adds a new
 * variant and someone forgets to update ESCROW_ERROR_MESSAGES, this
 * test will catch it because the Record type becomes incomplete.
 */
const ALL_ESCROW_ERROR_CODES: EscrowErrorCode[] = [
  EscrowErrorCode.NotInitialized,
  EscrowErrorCode.AlreadyInitialized,
  EscrowErrorCode.NotFound,
  EscrowErrorCode.AlreadyFunded,
  EscrowErrorCode.NotFunded,
  EscrowErrorCode.InvalidStatus,
  EscrowErrorCode.Unauthorized,
  EscrowErrorCode.InvalidAmount,
  EscrowErrorCode.InsufficientBalance,
];

describe('mapStellarFundingError', () => {
  // ── EscrowContractError (9 variants) ──────────────────────────────────

  describe('EscrowContractError → EscrowContractRejectedError', () => {
    it.each(ALL_ESCROW_ERROR_CODES)(
      'maps EscrowErrorCode.%s to an EscrowContractRejectedError',
      (code) => {
        const rawError = `HostError: Error(Contract, #${code})`;
        const input = new EscrowContractError(code, rawError);

        const result = mapStellarFundingError(input);

        expect(result).toBeInstanceOf(EscrowContractRejectedError);
        expect(result.code).toBe('ESCROW_CONTRACT_REJECTED');
        expect((result as EscrowContractRejectedError).escrowErrorCode).toBe(
          code,
        );
      },
    );

    it.each(ALL_ESCROW_ERROR_CODES)(
      'provides a distinct, actionable message for EscrowErrorCode.%s',
      (code) => {
        const rawError = `HostError: Error(Contract, #${code})`;
        const input = new EscrowContractError(code, rawError);

        const result = mapStellarFundingError(input);
        const message = (result as EscrowContractRejectedError).message;

        // Every variant must produce a non-empty message that does NOT
        // look like the old generic catch-all (which just forwarded the
        // raw Soroban error string).
        expect(message.length).toBeGreaterThan(0);
        expect(message).not.toBe(rawError);
        // Actionable messages contain a verb / instruction for the caller.
        expect(message).not.toMatch(/^Escrow contract rejected the call/);
      },
    );

    it.each(ALL_ESCROW_ERROR_CODES)(
      'maps EscrowErrorCode.%s to a 422 (UNPROCESSABLE_ENTITY)',
      (code) => {
        const input = new EscrowContractError(code, 'HostError');

        const result = mapStellarFundingError(input);

        expect(result.getStatus()).toBe(422);
      },
    );

    it('each EscrowErrorCode produces a unique error message', () => {
      const messages = ALL_ESCROW_ERROR_CODES.map((code) => {
        const input = new EscrowContractError(code, `HostError: #${code}`);
        return (mapStellarFundingError(input) as EscrowContractRejectedError)
          .message;
      });

      const unique = new Set(messages);
      expect(unique.size).toBe(ALL_ESCROW_ERROR_CODES.length);
    });
  });

  // ── Non-escrow Stellar errors ─────────────────────────────────────────

  describe('SimulationError → EscrowSimulationFailedError', () => {
    it('maps a simulation error to ESCROW_SIMULATION_FAILED', () => {
      const input = new SimulationError(
        'simulation failed',
        'HostError: insufficient balance',
      );

      const result = mapStellarFundingError(input);

      expect(result).toBeInstanceOf(EscrowSimulationFailedError);
      expect(result.code).toBe('ESCROW_SIMULATION_FAILED');
    });
  });

  describe('SubmissionError → EscrowSubmissionFailedError', () => {
    it('maps a submission error to ESCROW_SUBMISSION_FAILED', () => {
      const input = new SubmissionError('tx rejected', { status: 'ERROR' });

      const result = mapStellarFundingError(input);

      expect(result).toBeInstanceOf(EscrowSubmissionFailedError);
      expect(result.code).toBe('ESCROW_SUBMISSION_FAILED');
    });
  });

  describe('ChainTimeoutError → EscrowSubmissionFailedError', () => {
    it('maps a chain timeout to ESCROW_SUBMISSION_FAILED', () => {
      const input = new ChainTimeoutError('network never confirmed');

      const result = mapStellarFundingError(input);

      expect(result).toBeInstanceOf(EscrowSubmissionFailedError);
      expect(result.code).toBe('ESCROW_SUBMISSION_FAILED');
    });
  });

  describe('generic StellarIntegrationError → EscrowSubmissionFailedError', () => {
    it('maps a non-specific Stellar integration error to ESCROW_SUBMISSION_FAILED', () => {
      class OtherStellarError extends StellarIntegrationError {
        constructor() {
          super('some other stellar error');
        }
      }
      const input = new OtherStellarError();

      const result = mapStellarFundingError(input);

      expect(result).toBeInstanceOf(EscrowSubmissionFailedError);
      expect(result.code).toBe('ESCROW_SUBMISSION_FAILED');
    });
  });

  // ── Unknown / non-Stellar errors ──────────────────────────────────────

  describe('unknown error → EscrowSubmissionFailedError', () => {
    it('maps a plain Error to ESCROW_SUBMISSION_FAILED', () => {
      const input = new Error('something broke');

      const result = mapStellarFundingError(input);

      expect(result).toBeInstanceOf(EscrowSubmissionFailedError);
      expect(result.code).toBe('ESCROW_SUBMISSION_FAILED');
    });

    it('maps a non-Error value to ESCROW_SUBMISSION_FAILED', () => {
      const result = mapStellarFundingError('string error');

      expect(result).toBeInstanceOf(EscrowSubmissionFailedError);
      expect(result.code).toBe('ESCROW_SUBMISSION_FAILED');
    });
  });

  // ── Regression guard: never returns a bare generic 500 ────────────────

  describe('none of the 9 escrow variants produce a generic fallback', () => {
    it.each(ALL_ESCROW_ERROR_CODES)(
      'EscrowErrorCode.%s is NOT mapped to EscrowSubmissionFailedError',
      (code) => {
        const input = new EscrowContractError(code, `HostError: #${code}`);
        const result = mapStellarFundingError(input);

        expect(result).not.toBeInstanceOf(EscrowSubmissionFailedError);
        expect(result).not.toBeInstanceOf(EscrowSimulationFailedError);
      },
    );
  });
});
