import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async processPayment(dto: ProcessPaymentDto) {
    if (!dto.freightJobAssigned) {
      throw new BadRequestException('Freight job not assigned');
    }

    if (dto.amount !== dto.estimatedCost) {
      throw new BadRequestException('Payment amount mismatch');
    }

    const payment = this.paymentRepo.create({
      freightJobId: dto.freightJobId,
      payerId: dto.payerId,
      payeeId: dto.payeeId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      status: 'processing',
      transactionId: randomUUID(),
    });

    // Payment provider stub
    payment.status = 'completed';
    payment.processedAt = new Date();

    return this.paymentRepo.save(payment);
  }

  async findAll() {
    return this.paymentRepo.find();
  }

  async findOne(id: string) {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException();
    return payment;
  }

  async findByJob(jobId: string) {
    return this.paymentRepo.find({ where: { freightJobId: jobId } });
  }

  async refund(id: string, isAdmin: boolean) {
    if (!isAdmin) {
      throw new ForbiddenException('Admin approval required');
    }

    const payment = await this.findOne(id);
    payment.status = 'refunded';

    return this.paymentRepo.save(payment);
  }
}
