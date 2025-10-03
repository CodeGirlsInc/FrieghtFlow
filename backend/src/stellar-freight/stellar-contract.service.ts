import { Injectable, Logger } from '@nestjs/common';
import Server, {
  Keypair,
  Networks,

  TransactionBuilder,
  Operation,
  Asset,
  Account,
  Contract,
  SorobanRpc,
  xdr,
} from '@stellar/stellar-sdk';

@Injectable()
export class StellarContractService {
  private readonly logger = new Logger(StellarContractService.name);
  private readonly server: any
  private readonly sorobanServer: SorobanRpc.Server;
  private readonly networkPassphrase: string;
  private readonly adminKeypair: Keypair;

  constructor() {
    // Use testnet for development, mainnet for production
    const isProduction = process.env.NODE_ENV === 'production';
    
    this.networkPassphrase = isProduction
      ? Networks.PUBLIC
      : Networks.TESTNET;

    this.server = new Server(
      isProduction
        ? 'https://horizon.stellar.org'
        : 'https://horizon-testnet.stellar.org',
    );

    this.sorobanServer = new SorobanRpc.Server(
      isProduction
        ? 'https://soroban-rpc.stellar.org'
        : 'https://soroban-testnet.stellar.org',
    );

    // Load admin keypair from environment
    this.adminKeypair = Keypair.fromSecret(
      process.env.STELLAR_ADMIN_SECRET_KEY || "xwtdbndjjemdmd dnnh",
    );
  }

  async validateAccount(publicKey: string): Promise<boolean> {
    try {
      await this.server.loadAccount(publicKey);
      return true;
    } catch (error) {
      this.logger.error(`Account validation failed: ${error.message}`);
      return false;
    }
  }

  async deployBookingContract(params: {
    shipperAddress: string;
    origin: string;
    destination: string;
    cargoDetails: any;
    rate: number;
    currency: string;
    validUntil: Date;
  }) {
    try {
      // Load the WASM contract (you'll need to upload your contract WASM)
      const contractWasmHash = process.env.STELLAR_CONTRACT_WASM_HASH;

      const sourceAccount = await this.server.loadAccount(
        this.adminKeypair.publicKey(),
      );

      // Create contract instance
      const contract = new Contract(contractWasmHash as string);

      // Initialize contract with booking data
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '10000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          contract.call(
            'initialize',
            xdr.ScVal.scvAddress(
              xdr.ScAddress.scAddressTypeAccount(
                xdr.PublicKey.publicKeyTypeEd25519(
                  Buffer.from(Keypair.fromPublicKey(params.shipperAddress).rawPublicKey())
                )
              )
            ),
            xdr.ScVal.scvString(params.origin),
            xdr.ScVal.scvString(params.destination),
            xdr.ScVal.scvString(JSON.stringify(params.cargoDetails)),
            xdr.ScVal.scvString(params.currency),

          ),
        )
        .setTimeout(180)
        .build();

      transaction.sign(this.adminKeypair);

      const response = await this.sorobanServer.sendTransaction(transaction);
      
      // Wait for confirmation
      let status = await this.sorobanServer.getTransaction(response.hash);
      while ( status.status === 'NOT_FOUND') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        status = await this.sorobanServer.getTransaction(response.hash);
      }

      if (status.status === 'SUCCESS') {
        const contractId = status.returnValue;
        
        return {
          contractId,
          contractAddress: contractId,
          transactionHash: response.hash,
        };
      }

      throw new Error('Contract deployment failed');
    } catch (error) {
      this.logger.error(`Contract deployment failed: ${error.message}`);
      throw error;
    }
  }

  async confirmCapacity(params: {
    contractId: string;
    contractAddress: string;
    carrierAddress: string;
    vesselId: string;
    availableCapacity: number;
    estimatedDeparture: Date;
    estimatedArrival: Date;
  }) {
    try {
      const sourceAccount = await this.server.loadAccount(
        this.adminKeypair.publicKey(),
      );

      const contract = new Contract(params.contractAddress);

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '10000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          contract.call(
            'confirm_capacity',
            xdr.ScVal.scvAddress(
              xdr.ScAddress.scAddressTypeAccount(
                xdr.PublicKey.publicKeyTypeEd25519(
                  Buffer.from(Keypair.fromPublicKey(params.carrierAddress).rawPublicKey())
                )
              )
            ),
            xdr.ScVal.scvString(params.vesselId),
            xdr.ScVal.scvU32(params.availableCapacity),
          ),
        )
        .setTimeout(180)
        .build();

      transaction.sign(this.adminKeypair);

      const response = await this.sorobanServer.sendTransaction(transaction);
      
      let status = await this.sorobanServer.getTransaction(response.hash);
      while (status.status === 'NOT_FOUND') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        status = await this.sorobanServer.getTransaction(response.hash);
      }

      if (status.status === 'SUCCESS') {
        return {
          transactionHash: response.hash,
          success: true,
        };
      }

      throw new Error('Capacity confirmation failed');
    } catch (error) {
      this.logger.error(`Capacity confirmation failed: ${error.message}`);
      throw error;
    }
  }

  async getContractState(contractId: string) {
    try {
      const contract = new Contract(contractId);
      
      const ledgerKey = xdr.LedgerKey.contractData(
        new xdr.LedgerKeyContractData({
          contract: contract.address().toScAddress(),
          key: xdr.ScVal.scvLedgerKeyContractInstance(),
          durability: xdr.ContractDataDurability.persistent(),
        }),
      );

      const response = await this.sorobanServer.getLedgerEntries(ledgerKey);
      
      if (response.entries && response.entries.length > 0) {
        const entry = response.entries[0];
        const data = xdr.LedgerEntryData;
        
        return {
          contractId,
          data: data,
          lastModified: entry.lastModifiedLedgerSeq,
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to get contract state: ${error.message}`);
      throw error;
    }
  }
}