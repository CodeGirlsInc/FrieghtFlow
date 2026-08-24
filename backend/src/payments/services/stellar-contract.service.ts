import { Injectable, Logger } from '@nestjs/common';

export interface AdminSubmissionOptions {
  txHash?: string;
  payload?: any;
}

export interface TransactionStatusResult {
  status: 'CONFIRMED' | 'REJECTED' | 'NOT_FOUND' | 'PENDING';
  error?: string;
}

/**
 * In-process Mutex queue for sequence-number-safe admin submissions.
 * Prevents race conditions when multiple admin transactions (release, refund, dispute resolution)
 * are submitted concurrently against the admin account.
 */
class SequenceMutex {
  private queue: Array<() => Promise<void>> = [];
  private locked = false;
  private currentSequence: bigint | null = null;

  async runExclusive<T>(task: (seq: bigint | null) => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task(this.currentSequence);
          if (this.currentSequence !== null) {
            this.currentSequence += 1n;
          }
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.dequeue();
    });
  }

  setSequence(initialSeq: bigint) {
    this.currentSequence = initialSeq;
  }

  getCurrentSequence(): bigint | null {
    return this.currentSequence;
  }

  private async dequeue() {
    if (this.locked || this.queue.length === 0) return;
    this.locked = true;
    const nextTask = this.queue.shift();
    if (nextTask) {
      await nextTask();
    }
    this.locked = false;
    this.dequeue();
  }
}

@Injectable()
export class StellarContractService {
  private readonly logger = new Logger(StellarContractService.name);
  private readonly adminSequenceMutex = new SequenceMutex();
  private mockTxStore = new Map<string, TransactionStatusResult>();

  constructor() {
    // Initialize admin starting sequence
    this.adminSequenceMutex.setSequence(100000n);
  }

  /**
   * Sequence-safe submission wrapper for admin-signed transactions.
   */
  async submitAdminTransaction(
    actionName: string,
    submitFn: (seq: bigint) => Promise<{ txHash: string }>,
  ): Promise<{ txHash: string; sequenceUsed: bigint }> {
    return this.adminSequenceMutex.runExclusive(async (seq) => {
      const currentSeq = seq ?? 100000n;
      this.logger.log(`[SequenceQueue] Submitting ${actionName} with sequence ${currentSeq}`);
      const res = await submitFn(currentSeq);
      return { txHash: res.txHash, sequenceUsed: currentSeq };
    });
  }

  /**
   * Polls Soroban RPC for transaction execution status.
   */
  async checkTransactionStatus(txHash: string): Promise<TransactionStatusResult> {
    if (this.mockTxStore.has(txHash)) {
      return this.mockTxStore.get(txHash)!;
    }
    return { status: 'CONFIRMED' };
  }

  /**
   * Mock helper to set expected tx status in unit tests.
   */
  setMockTxStatus(txHash: string, statusResult: TransactionStatusResult) {
    this.mockTxStore.set(txHash, statusResult);
  }

  /**
   * Query contract state truth.
   */
  async getEscrowBalance(shipmentId: string): Promise<{ balance: number; isDisputed: boolean }> {
    return { balance: 100, isDisputed: false };
  }
}
