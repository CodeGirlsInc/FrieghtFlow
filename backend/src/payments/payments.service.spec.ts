import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Keypair } from '@stellar/stellar-sdk';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { User } from '../users/entities/user.entity';
import { StellarContractService } from '../stellar/stellar-contract.service';
import {
  EscrowContractRejectedError,
  ForbiddenPaymentActionError,
  InvalidCancellationFeeError,
  MissingWalletAddressError,
  PaymentAlreadyFundedError,
  PaymentAlreadyInFlightError,
  ShipmentNotAcceptedError,
} from './errors/payment-flow.errors';
import {
  EscrowContractError,
  ChainTimeoutError,
  SimulationError,
} from '../stellar/errors/stellar-integration.errors';
import { EscrowErrorCode } from '../stellar/errors/escrow-error-code.enum';

const mockPaymentRepo = () => ({
  create: jest.fn((data: Partial<Payment>) => ({ ...data }) as Payment),
  save: jest.fn(
    (entity: Partial<Payment>) => ({ id: 'payment-1', ...entity }) as Payment,
  ),
  findOne: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockShipmentRepo = () => ({ findOne: jest.fn() });
const mockUserRepo = () => ({ findOne: jest.fn() });
const mockStellarContractService = () => ({
  buildFundEscrowTransaction: jest.fn(),
  submitSignedTransaction: jest.fn(),
  fundEscrow: jest.fn(),
  releasePayment: jest.fn(),
  refundPayment: jest
    .fn()
    .mockResolvedValue({ txHash: 'refund-hash', status: 'SUCCESS' }),
  refundPaymentWithFee: jest
    .fn()
    .mockResolvedValue({ txHash: 'refund-fee-hash', status: 'SUCCESS' }),
  getSettlementFee: jest.fn().mockResolvedValue(0n),
  raiseDispute: jest.fn(),
  resolveDispute: jest.fn(),
});
const mockConfigService = (values: Record<string, string> = {}) => ({
  get: jest.fn((key: string): string | undefined => values[key]),
});

const shipperKeypair = Keypair.random();

function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: 'shipment-1',
    shipperId: 'shipper-1',
    carrierId: 'carrier-1',
    status: ShipmentStatus.ACCEPTED,
    price: 100,
    ...overrides,
  } as Shipment;
}

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'shipper-1',
    walletAddress: shipperKeypair.publicKey(),
    ...overrides,
  } as User;
}

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 'payment-1',
    shipmentId: 'shipment-1',
    onChainShipmentId: 1,
    status: PaymentStatus.PENDING,
    amount: 100,
    assetCode: 'USDC',
    shipperWalletAddress: shipperKeypair.publicKey(),
    carrierWalletAddress: 'GCARRIER',
    ...overrides,
  } as Payment;
}

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentRepo: ReturnType<typeof mockPaymentRepo>;
  let shipmentRepo: ReturnType<typeof mockShipmentRepo>;
  let userRepo: ReturnType<typeof mockUserRepo>;
  let stellarContractService: ReturnType<typeof mockStellarContractService>;
  let config: ReturnType<typeof mockConfigService>;

  beforeEach(async () => {
    config = mockConfigService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useFactory: mockPaymentRepo },
        {
          provide: getRepositoryToken(Shipment),
          useFactory: mockShipmentRepo,
        },
        { provide: getRepositoryToken(User), useFactory: mockUserRepo },
        {
          provide: StellarContractService,
          useFactory: mockStellarContractService,
        },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get(PaymentsService);
    paymentRepo = module.get(getRepositoryToken(Payment));
    shipmentRepo = module.get(getRepositoryToken(Shipment));
    userRepo = module.get(getRepositoryToken(User));
    stellarContractService = module.get(StellarContractService);
  });

  describe('initiateFunding', () => {
    it('throws ForbiddenPaymentActionError when the requester is not the shipper', async () => {
      shipmentRepo.findOne.mockResolvedValue(makeShipment());

      await expect(
        service.initiateFunding('shipment-1', 'someone-else'),
      ).rejects.toThrow(ForbiddenPaymentActionError);
    });

    it('throws ShipmentNotAcceptedError when the shipment is not ACCEPTED', async () => {
      shipmentRepo.findOne.mockResolvedValue(
        makeShipment({ status: ShipmentStatus.PENDING }),
      );

      await expect(
        service.initiateFunding('shipment-1', 'shipper-1'),
      ).rejects.toThrow(ShipmentNotAcceptedError);
    });

    it('throws MissingWalletAddressError when the shipper has no wallet', async () => {
      shipmentRepo.findOne.mockResolvedValue(makeShipment());
      userRepo.findOne.mockImplementation(({ where: { id } }) =>
        Promise.resolve(
          id === 'shipper-1'
            ? makeUser({ walletAddress: null })
            : makeUser({ id: 'carrier-1', walletAddress: 'GCARRIER' }),
        ),
      );

      await expect(
        service.initiateFunding('shipment-1', 'shipper-1'),
      ).rejects.toThrow(MissingWalletAddressError);
    });

    it('throws MissingWalletAddressError when the carrier has no wallet', async () => {
      shipmentRepo.findOne.mockResolvedValue(makeShipment());
      userRepo.findOne.mockImplementation(({ where: { id } }) =>
        Promise.resolve(
          id === 'shipper-1'
            ? makeUser()
            : makeUser({ id: 'carrier-1', walletAddress: null }),
        ),
      );

      await expect(
        service.initiateFunding('shipment-1', 'shipper-1'),
      ).rejects.toThrow(MissingWalletAddressError);
    });

    it('creates the payment row and returns unsigned XDR on first funding attempt', async () => {
      shipmentRepo.findOne.mockResolvedValue(makeShipment());
      userRepo.findOne.mockImplementation(({ where: { id } }) =>
        Promise.resolve(
          id === 'shipper-1'
            ? makeUser()
            : makeUser({ id: 'carrier-1', walletAddress: 'GCARRIER' }),
        ),
      );
      paymentRepo.findOne.mockResolvedValue(null);
      paymentRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ next_id: '1' }),
      });
      stellarContractService.buildFundEscrowTransaction.mockResolvedValue(
        'unsigned-xdr',
      );

      const result = await service.initiateFunding('shipment-1', 'shipper-1');

      expect(result).toEqual({
        paymentId: 'payment-1',
        status: PaymentStatus.PENDING,
        unsignedXdr: 'unsigned-xdr',
      });
      expect(
        stellarContractService.buildFundEscrowTransaction,
      ).toHaveBeenCalledWith(
        shipperKeypair.publicKey(),
        'GCARRIER',
        1n,
        1_000_000_000n, // 100 * 10^7
      );
    });

    it('throws PaymentAlreadyFundedError when the payment is already FUNDED', async () => {
      shipmentRepo.findOne.mockResolvedValue(makeShipment());
      userRepo.findOne.mockImplementation(({ where: { id } }) =>
        Promise.resolve(
          id === 'shipper-1'
            ? makeUser()
            : makeUser({ id: 'carrier-1', walletAddress: 'GCARRIER' }),
        ),
      );
      paymentRepo.findOne.mockResolvedValue(
        makePayment({ status: PaymentStatus.FUNDED }),
      );

      await expect(
        service.initiateFunding('shipment-1', 'shipper-1'),
      ).rejects.toThrow(PaymentAlreadyFundedError);
    });

    it('throws PaymentAlreadyInFlightError when a submission is already in progress', async () => {
      shipmentRepo.findOne.mockResolvedValue(makeShipment());
      userRepo.findOne.mockImplementation(({ where: { id } }) =>
        Promise.resolve(
          id === 'shipper-1'
            ? makeUser()
            : makeUser({ id: 'carrier-1', walletAddress: 'GCARRIER' }),
        ),
      );
      paymentRepo.findOne.mockResolvedValue(
        makePayment({ status: PaymentStatus.FUNDING }),
      );

      await expect(
        service.initiateFunding('shipment-1', 'shipper-1'),
      ).rejects.toThrow(PaymentAlreadyInFlightError);
    });

    it('refreshes a stale carrier binding on an existing PENDING row (carrier reassigned)', async () => {
      shipmentRepo.findOne.mockResolvedValue(
        makeShipment({ carrierId: 'new-carrier' }),
      );
      userRepo.findOne.mockImplementation(({ where: { id } }) =>
        Promise.resolve(
          id === 'shipper-1'
            ? makeUser()
            : makeUser({ id: 'new-carrier', walletAddress: 'GNEWCARRIER' }),
        ),
      );
      paymentRepo.findOne.mockResolvedValue(
        makePayment({ carrierWalletAddress: 'GOLDCARRIER' }),
      );
      stellarContractService.buildFundEscrowTransaction.mockResolvedValue(
        'unsigned-xdr',
      );

      await service.initiateFunding('shipment-1', 'shipper-1');

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ carrierWalletAddress: 'GNEWCARRIER' }),
      );
      expect(
        stellarContractService.buildFundEscrowTransaction,
      ).toHaveBeenCalledWith(
        shipperKeypair.publicKey(),
        'GNEWCARRIER',
        1n,
        expect.any(BigInt),
      );
    });

    it('maps a simulation failure (e.g. insufficient balance/allowance) to a structured error', async () => {
      shipmentRepo.findOne.mockResolvedValue(makeShipment());
      userRepo.findOne.mockImplementation(({ where: { id } }) =>
        Promise.resolve(
          id === 'shipper-1'
            ? makeUser()
            : makeUser({ id: 'carrier-1', walletAddress: 'GCARRIER' }),
        ),
      );
      paymentRepo.findOne.mockResolvedValue(makePayment());
      stellarContractService.buildFundEscrowTransaction.mockRejectedValue(
        new SimulationError('sim failed', 'HostError: insufficient balance'),
      );

      await expect(
        service.initiateFunding('shipment-1', 'shipper-1'),
      ).rejects.toMatchObject({ code: 'ESCROW_SIMULATION_FAILED' });
    });
  });

  describe('submitFunding', () => {
    it('claims the payment, submits, and marks it FUNDED', async () => {
      shipmentRepo.findOne.mockResolvedValue(makeShipment());
      paymentRepo.findOne.mockResolvedValue(makePayment());
      paymentRepo.update.mockResolvedValueOnce({ affected: 1 });
      stellarContractService.submitSignedTransaction.mockResolvedValue({
        txHash: 'tx-hash-1',
        status: 'PENDING',
      });

      const result = await service.submitFunding(
        'shipment-1',
        'payment-1',
        'shipper-1',
        'signed-xdr',
      );

      expect(result).toEqual({
        paymentId: 'payment-1',
        status: PaymentStatus.FUNDED,
        stellarTxHash: 'tx-hash-1',
      });
      expect(paymentRepo.update).toHaveBeenCalledWith(
        { id: 'payment-1', status: PaymentStatus.PENDING },
        { status: PaymentStatus.FUNDING },
      );
      expect(paymentRepo.update).toHaveBeenCalledWith(
        'payment-1',
        expect.objectContaining({
          status: PaymentStatus.FUNDED,
          stellarTxHash: 'tx-hash-1',
        }),
      );
    });

    it('throws ForbiddenPaymentActionError when the requester is not the shipper', async () => {
      shipmentRepo.findOne.mockResolvedValue(makeShipment());

      await expect(
        service.submitFunding(
          'shipment-1',
          'payment-1',
          'someone-else',
          'signed-xdr',
        ),
      ).rejects.toThrow(ForbiddenPaymentActionError);
    });

    it('throws NotFoundException when the payment does not exist for this shipment', async () => {
      shipmentRepo.findOne.mockResolvedValue(makeShipment());
      paymentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.submitFunding(
          'shipment-1',
          'missing-payment',
          'shipper-1',
          'signed-xdr',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws PaymentAlreadyFundedError without attempting the claim when already FUNDED', async () => {
      shipmentRepo.findOne.mockResolvedValue(makeShipment());
      paymentRepo.findOne.mockResolvedValue(
        makePayment({ status: PaymentStatus.FUNDED }),
      );

      await expect(
        service.submitFunding(
          'shipment-1',
          'payment-1',
          'shipper-1',
          'signed-xdr',
        ),
      ).rejects.toThrow(PaymentAlreadyFundedError);
      expect(paymentRepo.update).not.toHaveBeenCalled();
    });

    it('throws PaymentAlreadyInFlightError when the atomic claim loses the race (concurrent duplicate submit)', async () => {
      shipmentRepo.findOne.mockResolvedValue(makeShipment());
      paymentRepo.findOne.mockResolvedValue(makePayment());
      // Another concurrent request already claimed it — 0 rows matched.
      paymentRepo.update.mockResolvedValueOnce({ affected: 0 });

      await expect(
        service.submitFunding(
          'shipment-1',
          'payment-1',
          'shipper-1',
          'signed-xdr',
        ),
      ).rejects.toThrow(PaymentAlreadyInFlightError);
      expect(
        stellarContractService.submitSignedTransaction,
      ).not.toHaveBeenCalled();
    });

    it('releases the claim back to PENDING and maps the error on a contract rejection', async () => {
      shipmentRepo.findOne.mockResolvedValue(makeShipment());
      paymentRepo.findOne.mockResolvedValue(makePayment());
      paymentRepo.update.mockResolvedValueOnce({ affected: 1 });
      stellarContractService.submitSignedTransaction.mockRejectedValue(
        new EscrowContractError(
          EscrowErrorCode.AlreadyFunded,
          'HostError: Error(Contract, #4)',
        ),
      );

      await expect(
        service.submitFunding(
          'shipment-1',
          'payment-1',
          'shipper-1',
          'signed-xdr',
        ),
      ).rejects.toThrow(EscrowContractRejectedError);

      expect(paymentRepo.update).toHaveBeenCalledWith('payment-1', {
        status: PaymentStatus.PENDING,
        failureReason: 'ESCROW_CONTRACT_REJECTED',
      });
    });

    it('maps a chain timeout to the submission error code', async () => {
      shipmentRepo.findOne.mockResolvedValue(makeShipment());
      paymentRepo.findOne.mockResolvedValue(makePayment());
      paymentRepo.update.mockResolvedValueOnce({ affected: 1 });
      stellarContractService.submitSignedTransaction.mockRejectedValue(
        new ChainTimeoutError('network never confirmed the tx'),
      );

      await expect(
        service.submitFunding(
          'shipment-1',
          'payment-1',
          'shipper-1',
          'signed-xdr',
        ),
      ).rejects.toMatchObject({ code: 'ESCROW_SUBMISSION_FAILED' });
    });
  });

  describe('testSignAndSubmitFunding', () => {
    it('is disabled unless ALLOW_TEST_SIGNING is "true"', async () => {
      config.get.mockReturnValue(undefined);

      await expect(
        service.testSignAndSubmitFunding(
          'shipment-1',
          'payment-1',
          'shipper-1',
          shipperKeypair.secret(),
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects a secret that does not match the payment shipper wallet', async () => {
      config.get.mockReturnValue('true');
      shipmentRepo.findOne.mockResolvedValue(makeShipment());
      paymentRepo.findOne.mockResolvedValue(makePayment());

      await expect(
        service.testSignAndSubmitFunding(
          'shipment-1',
          'payment-1',
          'shipper-1',
          Keypair.random().secret(),
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('signs with the provided secret and submits via fundEscrow when enabled', async () => {
      config.get.mockReturnValue('true');
      shipmentRepo.findOne.mockResolvedValue(makeShipment());
      paymentRepo.findOne.mockResolvedValue(makePayment());
      paymentRepo.update.mockResolvedValueOnce({ affected: 1 });
      stellarContractService.fundEscrow.mockResolvedValue({
        txHash: 'test-tx-hash',
        status: 'PENDING',
      });

      const result = await service.testSignAndSubmitFunding(
        'shipment-1',
        'payment-1',
        'shipper-1',
        shipperKeypair.secret(),
      );

      expect(result.status).toBe(PaymentStatus.FUNDED);
      expect(stellarContractService.fundEscrow).toHaveBeenCalledWith(
        expect.any(Keypair),
        'GCARRIER',
        1n,
        expect.any(BigInt),
      );
    });
  });

  // ── Issue #1543: partial cancellation settlement ─────────────────────────
  //
  // A cancellation must actually move the money: with a fee, the shipper gets
  // `amount - fee` on chain and the platform keeps `fee`. A zero fee must stay
  // on the original full-refund path. And a chain call must only happen when
  // escrow is genuinely held and genuinely refundable.
  describe('refundEscrowForShipment', () => {
    const funded = (overrides: Partial<Payment> = {}) =>
      makePayment({ status: PaymentStatus.FUNDED, ...overrides });

    it('splits the escrow when a fee is charged', async () => {
      paymentRepo.findOne.mockResolvedValue(funded({ amount: 100 }));

      const result = await service.refundEscrowForShipment('shipment-1', 10);

      // 10 USDC → 10 * 10^7 base units.
      expect(stellarContractService.refundPaymentWithFee).toHaveBeenCalledWith(
        1n,
        100_000_000n,
      );
      expect(stellarContractService.refundPayment).not.toHaveBeenCalled();
      expect(result).toEqual({
        txHash: 'refund-fee-hash',
        status: 'SUCCESS',
        feeAmount: 100_000_000n,
        refundAmount: 900_000_000n,
      });
    });

    it('marks the payment REFUNDED and records settlement after a fee split', async () => {
      paymentRepo.findOne.mockResolvedValue(funded({ amount: 100 }));

      await service.refundEscrowForShipment('shipment-1', 25);

      expect(paymentRepo.update).toHaveBeenCalledWith('payment-1', {
        status: PaymentStatus.REFUNDED,
        settledAt: expect.any(Date),
        stellarTxHash: 'refund-fee-hash',
      });
    });

    it('uses the plain full-refund path for a zero fee', async () => {
      paymentRepo.findOne.mockResolvedValue(funded({ amount: 100 }));

      const result = await service.refundEscrowForShipment('shipment-1', 0);

      expect(stellarContractService.refundPayment).toHaveBeenCalledWith(1n);
      expect(stellarContractService.refundPaymentWithFee).not.toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({ feeAmount: 0n, refundAmount: 1_000_000_000n }),
      );
    });

    it('defaults to a zero fee when no fee is supplied', async () => {
      paymentRepo.findOne.mockResolvedValue(funded());

      await service.refundEscrowForShipment('shipment-1');

      expect(stellarContractService.refundPayment).toHaveBeenCalledWith(1n);
    });

    it('converts the fee into the payment’s settlement asset base units', async () => {
      paymentRepo.findOne.mockResolvedValue(
        funded({ amount: 50, assetCode: 'XLM' }),
      );

      await service.refundEscrowForShipment('shipment-1', 5);

      // XLM and USDC are both 7dp here, so the conversion is the same shift —
      // what matters is that the payment's own assetCode drives it.
      expect(stellarContractService.refundPaymentWithFee).toHaveBeenCalledWith(
        1n,
        50_000_000n,
      );
    });

    it('does nothing when the shipment was never funded', async () => {
      paymentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.refundEscrowForShipment('shipment-1', 10),
      ).resolves.toBeUndefined();

      expect(stellarContractService.refundPaymentWithFee).not.toHaveBeenCalled();
      expect(stellarContractService.refundPayment).not.toHaveBeenCalled();
      expect(paymentRepo.update).not.toHaveBeenCalled();
    });

    it.each([
      ['still pending', PaymentStatus.PENDING],
      ['mid-funding', PaymentStatus.FUNDING],
      ['already released', PaymentStatus.RELEASED],
      ['already refunded', PaymentStatus.REFUNDED],
      ['cancelled', PaymentStatus.CANCELLED],
    ])(
      'makes no chain call when the payment is %s',
      async (_label, status) => {
        paymentRepo.findOne.mockResolvedValue(funded({ status }));

        await expect(
          service.refundEscrowForShipment('shipment-1', 10),
        ).resolves.toBeUndefined();

        expect(
          stellarContractService.refundPaymentWithFee,
        ).not.toHaveBeenCalled();
        expect(stellarContractService.refundPayment).not.toHaveBeenCalled();
        expect(paymentRepo.update).not.toHaveBeenCalled();
      },
    );

    // A disputed escrow is mid-dispute on chain; refund_payment_with_fee
    // rejects it. Cancelling that way must be a no-op, leaving the escrow for
    // resolveEscrowDisputeForShipment to settle in full.
    it('does not settle a disputed escrow through the cancellation path', async () => {
      paymentRepo.findOne.mockResolvedValue(
        funded({ status: PaymentStatus.DISPUTED }),
      );

      await expect(
        service.refundEscrowForShipment('shipment-1', 10),
      ).resolves.toBeUndefined();

      expect(stellarContractService.refundPaymentWithFee).not.toHaveBeenCalled();
      expect(stellarContractService.refundPayment).not.toHaveBeenCalled();
      // The row must not be flipped to REFUNDED behind the dispute flow's
      // back, or local state would claim a settlement that never happened.
      expect(paymentRepo.update).not.toHaveBeenCalled();
    });

    it('rejects a fee that would consume the whole escrow before calling the chain', async () => {
      paymentRepo.findOne.mockResolvedValue(funded({ amount: 100 }));

      await expect(
        service.refundEscrowForShipment('shipment-1', 100),
      ).rejects.toThrow(InvalidCancellationFeeError);

      expect(stellarContractService.refundPaymentWithFee).not.toHaveBeenCalled();
      // Left FUNDED so the shipment is not cancelled into a half-settled state.
      expect(paymentRepo.update).not.toHaveBeenCalled();
    });

    it('rejects a fee larger than the escrow', async () => {
      paymentRepo.findOne.mockResolvedValue(funded({ amount: 100 }));

      await expect(
        service.refundEscrowForShipment('shipment-1', 150),
      ).rejects.toThrow(InvalidCancellationFeeError);
      expect(paymentRepo.update).not.toHaveBeenCalled();
    });

    it('accepts the largest fee the contract allows (one base unit short)', async () => {
      // 1 base unit of a 100 USDC escrow = 0.0000001, not expressible in
      // the fiat amount, so use a small escrow where it is.
      paymentRepo.findOne.mockResolvedValue(funded({ amount: 0.0000002 }));

      await service.refundEscrowForShipment('shipment-1', 0.0000001);

      expect(stellarContractService.refundPaymentWithFee).toHaveBeenCalledWith(
        1n,
        1n,
      );
    });

    it('propagates a contract rejection without marking the payment refunded', async () => {
      paymentRepo.findOne.mockResolvedValue(funded());
      stellarContractService.refundPaymentWithFee.mockRejectedValue(
        new EscrowContractError(
          EscrowErrorCode.InvalidStatus,
          'HostError: Error(Contract, #6)',
        ),
      );

      await expect(
        service.refundEscrowForShipment('shipment-1', 10),
      ).rejects.toThrow(EscrowContractError);
      expect(paymentRepo.update).not.toHaveBeenCalled();
    });

    it('propagates a submission failure without marking the payment refunded', async () => {
      paymentRepo.findOne.mockResolvedValue(funded());
      stellarContractService.refundPaymentWithFee.mockRejectedValue(
        new ChainTimeoutError('timed out'),
      );

      await expect(
        service.refundEscrowForShipment('shipment-1', 10),
      ).rejects.toThrow(ChainTimeoutError);
      expect(paymentRepo.update).not.toHaveBeenCalled();
    });
  });
});
