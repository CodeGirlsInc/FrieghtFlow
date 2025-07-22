import { Injectable, Logger } from "@nestjs/common"
import type { HealthChecker, HealthCheckResult } from "../interfaces/health-checker.interface"
import { HealthStatus } from "../entities/health-check.entity"

// Mock email service interface - replace with your actual email service
interface EmailService {
  sendMail(options: any): Promise<any>
  verify(): Promise<boolean>
  isConnected(): boolean
}

@Injectable()
export class EmailHealthChecker implements HealthChecker {
  private readonly logger = new Logger(EmailHealthChecker.name)

  constructor(
    // Inject your email service here
    // @Inject('EMAIL_SERVICE') private readonly emailService: EmailService,
  ) {}

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      // Mock email service for demonstration
      // Replace this with your actual email service injection
      const emailService = this.getMockEmailService()

      if (!emailService.isConnected()) {
        return {
          status: HealthStatus.UNHEALTHY,
          responseTime: Date.now() - startTime,
          errorMessage: "Email service not connected",
        }
      }

      // Test SMTP connection
      const verifyStartTime = Date.now()
      const isVerified = await emailService.verify()
      const verifyTime = Date.now() - verifyStartTime

      if (!isVerified) {
        return {
          status: HealthStatus.UNHEALTHY,
          responseTime: Date.now() - startTime,
          errorMessage: "SMTP verification failed",
          details: {
            verifyTime,
          },
        }
      }

      // Test sending a test email (optional - be careful in production)
      let sendTestResult = null
      if (process.env.EMAIL_HEALTH_CHECK_RECIPIENT) {
        try {
          const sendStartTime = Date.now()
          sendTestResult = await emailService.sendMail({
            to: process.env.EMAIL_HEALTH_CHECK_RECIPIENT,
            subject: "Health Check Test",
            text: `Health check test email sent at ${new Date().toISOString()}`,
          })
          sendTestResult.sendTime = Date.now() - sendStartTime
        } catch (sendError) {
          this.logger.warn("Test email send failed", sendError.message)
          sendTestResult = { error: sendError.message }
        }
      }

      const totalResponseTime = Date.now() - startTime

      const details = {
        verified: isVerified,
        verifyTime,
        smtpHost: process.env.SMTP_HOST || "configured",
        smtpPort: process.env.SMTP_PORT || "configured",
        testEmailSent: !!sendTestResult,
        sendTestResult,
      }

      // Determine status based on response time and verification
      let status = HealthStatus.HEALTHY
      if (totalResponseTime > 3000) {
        status = HealthStatus.DEGRADED
      }
      if (totalResponseTime > 10000 || !isVerified) {
        status = HealthStatus.UNHEALTHY
      }

      return {
        status,
        responseTime: totalResponseTime,
        details,
      }
    } catch (error) {
      this.logger.error("Email health check failed", error.stack)
      return {
        status: HealthStatus.UNHEALTHY,
        responseTime: Date.now() - startTime,
        errorMessage: error.message,
        details: {
          error: error.name,
          smtpHost: process.env.SMTP_HOST || "not configured",
        },
      }
    }
  }

  getServiceName(): string {
    return "email"
  }

  private getMockEmailService(): EmailService {
    // Mock implementation - replace with actual email service
    return {
      isConnected: () => true,
      verify: async () => true,
      sendMail: async (options) => ({
        messageId: `mock-${Date.now()}@example.com`,
        accepted: [options.to],
        rejected: [],
      }),
    }
  }
}
