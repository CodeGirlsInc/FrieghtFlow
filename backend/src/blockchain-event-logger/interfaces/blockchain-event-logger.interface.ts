export interface StarkNetEventData {
  transactionHash: string
  contractAddress: string
  eventName: string
  blockNumber: bigint
  blockTimestamp: Date
  logIndex: number
  data: any[]
  keys: string[]
}

export interface EventProcessingResult {
  eventId: string
  success: boolean
  error?: string
  processingTime: number
  retryCount: number
}

export interface EventSubscriptionConfig {
  contractAddress: string
  eventTypes: string[]
  fromBlock?: bigint
  maxRetries: number
  retryDelayMs: number
  batchSize: number
}

export interface BlockchainEventLoggerConfig {
  starknetRpcUrl: string
  maxConcurrentSubscriptions: number
  defaultBatchSize: number
  maxRetryAttempts: number
  retryDelayMs: number
  checkpointInterval: number
  enableMetrics: boolean
}

export interface EventProcessingStats {
  totalProcessed: number
  totalFailed: number
  averageProcessingTime: number
  lastProcessedBlock: bigint
  errorRate: number
}

export interface MissedEventRecovery {
  contractAddress: string
  fromBlock: bigint
  toBlock: bigint
  recoveredEvents: number
  failedRecoveries: number
}
