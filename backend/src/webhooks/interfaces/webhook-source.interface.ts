export interface WebhookSourceConfig {
  name: string
  secretKey?: string
  signatureHeader?: string
  eventTypeHeader?: string
  eventIdHeader?: string
  allowedEventTypes?: string[]
  validateSignature?: boolean
}

export interface WebhookValidationResult {
  isValid: boolean
  eventType?: string
  eventId?: string
  error?: string
}

export interface WebhookSourceValidator {
  validateSignature(payload: string, signature: string, secret: string): boolean
  extractEventInfo(
    headers: Record<string, string>,
    payload: any,
  ): {
    eventType?: string
    eventId?: string
  }
  validateEventType(eventType: string): boolean
}
