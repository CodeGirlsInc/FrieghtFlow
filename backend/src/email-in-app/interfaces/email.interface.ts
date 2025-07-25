export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: string[]
  category: EmailCategory
  priority: EmailPriority
  isActive: boolean
  version: string
  createdAt: Date
  updatedAt: Date
}

export interface EmailMessage {
  id?: string
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  from?: string
  replyTo?: string
  subject: string
  htmlContent?: string
  textContent?: string
  templateId?: string
  templateData?: Record<string, any>
  attachments?: EmailAttachment[]
  priority: EmailPriority
  category: EmailCategory
  tags?: string[]
  metadata?: Record<string, any>
  scheduledAt?: Date
  expiresAt?: Date
  trackingEnabled?: boolean
  userId?: string
  organizationId?: string
  shipmentId?: string
  orderId?: string
  contractAddress?: string
  transactionHash?: string
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType: string
  disposition?: "attachment" | "inline"
  contentId?: string
  size?: number
}

export interface EmailDeliveryStatus {
  messageId: string
  status: DeliveryStatus
  deliveredAt?: Date
  openedAt?: Date
  clickedAt?: Date
  bouncedAt?: Date
  bounceReason?: string
  unsubscribedAt?: Date
  spamReportedAt?: Date
  errorMessage?: string
  attempts: number
  lastAttemptAt: Date
  nextRetryAt?: Date
}

export interface EmailConfiguration {
  provider: EmailProvider
  apiKey: string
  apiSecret?: string
  domain?: string
  region?: string
  fromEmail: string
  fromName: string
  replyToEmail?: string
  webhookSecret?: string
  trackingDomain?: string
  enableTracking: boolean
  enableRetries: boolean
  maxRetries: number
  retryDelay: number
  batchSize: number
  rateLimitPerSecond: number
  enableSandbox: boolean
  enableTemplateCache: boolean
  templateCacheTtl: number
}

export interface EmailMetrics {
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  totalBounced: number
  totalSpamReports: number
  totalUnsubscribed: number
  deliveryRate: number
  openRate: number
  clickRate: number
  bounceRate: number
  spamRate: number
  unsubscribeRate: number
  averageDeliveryTime: number
}

export interface IEmailService {
  sendEmail(message: EmailMessage): Promise<string>
  sendBulkEmails(messages: EmailMessage[]): Promise<string[]>
  sendTemplateEmail(templateId: string, to: string | string[], data: Record<string, any>): Promise<string>
  scheduleEmail(message: EmailMessage, scheduledAt: Date): Promise<string>
  cancelScheduledEmail(messageId: string): Promise<boolean>
  getDeliveryStatus(messageId: string): Promise<EmailDeliveryStatus>
  getMetrics(startDate?: Date, endDate?: Date): Promise<EmailMetrics>
  validateEmail(email: string): boolean
  unsubscribe(email: string, category?: EmailCategory): Promise<boolean>
  isUnsubscribed(email: string, category?: EmailCategory): Promise<boolean>
}

export enum EmailProvider {
  SENDGRID = "sendgrid",
  MAILGUN = "mailgun",
  SES = "ses",
  POSTMARK = "postmark",
  RESEND = "resend",
  SMTP = "smtp",
}

export enum EmailCategory {
  // User Management
  WELCOME = "welcome",
  EMAIL_VERIFICATION = "email_verification",
  PASSWORD_RESET = "password_reset",
  ACCOUNT_LOCKED = "account_locked",
  PROFILE_UPDATED = "profile_updated",

  // Shipment & Logistics
  SHIPMENT_CREATED = "shipment_created",
  SHIPMENT_PICKED_UP = "shipment_picked_up",
  SHIPMENT_IN_TRANSIT = "shipment_in_transit",
  SHIPMENT_OUT_FOR_DELIVERY = "shipment_out_for_delivery",
  SHIPMENT_DELIVERED = "shipment_delivered",
  SHIPMENT_DELAYED = "shipment_delayed",
  SHIPMENT_EXCEPTION = "shipment_exception",
  SHIPMENT_CANCELLED = "shipment_cancelled",

  // Orders & Quotes
  QUOTE_REQUESTED = "quote_requested",
  QUOTE_RECEIVED = "quote_received",
  QUOTE_ACCEPTED = "quote_accepted",
  QUOTE_EXPIRED = "quote_expired",
  ORDER_CONFIRMED = "order_confirmed",
  ORDER_CANCELLED = "order_cancelled",

  // Billing & Payments
  INVOICE_GENERATED = "invoice_generated",
  PAYMENT_RECEIVED = "payment_received",
  PAYMENT_FAILED = "payment_failed",
  PAYMENT_OVERDUE = "payment_overdue",
  REFUND_PROCESSED = "refund_processed",

  // Web3 & Blockchain
  WALLET_CONNECTED = "wallet_connected",
  SMART_CONTRACT_DEPLOYED = "smart_contract_deployed",
  TRANSACTION_CONFIRMED = "transaction_confirmed",
  TRANSACTION_FAILED = "transaction_failed",
  TOKEN_TRANSFER = "token_transfer",
  NFT_MINTED = "nft_minted",

  // Compliance & Documentation
  DOCUMENT_UPLOADED = "document_uploaded",
  DOCUMENT_VERIFIED = "document_verified",
  DOCUMENT_REJECTED = "document_rejected",
  COMPLIANCE_ALERT = "compliance_alert",
  CUSTOMS_CLEARANCE = "customs_clearance",

  // Notifications & Alerts
  SYSTEM_MAINTENANCE = "system_maintenance",
  SECURITY_ALERT = "security_alert",
  API_LIMIT_REACHED = "api_limit_reached",
  SUBSCRIPTION_EXPIRING = "subscription_expiring",

  // Marketing & Updates
  NEWSLETTER = "newsletter",
  PRODUCT_UPDATE = "product_update",
  PROMOTIONAL = "promotional",

  // Support & Communication
  SUPPORT_TICKET_CREATED = "support_ticket_created",
  SUPPORT_TICKET_UPDATED = "support_ticket_updated",
  SUPPORT_TICKET_RESOLVED = "support_ticket_resolved",
}

export enum EmailPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

export enum DeliveryStatus {
  PENDING = "pending",
  QUEUED = "queued",
  SENT = "sent",
  DELIVERED = "delivered",
  OPENED = "opened",
  CLICKED = "clicked",
  BOUNCED = "bounced",
  SPAM_REPORTED = "spam_reported",
  UNSUBSCRIBED = "unsubscribed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export interface EmailWebhookPayload {
  messageId: string
  event: string
  timestamp: number
  email: string
  category?: string
  reason?: string
  url?: string
  userAgent?: string
  ip?: string
  metadata?: Record<string, any>
}

export interface BulkEmailJob {
  id: string
  name: string
  templateId: string
  recipients: Array<{
    email: string
    data: Record<string, any>
  }>
  status: "pending" | "processing" | "completed" | "failed"
  totalRecipients: number
  processedRecipients: number
  failedRecipients: number
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  errorMessage?: string
}
