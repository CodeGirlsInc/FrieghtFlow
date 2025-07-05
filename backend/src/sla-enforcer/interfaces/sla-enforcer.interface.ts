export interface SLAMonitoringResult {
  shipmentId: string
  trackingNumber: string
  ruleId: string
  ruleName: string
  isViolated: boolean
  delayMinutes?: number
  expectedTime: Date
  actualTime?: Date
  status: string
}

export interface SLAViolationSummary {
  totalViolations: number
  activeViolations: number
  resolvedViolations: number
  averageDelayMinutes: number
  violationsByPriority: Record<string, number>
  violationsByType: Record<string, number>
}

export interface ActionExecutionResult {
  actionType: string
  success: boolean
  message: string
  timestamp: Date
  details?: any
}

export interface SLAEnforcementConfig {
  monitoringIntervalMinutes: number
  maxRetryAttempts: number
  enableSmartContractIntegration: boolean
  defaultGracePeriodMinutes: number
  alertingEnabled: boolean
}
