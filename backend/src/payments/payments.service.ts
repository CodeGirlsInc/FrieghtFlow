import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Keypair } from '@stellar/stellar-sdk';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { User } from '../users/entities/user.entity';
import { StellarContractService } from '../stellar/stellar-contract.service';
import { ContractCallResult } from '../stellar/escrow-record.interface';
import {
  priceToBaseUnits,
  resolveSettlementAssetDecimals,
} from './settlement-asset.util';
import { mapStellarFundingError } from './errors/stellar-error-mapper';
import {
  ForbiddenPaymentActionError,
  MissingWalletAddressError,
  PaymentAlreadyFundedError,
  PaymentAlreadyInFlightError,
  ShipmentNotAcceptedError,
} from './errors/payment-flow.errors';

export interface InitiateFundingResult {
  paymentId: string;
  status: PaymentStatus;
  unsignedXdr: string;
}

export interface SubmitFundingResult {
  paymentId: string;
  status: PaymentStatus;
  stellarTxHash: string | null;
}

export interface PaymentResponse {
  payment: Payment | null;
}

// A payment beyond this point is either funded or otherwise terminal for
// this issue's purposes — funding it again (or funding a still-in-flight
// one) is always a 4xx, never a fresh chain call.
const NON_FUNDABLE_STATUSES = new Set<PaymentStatus>([
  PaymentStatus.FUNDED,
  PaymentStatus.RELEASED,
  PaymentStatus.REFUNDED,
]);

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly stellarContractService: StellarContractService,
    private readonly config: ConfigService,
  ) {}

  async findByShipmentIdForUser(
    shipmentId: string,
    user: User,
  ): Promise<PaymentResponse> {
    const shipment = await this.getShipment(shipmentId);

    const isShipper = shipment.shipperId === user.id;
    const isCarrier = shipment.carrierId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isShipper && !isCarrier && !isAdmin) {
      throw new ForbiddenException(
        'You do not have access to this shipment payment',
      );
    }

    const payment = await this.findByShipmentId(shipmentId);
    return { payment };
  }

  async getOrCreatePayment(
    shipmentId: string,
    amount: number,
    assetCode = 'USDC',
    tokenContractAddress?: string,
    shipperWalletAddress?: string,
    carrierWalletAddress?: string,
  ): Promise<Payment> {
    resolveSettlementAssetDecimals(assetCode);

    const existing = await this.paymentRepo.findOne({ where: { shipmentId } });
    if (existing) {
      return existing;
    }

    const onChainShipmentId = await this.generateNextOnChainId();

    const payment = this.paymentRepo.create({
      shipmentId,
      onChainShipmentId,
      amount,
      assetCode,
      tokenContractAddress: tokenContractAddress ?? null,
      shipperWalletAddress: shipperWalletAddress ?? null,
      carrierWalletAddress: carrierWalletAddress ?? null,
      status: PaymentStatus.PENDING,
    });

    try {
      return await this.paymentRepo.save(payment);
    } catch (error: unknown) {
      const pgError = error as { code?: string } | undefined;
      if (pgError?.code === '23505') {
        const retry = await this.paymentRepo.findOne({
          where: { shipmentId },
        });
        if (retry) return retry;
        throw new ConflictException(
          `Payment for shipment ${shipmentId} already exists`,
        );
      }
      throw error;
    }
  }

  async findByShipmentId(shipmentId: string): Promise<Payment | null> {
    return this.paymentRepo.findOne({ where: { shipmentId } });
  }

  async findByOnChainId(onChainShipmentId: number): Promise<Payment | null> {
    return this.paymentRepo.findOne({ where: { onChainShipmentId } });
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
    extra?: { fundedAt?: Date; settledAt?: Date },
  ): Promise<Payment> {
    const payment = await this.paymentRepo.findOneByOrFail({ id });
    payment.status = status;
    if (extra?.fundedAt) payment.fundedAt = extra.fundedAt;
    if (extra?.settledAt) payment.settledAt = extra.settledAt;
    return this.paymentRepo.save(payment);
  }

  async releaseEscrowForShipment(shipmentId: string): Promise<void> {
    const payment = await this.findByShipmentId(shipmentId);
    if (!payment) {
      return;
    }

    await this.stellarContractService.releasePayment(
      BigInt(payment.onChainShipmentId),
    );
  }

  private async generateNextOnChainId(): Promise<number> {
    const result = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('COALESCE(MAX(payment.on_chain_shipment_id), 0) + 1', 'next_id')
      .getRawOne<{ next_id: string }>();
    return Number(result?.next_id ?? 1);
  }

  // ── Funding (issue #1276) ────────────────────────────────────────────────

  /**
   * Builds (and simulates) an unsigned `fund_escrow` transaction for the
   * shipment's shipper to sign client-side — the platform never holds
   * shipper keys (non-custodial deposit model). Safe to call repeatedly
   * while the payment is still PENDING: simulation is read-only, so a
   * double-click here never risks a duplicate chain call (that guarantee
   * is enforced in submitFunding, where the actual chain call happens).
   */
  async initiateFunding(
    shipmentId: string,
    requesterId: string,
  ): Promise<InitiateFundingResult> {
    const shipment = await this.getShipment(shipmentId);
    if (shipment.shipperId !== requesterId) {
      throw new ForbiddenPaymentActionError();
    }
    if (shipment.status !== ShipmentStatus.ACCEPTED) {
      throw new ShipmentNotAcceptedError();
    }

    const [shipper, carrier] = await Promise.all([
      this.getUser(shipment.shipperId),
      this.getUser(shipment.carrierId as string),
    ]);
    if (!shipper.walletAddress) {
      throw new MissingWalletAddressError('shipper');
    }
    if (!carrier.walletAddress) {
      throw new MissingWalletAddressError('carrier');
    }

    const payment = await this.claimPaymentRowForFunding(
      shipment,
      carrier.walletAddress,
      shipper.walletAddress,
    );

    const amount = priceToBaseUnits(Number(shipment.price), payment.assetCode);
    try {
      const unsignedXdr =
        await this.stellarContractService.buildFundEscrowTransaction(
          shipper.walletAddress,
          carrier.walletAddress,
          BigInt(payment.onChainShipmentId),
          amount,
        );
      return { paymentId: payment.id, status: payment.status, unsignedXdr };
    } catch (error) {
      throw mapStellarFundingError(error);
    }
  }

  /**
   * Submits the shipper-signed `fund_escrow` XDR from initiateFunding.
   * Atomically claims the payment row (PENDING → FUNDING) before making the
   * chain call, so two concurrent submit requests for the same payment can
   * never both submit — the loser sees PaymentAlreadyInFlightError instead
   * (issue #1276's tested concurrency requirement).
   */
  async submitFunding(
    shipmentId: string,
    paymentId: string,
    requesterId: string,
    signedXdr: string,
  ): Promise<SubmitFundingResult> {
    const payment = await this.getFundablePayment(
      shipmentId,
      paymentId,
      requesterId,
    );
    return this.claimAndSubmit(payment, () =>
      this.stellarContractService.submitSignedTransaction(signedXdr),
    );
  }

  /**
   * Test-only path (issue #1276: "a shipper can fund a real testnet escrow
   * end-to-end via the test-signing path") for verifying the funding flow
   * before the frontend wallet UI (a later issue) exists to sign
   * client-side. Disabled unless ALLOW_TEST_SIGNING="true" — never a
   * substitute for the non-custodial submit endpoint above.
   */
  async testSignAndSubmitFunding(
    shipmentId: string,
    paymentId: string,
    requesterId: string,
    shipperSecret: string,
  ): Promise<SubmitFundingResult> {
    if (String(this.config.get('ALLOW_TEST_SIGNING')) !== 'true') {
      throw new ForbiddenException(
        'Test-signing path is disabled (ALLOW_TEST_SIGNING is not "true")',
      );
    }

    const payment = await this.getFundablePayment(
      shipmentId,
      paymentId,
      requesterId,
    );
    const signer = Keypair.fromSecret(shipperSecret);
    if (signer.publicKey() !== payment.shipperWalletAddress) {
      throw new ForbiddenException(
        "The provided secret does not match this payment's shipper wallet address",
      );
    }

    return this.claimAndSubmit(payment, () =>
      this.stellarContractService.fundEscrow(
        signer,
        payment.carrierWalletAddress as string,
        BigInt(payment.onChainShipmentId),
        priceToBaseUnits(Number(payment.amount), payment.assetCode),
      ),
    );
  }

  private async getFundablePayment(
    shipmentId: string,
    paymentId: string,
    requesterId: string,
  ): Promise<Payment> {
    const shipment = await this.getShipment(shipmentId);
    if (shipment.shipperId !== requesterId) {
      throw new ForbiddenPaymentActionError();
    }

    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId, shipmentId },
    });
    if (!payment) {
      throw new NotFoundException(
        `Payment ${paymentId} not found for shipment ${shipmentId}`,
      );
    }
    if (NON_FUNDABLE_STATUSES.has(payment.status)) {
      throw new PaymentAlreadyFundedError(payment.id);
    }
    return payment;
  }

  /**
   * Atomically claims `payment` (PENDING → FUNDING) before invoking `submit`
   * — the actual chain call — so two concurrent callers can never both
   * submit for the same payment; the loser sees PaymentAlreadyInFlightError
   * instead (issue #1276's tested concurrency requirement). On failure the
   * claim is released back to PENDING so a legitimate retry is possible.
   */
  private async claimAndSubmit(
    payment: Payment,
    submit: () => Promise<ContractCallResult>,
  ): Promise<SubmitFundingResult> {
    const claim = await this.paymentRepo.update(
      { id: payment.id, status: PaymentStatus.PENDING },
      { status: PaymentStatus.FUNDING },
    );
    if (claim.affected !== 1) {
      throw new PaymentAlreadyInFlightError(payment.id);
    }

    try {
      const result = await submit();

      await this.paymentRepo.update(payment.id, {
        status: PaymentStatus.FUNDED,
        fundedAt: new Date(),
        stellarTxHash: result.txHash,
        failureReason: null,
      });

      return {
        paymentId: payment.id,
        status: PaymentStatus.FUNDED,
        stellarTxHash: result.txHash,
      };
    } catch (error) {
      const mapped = mapStellarFundingError(error);
      await this.paymentRepo.update(payment.id, {
        status: PaymentStatus.PENDING,
        failureReason: mapped.code,
      });
      throw mapped;
    }
  }

  private async getShipment(shipmentId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id: shipmentId },
    });
    if (!shipment) {
      throw new NotFoundException(`Shipment ${shipmentId} not found`);
    }
    return shipment;
  }

  private async getUser(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    return user;
  }

  // Creates the Payment row on first funding attempt for this shipment; on
  // a later attempt for an already-PENDING row, refreshes the carrier
  // binding so a carrier reassignment since the row was created (dispute /
  // cancel-before-funding, new bid accepted) is never silently reused
  // stale (issue #1276 edge case).
  private async claimPaymentRowForFunding(
    shipment: Shipment,
    carrierWalletAddress: string,
    shipperWalletAddress: string,
  ): Promise<Payment> {
    const payment = await this.getOrCreatePayment(
      shipment.id,
      Number(shipment.price),
      'USDC',
      undefined,
      shipperWalletAddress,
      carrierWalletAddress,
    );

    if (NON_FUNDABLE_STATUSES.has(payment.status)) {
      throw new PaymentAlreadyFundedError(payment.id);
    }
    if (payment.status === PaymentStatus.FUNDING) {
      throw new PaymentAlreadyInFlightError(payment.id);
    }

    if (
      payment.carrierWalletAddress !== carrierWalletAddress ||
      payment.shipperWalletAddress !== shipperWalletAddress
    ) {
      payment.carrierWalletAddress = carrierWalletAddress;
      payment.shipperWalletAddress = shipperWalletAddress;
      payment.failureReason = null;
      await this.paymentRepo.save(payment);
    }

    return payment;
  }
}
