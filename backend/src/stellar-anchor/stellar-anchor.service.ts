// #1007 – Stellar Anchor: SEP-6/SEP-24 deposit & withdrawal flow stubs
import { Injectable, Logger } from '@nestjs/common';

export interface AnchorDepositResult {
  txId: string;
  status: string;
}
export interface AnchorWithdrawResult {
  txId: string;
  status: string;
}

@Injectable()
export class StellarAnchorService {
  private readonly logger = new Logger(StellarAnchorService.name);

  async initiateDeposit(
    userId: string,
    assetCode: string,
    amount: number,
  ): Promise<AnchorDepositResult> {
    this.logger.log(
      `SEP-24 deposit: user=${userId} asset=${assetCode} amount=${amount}`,
    );
    return { txId: `anchor-deposit-${Date.now()}`, status: 'pending_external' };
  }

  async initiateWithdrawal(
    userId: string,
    assetCode: string,
    amount: number,
    destinationAddress: string,
  ): Promise<AnchorWithdrawResult> {
    this.logger.log(
      `SEP-6 withdrawal: user=${userId} dest=${destinationAddress}`,
    );
    void assetCode;
    void amount;
    return { txId: `anchor-withdraw-${Date.now()}`, status: 'pending_anchor' };
  }

  async getTransactionStatus(
    txId: string,
  ): Promise<{ txId: string; status: string }> {
    return { txId, status: 'completed' };
  }
}
