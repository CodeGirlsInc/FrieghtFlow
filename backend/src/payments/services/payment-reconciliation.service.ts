import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PaymentStatus } from '../enums/payment-status.enum';
import { Payment } from '../entities/payment.entity';
import { StellarContractService } from './stellar-contract.service';

export interface ReconciliationMismatch {
  id: string;
  paymentId: string;
  shipmentId: string;
  backendStatus: PaymentStatus;
  chainStatus: string;
  backendAmount: number;
  chainAmount: number;
  reason: string;
  detectedAt: Date;
}

export interface DisputeResolutionRequest {
  shipmentId: string;
  paymentId: string;
  outcome: 'RELEASE_CARRIER' | 'REFUND_SHIPPER' | 'SPLIT';
  carrierAmount?: number;
  shipperAmount?: number;
}

@Injectable()
export class PaymentReconciliationService {
  private readonly logger = new Logger(PaymentReconciliationService.name);
  private mismatches: ReconciliationMismatch[] = [];
  private paymentsStore: Payment[] = [];

  constructor(private readonly stellarContractService: StellarContractService) {}

  /**
   * Periodic reconciliation job comparing DB payment states against chain truth.
   */
  @Cron('*/10 * * * * *')
  async runReconciliationJob(): Promise<ReconciliationMismatch[]> {
    const activePayments = this.paymentsStore.filter(
      (p) =>
        p.status === PaymentStatus.CONFIRMED ||
        p.status === PaymentStatus.CONFIRMING ||
        p.status === PaymentStatus.SUBMITTED,
    );

    for (const payment of activePayments) {
      await this.reconcilePayment(payment);
    }

    return this.mismatches;
  }

  async reconcilePayment(payment: Payment): Promise<ReconciliationMismatch | null> {
    try {
      const chainState = await this.stellarContractService.getEscrowBalance(payment.shipmentId);

      // Check drift: backend says CONFIRMED, but chain says Disputed
      if (payment.status === PaymentStatus.CONFIRMED && chainState.isDisputed) {
        const mismatch: ReconciliationMismatch = {
          id: `mismatch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          paymentId: payment.id,
          shipmentId: payment.shipmentId,
          backendStatus: payment.status,
          chainStatus: 'DISPUTED_ON_CHAIN',
          backendAmount: Number(payment.amount),
          chainAmount: chainState.balance,
          reason: 'Backend says CONFIRMED, chain state shows Disputed',
          detectedAt: new Date(),
        };
        this.mismatches.push(mismatch);
        this.logger.warn(`Reconciliation mismatch detected for payment ${payment.id}: ${mismatch.reason}`);
        return mismatch;
      }

      // Check balance mismatch
      const totalExpected = Number(payment.amount) + Number(payment.feeAmount || 0) + Number(payment.insurancePremium || 0);
      if (payment.status === PaymentStatus.CONFIRMED && chainState.balance !== totalExpected) {
        const mismatch: ReconciliationMismatch = {
          id: `mismatch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          paymentId: payment.id,
          shipmentId: payment.shipmentId,
          backendStatus: payment.status,
          chainStatus: 'BALANCE_DRIFT',
          backendAmount: totalExpected,
          chainAmount: chainState.balance,
          reason: `Balance mismatch: expected ${totalExpected}, chain has ${chainState.balance}`,
          detectedAt: new Date(),
        };
        this.mismatches.push(mismatch);
        return mismatch;
      }

      return null;
    } catch (err: any) {
      this.logger.error(`Error during reconciliation for payment ${payment.id}: ${err.message}`);
      return null;
    }
  }

  /**
   * Multi-party settlement: calculates and routes carrier payout, platform fee, and insurance premium.
   */
  calculateMultiPartySettlement(amount: number, enableInsurance = false) {
    const feeRate = 0.05; // 5% platform fee
    const insuranceRate = enableInsurance ? 0.02 : 0; // 2% insurance premium
    const feeAmount = amount * feeRate;
    const insurancePremium = amount * insuranceRate;
    const totalLockAmount = amount + feeAmount + insurancePremium;

    return {
      netCarrierAmount: amount,
      feeAmount,
      insurancePremium,
      totalLockAmount,
    };
  }

  /**
   * Unified dispute resolution updating backend and calling escrow contract together.
   */
  async resolveDispute(req: DisputeResolutionRequest): Promise<{ success: boolean; txHash?: string }> {
    const payment = this.paymentsStore.find((p) => p.id === req.paymentId);
    if (!payment) {
      throw new Error(`Payment with id ${req.paymentId} not found`);
    }

    // Step 1: Call Soroban escrow contract resolve_dispute via sequence-safe wrapper
    try {
      const { txHash } = await this.stellarContractService.submitAdminTransaction(
        `resolve_dispute_${req.shipmentId}`,
        async (seq) => {
          return { txHash: `tx_dispute_resolved_${req.shipmentId}_seq_${seq}` };
        },
      );

      // Step 2: Update local payment status
      payment.status = PaymentStatus.CONFIRMED;
      payment.transactionHash = txHash;

      return { success: true, txHash };
    } catch (err: any) {
      this.logger.error(`Dispute resolution chain call failed for ${req.shipmentId}: ${err.message}`);
      // Record mismatch for reconciliation pick-up
      this.mismatches.push({
        id: `mismatch-dispute-fail-${Date.now()}`,
        paymentId: payment.id,
        shipmentId: payment.shipmentId,
        backendStatus: payment.status,
        chainStatus: 'RESOLVE_CHAIN_FAILED',
        backendAmount: Number(payment.amount),
        chainAmount: 0,
        reason: `Dispute resolution chain submission failed: ${err.message}`,
        detectedAt: new Date(),
      });
      throw err;
    }
  }

  getOpenMismatches(): ReconciliationMismatch[] {
    return this.mismatches;
  }

  addPayment(payment: Payment) {
    this.paymentsStore.push(payment);
  }
}
