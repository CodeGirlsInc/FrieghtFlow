import { Injectable, Logger } from "@nestjs/common"
import type { EmailService } from "./email.service"
import { EmailCategory, EmailPriority } from "../interfaces/email.interface"
import type { LoggerService } from "../../logger/services/logger.service"

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    private emailService: EmailService,
    private loggerService: LoggerService,
  ) {}

  // User Management Notifications
  async sendWelcomeEmail(userEmail: string, userData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("welcome", userEmail, {
      ...userData,
      messageOverrides: {
        category: EmailCategory.WELCOME,
        priority: EmailPriority.HIGH,
      },
    })
  }

  async sendEmailVerification(userEmail: string, verificationData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("email-verification", userEmail, {
      ...verificationData,
      messageOverrides: {
        category: EmailCategory.EMAIL_VERIFICATION,
        priority: EmailPriority.HIGH,
      },
    })
  }

  async sendPasswordReset(userEmail: string, resetData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("password-reset", userEmail, {
      ...resetData,
      messageOverrides: {
        category: EmailCategory.PASSWORD_RESET,
        priority: EmailPriority.HIGH,
      },
    })
  }

  // Shipment Notifications
  async sendShipmentCreated(recipientEmail: string, shipmentData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("shipment-created", recipientEmail, {
      ...shipmentData,
      messageOverrides: {
        category: EmailCategory.SHIPMENT_CREATED,
        priority: EmailPriority.NORMAL,
        shipmentId: shipmentData.shipmentId,
      },
    })
  }

  async sendShipmentPickedUp(recipientEmail: string, shipmentData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("shipment-picked-up", recipientEmail, {
      ...shipmentData,
      messageOverrides: {
        category: EmailCategory.SHIPMENT_PICKED_UP,
        priority: EmailPriority.NORMAL,
        shipmentId: shipmentData.shipmentId,
      },
    })
  }

  async sendShipmentInTransit(recipientEmail: string, shipmentData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("shipment-in-transit", recipientEmail, {
      ...shipmentData,
      messageOverrides: {
        category: EmailCategory.SHIPMENT_IN_TRANSIT,
        priority: EmailPriority.NORMAL,
        shipmentId: shipmentData.shipmentId,
      },
    })
  }

  async sendShipmentDelivered(recipientEmail: string, shipmentData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("shipment-delivered", recipientEmail, {
      ...shipmentData,
      messageOverrides: {
        category: EmailCategory.SHIPMENT_DELIVERED,
        priority: EmailPriority.HIGH,
        shipmentId: shipmentData.shipmentId,
      },
    })
  }

  async sendShipmentDelayed(recipientEmail: string, shipmentData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("shipment-delayed", recipientEmail, {
      ...shipmentData,
      messageOverrides: {
        category: EmailCategory.SHIPMENT_DELAYED,
        priority: EmailPriority.HIGH,
        shipmentId: shipmentData.shipmentId,
      },
    })
  }

  async sendShipmentException(recipientEmail: string, shipmentData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("shipment-exception", recipientEmail, {
      ...shipmentData,
      messageOverrides: {
        category: EmailCategory.SHIPMENT_EXCEPTION,
        priority: EmailPriority.URGENT,
        shipmentId: shipmentData.shipmentId,
      },
    })
  }

  // Order & Quote Notifications
  async sendQuoteRequested(recipientEmail: string, quoteData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("quote-requested", recipientEmail, {
      ...quoteData,
      messageOverrides: {
        category: EmailCategory.QUOTE_REQUESTED,
        priority: EmailPriority.NORMAL,
      },
    })
  }

  async sendQuoteReceived(recipientEmail: string, quoteData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("quote-received", recipientEmail, {
      ...quoteData,
      messageOverrides: {
        category: EmailCategory.QUOTE_RECEIVED,
        priority: EmailPriority.HIGH,
      },
    })
  }

  async sendOrderConfirmed(recipientEmail: string, orderData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("order-confirmed", recipientEmail, {
      ...orderData,
      messageOverrides: {
        category: EmailCategory.ORDER_CONFIRMED,
        priority: EmailPriority.HIGH,
        orderId: orderData.orderId,
      },
    })
  }

  // Billing & Payment Notifications
  async sendInvoiceGenerated(recipientEmail: string, invoiceData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("invoice-generated", recipientEmail, {
      ...invoiceData,
      messageOverrides: {
        category: EmailCategory.INVOICE_GENERATED,
        priority: EmailPriority.NORMAL,
      },
    })
  }

  async sendPaymentReceived(recipientEmail: string, paymentData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("payment-received", recipientEmail, {
      ...paymentData,
      messageOverrides: {
        category: EmailCategory.PAYMENT_RECEIVED,
        priority: EmailPriority.NORMAL,
      },
    })
  }

  async sendPaymentFailed(recipientEmail: string, paymentData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("payment-failed", recipientEmail, {
      ...paymentData,
      messageOverrides: {
        category: EmailCategory.PAYMENT_FAILED,
        priority: EmailPriority.HIGH,
      },
    })
  }

  async sendPaymentOverdue(recipientEmail: string, paymentData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("payment-overdue", recipientEmail, {
      ...paymentData,
      messageOverrides: {
        category: EmailCategory.PAYMENT_OVERDUE,
        priority: EmailPriority.URGENT,
      },
    })
  }

  // Web3 & Blockchain Notifications
  async sendWalletConnected(recipientEmail: string, walletData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("wallet-connected", recipientEmail, {
      ...walletData,
      messageOverrides: {
        category: EmailCategory.WALLET_CONNECTED,
        priority: EmailPriority.NORMAL,
      },
    })
  }

  async sendSmartContractDeployed(recipientEmail: string, contractData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("smart-contract-deployed", recipientEmail, {
      ...contractData,
      messageOverrides: {
        category: EmailCategory.SMART_CONTRACT_DEPLOYED,
        priority: EmailPriority.HIGH,
        contractAddress: contractData.contractAddress,
      },
    })
  }

  async sendTransactionConfirmed(recipientEmail: string, transactionData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("transaction-confirmed", recipientEmail, {
      ...transactionData,
      messageOverrides: {
        category: EmailCategory.TRANSACTION_CONFIRMED,
        priority: EmailPriority.NORMAL,
        transactionHash: transactionData.transactionHash,
      },
    })
  }

  async sendTransactionFailed(recipientEmail: string, transactionData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("transaction-failed", recipientEmail, {
      ...transactionData,
      messageOverrides: {
        category: EmailCategory.TRANSACTION_FAILED,
        priority: EmailPriority.HIGH,
        transactionHash: transactionData.transactionHash,
      },
    })
  }

  async sendTokenTransfer(recipientEmail: string, transferData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("token-transfer", recipientEmail, {
      ...transferData,
      messageOverrides: {
        category: EmailCategory.TOKEN_TRANSFER,
        priority: EmailPriority.NORMAL,
        transactionHash: transferData.transactionHash,
      },
    })
  }

  async sendNFTMinted(recipientEmail: string, nftData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("nft-minted", recipientEmail, {
      ...nftData,
      messageOverrides: {
        category: EmailCategory.NFT_MINTED,
        priority: EmailPriority.HIGH,
        contractAddress: nftData.contractAddress,
        transactionHash: nftData.transactionHash,
      },
    })
  }

  // Compliance & Documentation Notifications
  async sendDocumentUploaded(recipientEmail: string, documentData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("document-uploaded", recipientEmail, {
      ...documentData,
      messageOverrides: {
        category: EmailCategory.DOCUMENT_UPLOADED,
        priority: EmailPriority.NORMAL,
      },
    })
  }

  async sendDocumentVerified(recipientEmail: string, documentData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("document-verified", recipientEmail, {
      ...documentData,
      messageOverrides: {
        category: EmailCategory.DOCUMENT_VERIFIED,
        priority: EmailPriority.HIGH,
      },
    })
  }

  async sendDocumentRejected(recipientEmail: string, documentData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("document-rejected", recipientEmail, {
      ...documentData,
      messageOverrides: {
        category: EmailCategory.DOCUMENT_REJECTED,
        priority: EmailPriority.HIGH,
      },
    })
  }

  async sendComplianceAlert(recipientEmail: string, alertData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("compliance-alert", recipientEmail, {
      ...alertData,
      messageOverrides: {
        category: EmailCategory.COMPLIANCE_ALERT,
        priority: EmailPriority.URGENT,
      },
    })
  }

  async sendCustomsClearance(recipientEmail: string, customsData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("customs-clearance", recipientEmail, {
      ...customsData,
      messageOverrides: {
        category: EmailCategory.CUSTOMS_CLEARANCE,
        priority: EmailPriority.HIGH,
        shipmentId: customsData.shipmentId,
      },
    })
  }

  // System & Security Notifications
  async sendSystemMaintenance(recipientEmails: string[], maintenanceData: any): Promise<string[]> {
    const messages = recipientEmails.map((email) => ({
      to: email,
      templateId: "system-maintenance",
      templateData: maintenanceData,
      category: EmailCategory.SYSTEM_MAINTENANCE,
      priority: EmailPriority.HIGH,
    }))

    return this.emailService.sendBulkEmails(messages)
  }

  async sendSecurityAlert(recipientEmail: string, alertData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("security-alert", recipientEmail, {
      ...alertData,
      messageOverrides: {
        category: EmailCategory.SECURITY_ALERT,
        priority: EmailPriority.URGENT,
      },
    })
  }

  async sendAPILimitReached(recipientEmail: string, limitData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("api-limit-reached", recipientEmail, {
      ...limitData,
      messageOverrides: {
        category: EmailCategory.API_LIMIT_REACHED,
        priority: EmailPriority.HIGH,
      },
    })
  }

  async sendSubscriptionExpiring(recipientEmail: string, subscriptionData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("subscription-expiring", recipientEmail, {
      ...subscriptionData,
      messageOverrides: {
        category: EmailCategory.SUBSCRIPTION_EXPIRING,
        priority: EmailPriority.HIGH,
      },
    })
  }

  // Support Notifications
  async sendSupportTicketCreated(recipientEmail: string, ticketData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("support-ticket-created", recipientEmail, {
      ...ticketData,
      messageOverrides: {
        category: EmailCategory.SUPPORT_TICKET_CREATED,
        priority: EmailPriority.NORMAL,
      },
    })
  }

  async sendSupportTicketUpdated(recipientEmail: string, ticketData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("support-ticket-updated", recipientEmail, {
      ...ticketData,
      messageOverrides: {
        category: EmailCategory.SUPPORT_TICKET_UPDATED,
        priority: EmailPriority.NORMAL,
      },
    })
  }

  async sendSupportTicketResolved(recipientEmail: string, ticketData: any): Promise<string> {
    return this.emailService.sendTemplateEmail("support-ticket-resolved", recipientEmail, {
      ...ticketData,
      messageOverrides: {
        category: EmailCategory.SUPPORT_TICKET_RESOLVED,
        priority: EmailPriority.HIGH,
      },
    })
  }

  // Bulk notification methods
  async sendBulkShipmentUpdates(updates: Array<{ email: string; shipmentData: any; status: string }>): Promise<void> {
    const batches = this.groupByStatus(updates)

    for (const [status, batch] of Object.entries(batches)) {
      const templateId = this.getShipmentTemplateId(status)
      const messages = batch.map((update) => ({
        to: update.email,
        templateId,
        templateData: update.shipmentData,
        category: this.getShipmentCategory(status),
        priority: EmailPriority.NORMAL,
        shipmentId: update.shipmentData.shipmentId,
      }))

      try {
        await this.emailService.sendBulkEmails(messages)
        this.loggerService.info(`Sent bulk shipment ${status} notifications`, {
          module: "NotificationService",
          count: messages.length,
          status,
        })
      } catch (error) {
        this.loggerService.error(`Failed to send bulk shipment ${status} notifications`, error, {
          module: "NotificationService",
          count: messages.length,
          status,
        })
      }
    }
  }

  private groupByStatus(
    updates: Array<{ email: string; shipmentData: any; status: string }>,
  ): Record<string, Array<{ email: string; shipmentData: any }>> {
    return updates.reduce(
      (groups, update) => {
        if (!groups[update.status]) {
          groups[update.status] = []
        }
        groups[update.status].push({
          email: update.email,
          shipmentData: update.shipmentData,
        })
        return groups
      },
      {} as Record<string, Array<{ email: string; shipmentData: any }>>,
    )
  }

  private getShipmentTemplateId(status: string): string {
    const templateMap: Record<string, string> = {
      picked_up: "shipment-picked-up",
      in_transit: "shipment-in-transit",
      out_for_delivery: "shipment-out-for-delivery",
      delivered: "shipment-delivered",
      delayed: "shipment-delayed",
      exception: "shipment-exception",
    }
    return templateMap[status] || "shipment-updated"
  }

  private getShipmentCategory(status: string): EmailCategory {
    const categoryMap: Record<string, EmailCategory> = {
      picked_up: EmailCategory.SHIPMENT_PICKED_UP,
      in_transit: EmailCategory.SHIPMENT_IN_TRANSIT,
      out_for_delivery: EmailCategory.SHIPMENT_OUT_FOR_DELIVERY,
      delivered: EmailCategory.SHIPMENT_DELIVERED,
      delayed: EmailCategory.SHIPMENT_DELAYED,
      exception: EmailCategory.SHIPMENT_EXCEPTION,
    }
    return categoryMap[status] || EmailCategory.SHIPMENT_IN_TRANSIT
  }
}
