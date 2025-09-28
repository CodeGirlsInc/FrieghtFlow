import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Keypair, TransactionBuilder, Operation, Asset } from 'stellar-sdk';

@Injectable()
export class StellarService {
  private readonly server: Server;
  private readonly sourceKeypair: Keypair;
  private readonly logger = new Logger(StellarService.name);

  constructor(private configService: ConfigService) {
    const stellarNetwork = this.configService.get<string>('STELLAR_NETWORK', 'testnet');
    
    if (stellarNetwork === 'testnet') {
      this.server = new Server('https://horizon-testnet.stellar.org');
    } else {
      this.server = new Server('https://horizon.stellar.org');
    }

    const serverSecretKey = this.configService.get<string>('STELLAR_SERVER_SECRET_KEY');
    if (!serverSecretKey) {
      throw new InternalServerErrorException('Stellar server secret key is not configured.');
    }
    this.sourceKeypair = Keypair.fromSecret(serverSecretKey);
  }

  async sendRewardTokens(destinationAddress: string, amount: string): Promise<string> {
    try {
      const sourceAccount = await this.server.loadAccount(this.sourceKeypair.publicKey());

      // Replace with your custom token if you have one, or use native XLM.
      // const rewardAsset = new Asset('REWARD_TOKEN', 'ISSUER_PUBLIC_KEY');
      const rewardAsset = Asset.native(); // Using native Lumen (XLM) for this example

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: await this.server.fetchBaseFee(),
        networkPassphrase: this.getNetworkPassphrase(),
      })
        .addOperation(
          Operation.payment({
            destination: destinationAddress,
            asset: rewardAsset,
            amount,
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(this.sourceKeypair);

      const result = await this.server.submitTransaction(transaction);
      this.logger.log(`Stellar transaction successful! Hash: ${result.hash}`);
      return result.hash;
    } catch (error) {
      this.logger.error('Stellar transaction failed:', error.response?.data?.extras?.result_codes || error);
      throw new InternalServerErrorException('Failed to process Stellar transaction.');
    }
  }

  private getNetworkPassphrase(): string {
    return this.configService.get<string>('STELLAR_NETWORK', 'testnet') === 'testnet'
      ? 'Test SDF Network ; September 2015'
      : 'Public Global Stellar Network ; September 2015';
  }
}