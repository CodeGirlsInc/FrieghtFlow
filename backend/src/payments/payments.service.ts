import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from '../common/enums/payment-status.enum';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async getOrCreatePayment(
    shipmentId: string,
    amount: number,
    assetCode = 'USDC',
    tokenContractAddress?: string,
    shipperWalletAddress?: string,
    carrierWalletAddress?: string,
  ): Promise<Payment> {
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

  private async generateNextOnChainId(): Promise<number> {
    const result = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('COALESCE(MAX(payment.on_chain_shipment_id), 0) + 1', 'next_id')
      .getRawOne<{ next_id: string }>();
    return Number(result?.next_id ?? 1);
  }
}
