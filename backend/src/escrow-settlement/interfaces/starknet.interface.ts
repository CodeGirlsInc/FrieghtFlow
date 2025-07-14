export interface StarkNetConfig {
  rpcUrl: string
  chainId: string
  privateKey: string
  accountAddress: string
}

export interface ContractCallResult {
  transaction_hash: string
  block_number?: number
  block_hash?: string
  execution_status?: string
  finality_status?: string
  gas_consumed?: string
  gas_price?: string
}

export interface TransactionReceipt {
  transaction_hash: string
  block_number: number
  block_hash: string
  execution_status: "SUCCEEDED" | "REVERTED"
  finality_status: "ACCEPTED_ON_L2" | "ACCEPTED_ON_L1"
  gas_consumed: string
  gas_price: string
  events: any[]
}

export interface BalanceResult {
  balance: string
  decimals: number
  symbol: string
}

export interface IStarkNetService {
  lockFunds(
    contractAddress: string,
    transactionId: string,
    amount: string,
    senderAddress: string,
    recipientAddress: string,
  ): Promise<ContractCallResult>

  releaseFunds(contractAddress: string, transactionId: string, recipientAddress: string): Promise<ContractCallResult>

  refundFunds(contractAddress: string, transactionId: string, senderAddress: string): Promise<ContractCallResult>

  getTransactionReceipt(txHash: string): Promise<TransactionReceipt>

  getBalance(address: string, tokenAddress?: string): Promise<BalanceResult>

  isTransactionConfirmed(txHash: string): Promise<boolean>
}
