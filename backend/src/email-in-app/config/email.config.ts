import { registerAs } from "@nestjs/config"
import { EmailProvider, type EmailConfiguration } from "../interfaces/email.interface"

export default registerAs(
  "email",
  (): EmailConfiguration => ({
    provider: (process.env.EMAIL_PROVIDER as EmailProvider) || EmailProvider.SENDGRID,
    apiKey: process.env.EMAIL_API_KEY || "",
    apiSecret: process.env.EMAIL_API_SECRET,
    domain: process.env.EMAIL_DOMAIN,
    region: process.env.EMAIL_REGION || "us-east-1",
    fromEmail: process.env.EMAIL_FROM || "noreply@freightflow.com",
    fromName: process.env.EMAIL_FROM_NAME || "FreightFlow",
    replyToEmail: process.env.EMAIL_REPLY_TO || "support@freightflow.com",
    webhookSecret: process.env.EMAIL_WEBHOOK_SECRET,
    trackingDomain: process.env.EMAIL_TRACKING_DOMAIN,
    enableTracking: process.env.EMAIL_ENABLE_TRACKING !== "false",
    enableRetries: process.env.EMAIL_ENABLE_RETRIES !== "false",
    maxRetries: Number.parseInt(process.env.EMAIL_MAX_RETRIES || "3"),
    retryDelay: Number.parseInt(process.env.EMAIL_RETRY_DELAY || "300000"), // 5 minutes
    batchSize: Number.parseInt(process.env.EMAIL_BATCH_SIZE || "100"),
    rateLimitPerSecond: Number.parseInt(process.env.EMAIL_RATE_LIMIT || "10"),
    enableSandbox: process.env.NODE_ENV !== "production",
    enableTemplateCache: process.env.EMAIL_ENABLE_TEMPLATE_CACHE !== "false",
    templateCacheTtl: Number.parseInt(process.env.EMAIL_TEMPLATE_CACHE_TTL || "3600"), // 1 hour
  }),
)
