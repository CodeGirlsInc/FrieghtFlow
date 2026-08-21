import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  nativeToScVal,
  scValToNative,
  SorobanRpc,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk';
import {
  ChainTimeoutError,
  EscrowContractError,
  SimulationError,
  SubmissionError,
} from './errors/stellar-integration.errors';
import { EscrowErrorCode } from './errors/escrow-error-code.enum';
import { ContractCallResult, EscrowRecord } from './escrow-record.interface';

const TX_TIMEOUT_SECONDS = 30;

/**
 * Soroban error strings for contract-level rejections look like
 * `HostError: Error(Contract, #6)`, where 6 is the EscrowError
 * discriminant. This is the documented Soroban diagnostic format for a
 * function returning `Result<T, ContractError>`.
 */
const CONTRACT_ERROR_PATTERN = /Error\(Contract,\s*#(\d+)\)/;

/**
 * Thin, testable bridge between the backend and the escrow contract
 * (contracts/escrow/src/lib.rs). One typed method per entrypoint: simulate
 * first (to catch EscrowError variants pre-submission), sign when
 * required, submit, return tx hash + result.
 *
 * No retry/polling logic and no business-logic decisions here — those are
 * later issues. This module only needs to prove the backend can build,
 * simulate, sign, and submit against the real contract.
 */
@Injectable()
export class StellarContractService implements OnModuleInit {
  private readonly logger = new Logger(StellarContractService.name);
  private server: SorobanRpc.Server;
  private contract: Contract;
  private adminKeypair: Keypair;
  private networkPassphrase: string;
  private enabled = false;

  constructor(private readonly config: ConfigService) {}

  // Fail fast at boot: a missing/mismatched RPC config or a signing key
  // that doesn't match the contract's admin should never surface only on
  // the first real admin-gated call.
  async onModuleInit(): Promise<void> {
    // Joi may hand this back as a coerced boolean or as the raw string,
    // depending on config-loading path — normalize defensively.
    this.enabled = String(this.config.get('SOROBAN_ENABLED')) === 'true';
    if (!this.enabled) {
      this.logger.warn(
        'SOROBAN_ENABLED is not "true" — Stellar contract integration is disabled; no chain calls will be made.',
      );
      return;
    }

    const rpcUrl = this.requireEnv('SOROBAN_RPC_URL');
    const networkPassphrase = this.requireEnv('STELLAR_NETWORK_PASSPHRASE');
    const escrowAddress = this.requireEnv('ESCROW_CONTRACT_ADDRESS');
    // Validated even though this service doesn't reference it directly —
    // fail fast here rather than mid-flow in whatever later issue reads it.
    this.requireEnv('TOKEN_CONTRACT_ADDRESS');
    const adminSecret = this.requireEnv('PLATFORM_ADMIN_SECRET');

    this.networkPassphrase = networkPassphrase;
    this.server = new SorobanRpc.Server(rpcUrl);
    this.contract = new Contract(escrowAddress);
    this.adminKeypair = Keypair.fromSecret(adminSecret);

    await this.assertAdminKeyMatchesContract();

    this.logger.log(
      `StellarContractService ready (rpc=${rpcUrl}, escrow=${escrowAddress})`,
    );
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // ── Shipper / party actions (require the caller's own signature) ───────

  /** Shipper locks funds for a shipment. `signer` must be the `shipper` address's keypair. */
  async fundEscrow(
    signer: Keypair,
    carrier: string,
    shipmentId: bigint,
    amount: bigint,
  ): Promise<ContractCallResult> {
    return this.invoke(
      signer,
      'fund_escrow',
      new Address(signer.publicKey()).toScVal(),
      new Address(carrier).toScVal(),
      nativeToScVal(shipmentId, { type: 'u64' }),
      nativeToScVal(amount, { type: 'i128' }),
    );
  }

  /** Either party raises a dispute. `signer` must be the shipper's or carrier's keypair. */
  async raiseDispute(
    signer: Keypair,
    shipmentId: bigint,
  ): Promise<ContractCallResult> {
    return this.invoke(
      signer,
      'raise_dispute',
      new Address(signer.publicKey()).toScVal(),
      nativeToScVal(shipmentId, { type: 'u64' }),
    );
  }

  // ── Admin actions (always signed with the platform admin key) ──────────

  async releasePayment(shipmentId: bigint): Promise<ContractCallResult> {
    this.assertEnabled();
    return this.invoke(
      this.adminKeypair,
      'release_payment',
      nativeToScVal(shipmentId, { type: 'u64' }),
    );
  }

  async refundPayment(shipmentId: bigint): Promise<ContractCallResult> {
    this.assertEnabled();
    return this.invoke(
      this.adminKeypair,
      'refund_payment',
      nativeToScVal(shipmentId, { type: 'u64' }),
    );
  }

  async resolveDispute(
    shipmentId: bigint,
    releaseToCarrier: boolean,
  ): Promise<ContractCallResult> {
    this.assertEnabled();
    return this.invoke(
      this.adminKeypair,
      'resolve_dispute',
      nativeToScVal(shipmentId, { type: 'u64' }),
      nativeToScVal(releaseToCarrier, { type: 'bool' }),
    );
  }

  // ── Read-only queries ────────────────────────────────────────────────────

  async getEscrow(shipmentId: bigint): Promise<EscrowRecord> {
    const retval = await this.simulateRead(
      'get_escrow',
      nativeToScVal(shipmentId, { type: 'u64' }),
    );
    return StellarContractService.decodeEscrowRecord(retval);
  }

  async getBalance(): Promise<bigint> {
    const retval = await this.simulateRead('get_balance');
    return BigInt(scValToNative(retval) as bigint | number);
  }

  // ── Internals ────────────────────────────────────────────────────────────

  private assertEnabled(): void {
    if (!this.enabled) {
      throw new Error(
        'StellarContractService: SOROBAN_ENABLED is not "true" — chain calls are disabled',
      );
    }
  }

  private async assertAdminKeyMatchesContract(): Promise<void> {
    const retval = await this.simulateRead('get_admin');
    const onChainAdmin = scValToNative(retval) as string;
    if (onChainAdmin !== this.adminKeypair.publicKey()) {
      // Never log the secret — only the (public) mismatch.
      throw new Error(
        `StellarContractService: configured PLATFORM_ADMIN_SECRET's public key ` +
          `(${this.adminKeypair.publicKey()}) does not match the escrow contract's ` +
          `admin (${onChainAdmin})`,
      );
    }
  }

  /** Simulates a read-only call (no signing, no submission) and returns the raw retval. */
  private async simulateRead(
    method: string,
    ...args: xdr.ScVal[]
  ): Promise<xdr.ScVal> {
    this.assertEnabled();
    const sourceAccount = await this.server.getAccount(
      this.adminKeypair.publicKey(),
    );
    const tx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(this.contract.call(method, ...args))
      .setTimeout(TX_TIMEOUT_SECONDS)
      .build();

    const sim = await this.server.simulateTransaction(tx);
    this.throwIfSimulationFailed(sim, method);

    if (!SorobanRpc.Api.isSimulationSuccess(sim) || sim.result === undefined) {
      throw new SimulationError(
        `Simulating "${method}" returned no result`,
        JSON.stringify(sim),
      );
    }

    return sim.result.retval;
  }

  /** Builds, simulates, signs (with `signer`), and submits a write call. */
  private async invoke(
    signer: Keypair,
    method: string,
    ...args: xdr.ScVal[]
  ): Promise<ContractCallResult> {
    this.assertEnabled();
    const sourceAccount = await this.server.getAccount(signer.publicKey());

    const rawTx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(this.contract.call(method, ...args))
      .setTimeout(TX_TIMEOUT_SECONDS)
      .build();

    const sim = await this.server.simulateTransaction(rawTx);
    this.throwIfSimulationFailed(sim, method);

    let prepared;
    try {
      prepared = SorobanRpc.assembleTransaction(rawTx, sim).build();
    } catch (error) {
      throw new SimulationError(
        `Failed to assemble "${method}" from its simulation`,
        error instanceof Error ? error.message : String(error),
      );
    }

    prepared.sign(signer);

    let sendResult;
    try {
      sendResult = await this.server.sendTransaction(prepared);
    } catch (error) {
      throw new SubmissionError(
        `Submitting "${method}" failed`,
        error instanceof Error ? error.message : String(error),
      );
    }

    if (sendResult.status === 'ERROR') {
      throw new SubmissionError(
        `Escrow contract call "${method}" was rejected on submission: ${sendResult.status}`,
        sendResult,
      );
    }

    if (
      sendResult.status === 'TRY_AGAIN_LATER' ||
      sendResult.status === 'DUPLICATE'
    ) {
      // Not a hard failure, but not a confirmed success either — the
      // caller-facing distinction between "unknown" and "confirmed" is a
      // later issue's retry/polling concern. Surface it distinctly so that
      // issue can build on top of it rather than treating it as success.
      throw new ChainTimeoutError(
        `Escrow contract call "${method}" did not reach the network in a confirmable way: ${sendResult.status}`,
      );
    }

    return { txHash: sendResult.hash, status: sendResult.status };
  }

  private throwIfSimulationFailed(
    sim: SorobanRpc.Api.SimulateTransactionResponse,
    method: string,
  ): void {
    if (!SorobanRpc.Api.isSimulationError(sim)) {
      return;
    }

    const match = CONTRACT_ERROR_PATTERN.exec(sim.error);
    if (match) {
      const code = Number(match[1]) as EscrowErrorCode;
      throw new EscrowContractError(code, sim.error);
    }

    throw new SimulationError(
      `Simulating "${method}" failed: ${sim.error}`,
      sim.error,
    );
  }

  private static decodeEscrowRecord(retval: xdr.ScVal): EscrowRecord {
    const native = scValToNative(retval) as Record<string, unknown>;
    return {
      shipmentId: BigInt(native.shipment_id as bigint | number),
      shipper: native.shipper as string,
      carrier: native.carrier as string,
      amount: BigInt(native.amount as bigint | number),
      status: StellarContractService.decodeStatus(native.status),
      fundedAt: BigInt(native.funded_at as bigint | number),
      settledAt: BigInt(native.settled_at as bigint | number),
    };
  }

  private static decodeStatus(raw: unknown): EscrowRecord['status'] {
    // #[contracttype] enums always encode as ScVal::Vec([Symbol(tag), ...
    // values]), even for unit variants with no associated data — so
    // EscrowStatus::Funded decodes via scValToNative to the JS array
    // ["Funded"], not a bare string.
    // Array.isArray narrows to any[], not unknown[] — cast back explicitly
    // so the switch below type-checks against unknown, not any.
    const tag: unknown = Array.isArray(raw) ? (raw[0] as unknown) : raw;
    switch (tag) {
      case 'Pending':
      case 'Funded':
      case 'Released':
      case 'Refunded':
      case 'Disputed':
        return tag;
      default:
        throw new Error(
          `Unrecognized EscrowStatus value: ${JSON.stringify(raw)}`,
        );
    }
  }

  private requireEnv(key: string): string {
    const value = this.config.get<string>(key);
    if (!value) {
      throw new Error(`StellarContractService: ${key} is not configured`);
    }
    return value;
  }
}
