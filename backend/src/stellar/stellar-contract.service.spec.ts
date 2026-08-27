import { randomBytes } from 'crypto';
import {
  Account,
  Address,
  BASE_FEE,
  Keypair,
  nativeToScVal,
  Operation,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StellarContractService } from './stellar-contract.service';
import {
  ChainTimeoutError,
  EscrowContractError,
  SimulationError,
  SubmissionError,
} from './errors/stellar-integration.errors';
import { EscrowErrorCode } from './errors/escrow-error-code.enum';

const mockGetAccount = jest.fn();
const mockSimulateTransaction = jest.fn();
const mockSendTransaction = jest.fn();
const mockGetTransaction = jest.fn();
const mockAssembleTransaction = jest.fn();

// Only SorobanRpc.Server (network I/O) and assembleTransaction are mocked;
// Address/Keypair/nativeToScVal/xdr/etc. are the real implementations, so
// this suite exercises the actual XDR encode/decode logic, not a fake of it.
jest.mock('@stellar/stellar-sdk', () => {
  const actual = jest.requireActual(
    '@stellar/stellar-sdk',
  ) as unknown as typeof import('@stellar/stellar-sdk');
  return {
    ...actual,
    SorobanRpc: {
      ...actual.SorobanRpc,
      // jest.fn() is inherently `any`-returning; these are thin, lazy
      // pass-throughs (needed so this factory doesn't capture mockX's value
      // before its `const` initializes — see jest.mock hoisting) rather than
      // real production logic, so a scoped disable is more honest here than
      // fighting the type system.
      /* eslint-disable @typescript-eslint/no-unsafe-return */
      Server: jest.fn().mockImplementation(() => ({
        getAccount: (...args: unknown[]) => mockGetAccount(...args),
        simulateTransaction: (...args: unknown[]) =>
          mockSimulateTransaction(...args),
        sendTransaction: (...args: unknown[]) => mockSendTransaction(...args),
        getTransaction: (...args: unknown[]) => mockGetTransaction(...args),
      })),
      assembleTransaction: (...args: unknown[]) =>
        mockAssembleTransaction(...args),
      /* eslint-enable @typescript-eslint/no-unsafe-return */
    },
  };
});

const adminKeypair = Keypair.random();
const shipperKeypair = Keypair.random();
const carrierKeypair = Keypair.random();
// A syntactically valid (correct StrKey checksum) contract address —
// there's no real deployed contract to point at yet, so this is only
// ever used as an opaque, well-formed identifier `new Contract()` accepts.
const escrowAddress = Address.contract(randomBytes(32)).toString();

function makeConfigService(
  overrides: Record<string, string> = {},
): ConfigService {
  const values: Record<string, string> = {
    SOROBAN_ENABLED: 'true',
    SOROBAN_RPC_URL: 'https://soroban-testnet.stellar.org',
    STELLAR_NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015',
    ESCROW_CONTRACT_ADDRESS: escrowAddress,
    TOKEN_CONTRACT_ADDRESS: escrowAddress,
    PLATFORM_ADMIN_SECRET: adminKeypair.secret(),
    ...overrides,
  };
  return {
    get: jest.fn((key: string) => values[key] || undefined),
  } as unknown as ConfigService;
}

function fakeAccount(publicKey: string) {
  return {
    accountId: () => publicKey,
    sequenceNumber: () => '1',
    incrementSequenceNumber: () => undefined,
  };
}

function successSim(retval: xdr.ScVal) {
  return {
    id: '1',
    latestLedger: 100,
    events: [],
    _parsed: true,
    transactionData: {},
    minResourceFee: '100',
    cost: { cpuInsns: '0', memBytes: '0' },
    result: { auth: [], retval },
  };
}

function errorSim(error: string) {
  return { id: '1', latestLedger: 100, events: [], _parsed: true, error };
}

function stubAssembleAndSend(sendResponse: { status: string; hash: string }) {
  mockAssembleTransaction.mockImplementation((rawTx: unknown) => ({
    build: () => rawTx,
  }));
  mockSendTransaction.mockResolvedValueOnce(sendResponse);
}

async function readyService(
  overrides: Record<string, string> = {},
): Promise<StellarContractService> {
  mockSimulateTransaction.mockResolvedValueOnce(
    successSim(new Address(adminKeypair.publicKey()).toScVal()),
  );
  const service = new StellarContractService(makeConfigService(overrides));
  await service.onModuleInit();
  return service;
}

describe('StellarContractService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAccount.mockImplementation((pk: string) => fakeAccount(pk));
  });

  describe('onModuleInit', () => {
    it('stays disabled when SOROBAN_ENABLED is not "true"', async () => {
      const service = new StellarContractService(
        makeConfigService({ SOROBAN_ENABLED: 'false' }),
      );
      await service.onModuleInit();
      expect(service.isEnabled()).toBe(false);
      expect(mockGetAccount).not.toHaveBeenCalled();
    });

    it.each([
      'SOROBAN_RPC_URL',
      'STELLAR_NETWORK_PASSPHRASE',
      'ESCROW_CONTRACT_ADDRESS',
      'TOKEN_CONTRACT_ADDRESS',
      'PLATFORM_ADMIN_SECRET',
    ])('throws when %s is missing while enabled', async (key) => {
      const service = new StellarContractService(
        makeConfigService({ [key]: '' }),
      );
      await expect(service.onModuleInit()).rejects.toThrow(
        new RegExp(`${key} is not configured`),
      );
    });

    it('throws a loud error when the admin keypair does not match the contract', async () => {
      const onChainAdmin = Keypair.random().publicKey();
      mockSimulateTransaction.mockResolvedValueOnce(
        successSim(new Address(onChainAdmin).toScVal()),
      );

      const service = new StellarContractService(makeConfigService());

      await expect(service.onModuleInit()).rejects.toThrow(
        /does not match the escrow contract's admin/,
      );
    });

    it('succeeds and becomes enabled when the admin keypair matches', async () => {
      const service = await readyService();
      expect(service.isEnabled()).toBe(true);
    });

    it('never logs the raw secret, on success or on mismatch', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      await readyService();

      // Also exercise the mismatch path in the same test run.
      mockSimulateTransaction.mockResolvedValueOnce(
        successSim(new Address(Keypair.random().publicKey()).toScVal()),
      );
      const mismatched = new StellarContractService(makeConfigService());
      await mismatched.onModuleInit().catch(() => undefined);

      const allLoggedText = [...logSpy.mock.calls, ...warnSpy.mock.calls]
        .flat()
        .map(String)
        .join('\n');
      expect(allLoggedText).not.toContain(adminKeypair.secret());

      logSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });

  describe('write methods', () => {
    it('fundEscrow builds, simulates, signs with the shipper key, and submits', async () => {
      const service = await readyService();

      mockSimulateTransaction.mockResolvedValueOnce(
        successSim(xdr.ScVal.scvVoid()),
      );
      stubAssembleAndSend({ status: 'PENDING', hash: 'abc123' });

      const result = await service.fundEscrow(
        shipperKeypair,
        carrierKeypair.publicKey(),
        42n,
        500_000_000n,
      );

      expect(result).toEqual({ txHash: 'abc123', status: 'PENDING' });
      expect(mockGetAccount).toHaveBeenCalledWith(shipperKeypair.publicKey());
    });

    it('releasePayment signs with the platform admin key', async () => {
      const service = await readyService();

      mockSimulateTransaction.mockResolvedValueOnce(
        successSim(xdr.ScVal.scvVoid()),
      );
      stubAssembleAndSend({ status: 'PENDING', hash: 'release-hash' });

      const result = await service.releasePayment(42n);

      expect(result).toEqual({ txHash: 'release-hash', status: 'PENDING' });
      expect(mockGetAccount).toHaveBeenCalledWith(adminKeypair.publicKey());
    });

    it('parses a contract-level rejection into a typed EscrowContractError', async () => {
      const service = await readyService();

      // InvalidStatus = 6
      mockSimulateTransaction.mockResolvedValueOnce(
        errorSim('HostError: Error(Contract, #6)'),
      );

      await expect(service.releasePayment(42n)).rejects.toThrow(
        EscrowContractError,
      );
      mockSimulateTransaction.mockResolvedValueOnce(
        errorSim('HostError: Error(Contract, #6)'),
      );
      const error = (await service
        .releasePayment(42n)
        .catch((e: unknown) => e)) as EscrowContractError;
      expect(error).toBeInstanceOf(EscrowContractError);
      expect(error.code).toBe(EscrowErrorCode.InvalidStatus);
    });

    it('falls back to a generic SimulationError when the error string does not match the contract-error pattern', async () => {
      const service = await readyService();

      mockSimulateTransaction.mockResolvedValueOnce(
        errorSim('HostError: Error(WasmVm, InvalidAction)'),
      );

      await expect(service.refundPayment(42n)).rejects.toThrow(SimulationError);
    });

    it('throws SubmissionError when sendTransaction reports ERROR', async () => {
      const service = await readyService();

      mockSimulateTransaction.mockResolvedValueOnce(
        successSim(xdr.ScVal.scvVoid()),
      );
      stubAssembleAndSend({ status: 'ERROR', hash: 'bad-hash' });

      await expect(service.refundPayment(42n)).rejects.toThrow(SubmissionError);
    });

    it('throws ChainTimeoutError when the network cannot confirm the submission was received', async () => {
      const service = await readyService();

      mockSimulateTransaction.mockResolvedValueOnce(
        successSim(xdr.ScVal.scvVoid()),
      );
      stubAssembleAndSend({ status: 'TRY_AGAIN_LATER', hash: 'unclear-hash' });
      mockGetTransaction.mockResolvedValue({ status: 'NOT_FOUND' });

      await expect(service.resolveDispute(42n, true)).rejects.toThrow(
        ChainTimeoutError,
      );
    });

    it('polls until the transaction is confirmed after TRY_AGAIN_LATER', async () => {
      const service = await readyService();

      mockSimulateTransaction.mockResolvedValueOnce(
        successSim(xdr.ScVal.scvVoid()),
      );
      stubAssembleAndSend({ status: 'TRY_AGAIN_LATER', hash: 'later-hash' });
      mockGetTransaction.mockResolvedValue({ status: 'SUCCESS' });

      const result = await service.resolveDispute(42n, true);

      expect(result).toEqual({ txHash: 'later-hash', status: 'SUCCESS' });
    });

    it('rejects calls when SOROBAN_ENABLED is false', async () => {
      const service = new StellarContractService(
        makeConfigService({ SOROBAN_ENABLED: 'false' }),
      );
      await service.onModuleInit();

      await expect(service.releasePayment(42n)).rejects.toThrow(
        /SOROBAN_ENABLED/,
      );
    });
  });

  describe('non-custodial funding (issue #1276)', () => {
    it('buildFundEscrowTransaction builds and simulates without signing or submitting', async () => {
      const service = await readyService();

      mockSimulateTransaction.mockResolvedValueOnce(
        successSim(xdr.ScVal.scvVoid()),
      );
      mockAssembleTransaction.mockImplementation((rawTx: unknown) => ({
        build: () => rawTx,
      }));

      const xdrString = await service.buildFundEscrowTransaction(
        shipperKeypair.publicKey(),
        carrierKeypair.publicKey(),
        42n,
        500_000_000n,
      );

      expect(typeof xdrString).toBe('string');
      expect(xdrString.length).toBeGreaterThan(0);
      expect(mockGetAccount).toHaveBeenCalledWith(shipperKeypair.publicKey());
      expect(mockSendTransaction).not.toHaveBeenCalled();
    });

    it('buildFundEscrowTransaction maps a simulation failure to a typed error', async () => {
      const service = await readyService();

      mockSimulateTransaction.mockResolvedValueOnce(
        errorSim('HostError: Error(WasmVm, InvalidAction)'),
      );

      await expect(
        service.buildFundEscrowTransaction(
          shipperKeypair.publicKey(),
          carrierKeypair.publicKey(),
          42n,
          500_000_000n,
        ),
      ).rejects.toThrow(SimulationError);
    });

    it('submitSignedTransaction submits an already-signed transaction and returns the result', async () => {
      const service = await readyService();
      const networkPassphrase = 'Test SDF Network ; September 2015';

      const source = new Account(shipperKeypair.publicKey(), '100');
      const tx = new TransactionBuilder(source, {
        fee: BASE_FEE,
        networkPassphrase,
      })
        .addOperation(Operation.manageData({ name: 'test', value: 'ok' }))
        .setTimeout(30)
        .build();
      tx.sign(shipperKeypair);

      mockSendTransaction.mockResolvedValueOnce({
        status: 'PENDING',
        hash: 'signed-tx-hash',
      });

      const result = await service.submitSignedTransaction(tx.toXDR());

      expect(result).toEqual({ txHash: 'signed-tx-hash', status: 'PENDING' });
      expect(mockSendTransaction).toHaveBeenCalledTimes(1);
    });

    it('submitSignedTransaction throws SubmissionError when the network rejects it', async () => {
      const service = await readyService();
      const networkPassphrase = 'Test SDF Network ; September 2015';

      const source = new Account(shipperKeypair.publicKey(), '100');
      const tx = new TransactionBuilder(source, {
        fee: BASE_FEE,
        networkPassphrase,
      })
        .addOperation(Operation.manageData({ name: 'test', value: 'ok' }))
        .setTimeout(30)
        .build();
      tx.sign(shipperKeypair);

      mockSendTransaction.mockResolvedValueOnce({
        status: 'ERROR',
        hash: 'bad-hash',
      });

      await expect(service.submitSignedTransaction(tx.toXDR())).rejects.toThrow(
        SubmissionError,
      );
    });
  });

  describe('read methods', () => {
    it('decodes a full EscrowRecord from getEscrow', async () => {
      const service = await readyService();

      const entries = [
        ['shipment_id', nativeToScVal(42n, { type: 'u64' })],
        ['shipper', new Address(shipperKeypair.publicKey()).toScVal()],
        ['carrier', new Address(carrierKeypair.publicKey()).toScVal()],
        ['amount', nativeToScVal(500_000_000n, { type: 'i128' })],
        ['status', xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('Funded')])],
        ['funded_at', nativeToScVal(1_700_000_000n, { type: 'u64' })],
        ['settled_at', nativeToScVal(0n, { type: 'u64' })],
      ] as const;
      const recordScVal = xdr.ScVal.scvMap(
        entries.map(
          ([key, val]) =>
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvSymbol(key),
              val,
            }),
        ),
      );

      mockSimulateTransaction.mockResolvedValueOnce(successSim(recordScVal));

      const record = await service.getEscrow(42n);

      expect(record).toEqual({
        shipmentId: 42n,
        shipper: shipperKeypair.publicKey(),
        carrier: carrierKeypair.publicKey(),
        amount: 500_000_000n,
        status: 'Funded',
        fundedAt: 1_700_000_000n,
        settledAt: 0n,
      });
    });

    it('decodes a bigint balance from getBalance', async () => {
      const service = await readyService();

      mockSimulateTransaction.mockResolvedValueOnce(
        successSim(nativeToScVal(1_234_567_890n, { type: 'i128' })),
      );

      const balance = await service.getBalance();
      expect(balance).toBe(1_234_567_890n);
    });
  });
});
