
import { Processor, Process } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockchainTransaction } from './entities/blockchain.entity';
import { SorobanProvider } from './soroban.provider';


@Processor('blockchain')
export class BlockchainProcessor {
  private provider = new SorobanProvider();
    txRepo: any;

  @Process('submit-tx')
  async handle(job: { data: { txId: any; }; }) {
    const tx = await this.txRepo.findOneBy({ id: job.data.txId });

    const hash = await this.provider.recordEvent({
      shipmentId: tx.freight_job_id,
      eventType: tx.event_type,
      hash: tx.event_data.hash,
      actor: tx.event_data.actor,
    });

    tx.transaction_hash = hash;
    tx.status = 'confirmed';
    tx.confirmed_at = new Date();

    await this.txRepo.save(tx);
  }
}
