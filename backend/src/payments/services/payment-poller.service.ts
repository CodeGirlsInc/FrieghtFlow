import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentStatus } from '../enums/payment-status.enum';
import { Payment } from '../entities/payment.entity';
import { StellarContractService } from './stellar-contract.service';
import { PaymentsGateway } from '../gateways/payments.gateway';

export interface AuditLogEntry {
  type: string;
  paymentId: string;
  details: string;
  timestamp: Date;
}

@Injectable()
export class PaymentPollerService {
  private readonly logger = new Logger(PaymentPollerService.name);
  private paymentsStore: Payment[] = [];
  private auditLogs: AuditLogEntry[] = [];
  public readonly MAX_ATTEMPTS = 5;
  public readonly CONSECUTIVE_NOT_FOUND_THRESHOLD = 3;

  constructor(
    private readonly stellarContractService: StellarContractService,
    private readonly paymentsGateway?: PaymentsGateway,
  ) {}

  @Cron('*/5 * * * * *')
  async pollPendingPayments(): Promise<void> {
    const pendingPayments = this.paymentsStore.filter(
      (p) =>
        p.status === PaymentStatus.SUBMITTED ||
        p.status === PaymentStatus.CONFIRMING,
    );

    for (const payment of pendingPayments) {
      await this.processPaymentPoll(payment);
    }
  }

  async processPaymentPoll(payment: Payment): Promise<Payment> {
    payment.lastPolledAt = new Date();
    payment.retryCount += 1;

    if (!payment.transactionHash) {
      return this.transitionTo(payment, PaymentStatus.FAILED, 'Missing transaction hash');
    }

    try {
      const txResult = await this.stellarContractService.checkTransactionStatus(
        payment.transactionHash,
      );

      if (txResult.status === 'CONFIRMED') {
        payment.consecutiveNotFoundCount = 0;
        return this.transitionTo(payment, PaymentStatus.CONFIRMED);
      }

      if (txResult.status === 'REJECTED') {
        payment.consecutiveNotFoundCount = 0;
        return this.transitionTo(
          payment,
          PaymentStatus.REJECTED,
          txResult.error || 'Contract level rejection',
        );
      }

      if (txResult.status === 'NOT_FOUND') {
        payment.consecutiveNotFoundCount += 1;
        if (payment.consecutiveNotFoundCount >= this.CONSECUTIVE_NOT_FOUND_THRESHOLD) {
          return this.transitionTo(
            payment,
            PaymentStatus.FAILED,
            `Transaction not found after ${this.CONSECUTIVE_NOT_FOUND_THRESHOLD} consecutive polls`,
          );
        }
      }

      if (payment.retryCount >= this.MAX_ATTEMPTS) {
        return this.transitionTo(
          payment,
          PaymentStatus.TIMED_OUT,
          `Max polling attempts (${this.MAX_ATTEMPTS}) exhausted`,
        );
      }

      payment.status = PaymentStatus.CONFIRMING;
      return payment;
    } catch (err: any) {
      this.logger.error(`Error polling transaction ${payment.transactionHash}: ${err.message}`);
      if (payment.retryCount >= this.MAX_ATTEMPTS) {
        return this.transitionTo(payment, PaymentStatus.TIMED_OUT, err.message);
      }
      return payment;
    }
  }

  private transitionTo(
    payment: Payment,
    targetStatus: PaymentStatus,
    reason?: string,
  ): Payment {
    payment.status = targetStatus;
    if (reason) {
      payment.failureReason = reason;
    }
    this.logger.log(
      `Payment ${payment.id} transitioned to ${targetStatus}${reason ? ` (Reason: ${reason})` : ''}`,
    );

    if (this.paymentsGateway) {
      this.paymentsGateway.emitPaymentEvent(targetStatus.toLowerCase(), {
        paymentId: payment.id,
        shipmentId: payment.shipmentId,
        status: targetStatus,
        reason,
      });
    }

    if (
      targetStatus === PaymentStatus.TIMED_OUT ||
      targetStatus === PaymentStatus.REJECTED ||
      targetStatus === PaymentStatus.FAILED
    ) {
      this.auditLogs.push({
        type: `payment_${targetStatus.toLowerCase()}`,
        paymentId: payment.id,
        details: reason || `Payment ${targetStatus}`,
        timestamp: new Date(),
      });
    }

    return payment;
  }

  addPayment(payment: Payment) {
    this.paymentsStore.push(payment);
  }

  getPayments(): Payment[] {
    return this.paymentsStore;
  }

  getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }
}
