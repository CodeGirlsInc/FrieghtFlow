import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

@Injectable()
export class QueuesService {
  constructor(
    @InjectQueue('stellar-anchor') private readonly stellarQueue: Queue,
    @InjectQueue('email-send') private readonly emailQueue: Queue,
    @InjectQueue('pdf-generate') private readonly pdfQueue: Queue,
  ) {}

  async getStats(): Promise<QueueStats[]> {
    const queues = [
      { name: 'stellar-anchor', queue: this.stellarQueue },
      { name: 'email-send', queue: this.emailQueue },
      { name: 'pdf-generate', queue: this.pdfQueue },
    ];

    return Promise.all(
      queues.map(async ({ name, queue }) => {
        const [waiting, active, completed, failed, delayed] = await Promise.all(
          [
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getCompletedCount(),
            queue.getFailedCount(),
            queue.getDelayedCount(),
          ],
        );
        return { name, waiting, active, completed, failed, delayed };
      }),
    );
  }
}
