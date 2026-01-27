// src/blockchain/providers/soroban.provider.ts
import {
  Server,
  Contract,
  Keypair,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  xdr,
  nativeToScVal,
} from '@stellar/stellar-sdk';


export class SorobanProvider {
  private server = new Server(process.env.STELLAR_RPC!);
  private network = Networks.TESTNET;
  private contract = new Contract(process.env.SOROBAN_CONTRACT!);
  private keypair = Keypair.fromSecret(process.env.STELLAR_SECRET!);

  async recordEvent(payload: {
    shipmentId: string;
    eventType: string;
    hash: string;
    actor: string;
  }) {
    const account = await this.server.getAccount(
      this.keypair.publicKey(),
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.network,
    })
      .addOperation(
        this.contract.call(
          'record_event',
          nativeToScVal(payload.shipmentId),
          nativeToScVal(payload.eventType),
          nativeToScVal(payload.hash),
          nativeToScVal(payload.actor),
        ),
      )
      .setTimeout(30)
      .build();

    tx.sign(this.keypair);

    const response = await this.server.sendTransaction(tx);

    return response.hash;
  }

  async getTransaction(hash: string) {
    return this.server.getTransaction(hash);
  }
}
