// src/blockchain/blockchain.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockchainTransaction } from './entities/blockchain.entity';
@Injectable()
export class BlockchainService {
  constructor(
    @InjectQueue('blockchain')
    private blockchainQueue: Queue,

    @InjectRepository(BlockchainTransaction)
    private txRepo: Repository<BlockchainTransaction>,
  ) {}

  async recordEvent(dto: {
    freightJobId: string;
    eventType: string;
    eventData: any;
  }) {
    const tx = await this.txRepo.save({
      freight_job_id: dto.freightJobId,
      event_type: dto.eventType,
      event_data: dto.eventData,
      network: process.env.BLOCKCHAIN_NETWORK,
      transaction_hash: 'PENDING',
    });

    await this.blockchainQueue.add(
      'submit-tx',
      { txId: tx.id },
      { attempts: 5, backoff: 10000 },
    );

    return { message: 'Event queued for blockchain submission', txId: tx.id };
  }

  async getEvents(shipmentId: string) {
    return this.txRepo.find({
      where: { freight_job_id: shipmentId },
      order: { created_at: 'ASC' },
    });
  }

  async verifyTransaction(hash: string) {
    return this.txRepo.findOne({
      where: { transaction_hash: hash },
    });
  }

  async generateProof(shipmentId: string) {
    const events = await this.getEvents(shipmentId);

    return {
      shipmentId,
      eventCount: events.length,
      merkleRoot: '0xPROOF_HASH',
      events,
    };
  }
}
