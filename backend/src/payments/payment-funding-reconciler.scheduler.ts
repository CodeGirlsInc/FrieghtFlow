import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan, Repository } from 'typeorm';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { StellarContractService } from '../stellar/stellar-contract.service';
import { Payment } from './entities/payment.entity';

const STALE_FUNDING_AGE_MS = 60_000;

@Injectable()
export class PaymentFundingReconcilerScheduler implements OnModuleInit {
  private readonly logger = new Logger(PaymentFundingReconcilerScheduler.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly stellarContractService: StellarContractService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.sweep();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async sweep(): Promise<void> {
    let payments: Payment[];
    try {
      payments = await this.paymentRepo.find({
        where: {
          status: PaymentStatus.FUNDING,
          updatedAt: LessThan(new Date(Date.now() - STALE_FUNDING_AGE_MS)),
        },
      });
    } catch (error) {
      this.logError('Could not load stale funding payments', error);
      return;
    }

    for (const payment of payments) {
      try {
        await this.reconcile(payment);
      } catch (error) {
        this.logError(`Could not reconcile payment ${payment.id}`, error);
      }
    }
  }

  private async reconcile(payment: Payment): Promise<void> {
    const escrow = await this.stellarContractService.getEscrow(
      BigInt(payment.onChainShipmentId),
    );

    if (escrow.status === 'Funded') {
      await this.paymentRepo.update(
        { id: payment.id, status: PaymentStatus.FUNDING },
        {
          status: PaymentStatus.FUNDED,
          fundedAt: escrow.fundedAt
            ? new Date(Number(escrow.fundedAt) * 1_000)
            : new Date(),
          failureReason: null,
        },
      );
      this.logger.log(`Reconciled payment ${payment.id} as FUNDED`);
      return;
    }

    if (
      payment.stellarTxHash &&
      (await this.stellarContractService.getTransactionStatus(
        payment.stellarTxHash,
      )) === 'FAILED'
    ) {
      await this.paymentRepo.update(
        { id: payment.id, status: PaymentStatus.FUNDING },
        {
          status: PaymentStatus.PENDING,
          failureReason: 'ESCROW_SUBMISSION_FAILED',
        },
      );
      this.logger.warn(
        `Reconciled failed funding transaction for payment ${payment.id}`,
      );
    }
  }

  private logError(context: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.error(`${context}: ${message}`);
  }
}
