import { Injectable } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { NotificationChannel } from "../entities/notification.entity"
import type { Notification } from "../entities/notification.entity"
import type { NotificationService } from "./notification.service"
import type { EmailService } from "./email.service"
import type { InAppNotificationService } from "./in-app-notification.service"
import type { NotificationPreferenceService } from "./notification-preference.service"

@Injectable()
export class NotificationProcessorService {
  constructor(
    private notificationService: NotificationService,
    private emailService: EmailService,
    private inAppNotificationService: InAppNotificationService,
    private preferenceService: NotificationPreferenceService,
  ) {}

  @OnEvent("notification.created")
  async handleNotificationCreated(notification: Notification): Promise<void> {
    try {
      // Check if user has enabled this notification type for this channel
      const isEnabled = await this.preferenceService.isNotificationEnabled(
        notification.recipientId,
        notification.type,
        notification.channel,
      )

      if (!isEnabled) {
        console.log(`Notification ${notification.id} skipped - user preference disabled`)
        return
      }

      // Process based on channel
      switch (notification.channel) {
        case NotificationChannel.EMAIL:
          await this.processEmailNotification(notification)
          break
        case NotificationChannel.IN_APP:
          await this.processInAppNotification(notification)
          break
        case NotificationChannel.SMS:
          await this.processSMSNotification(notification)
          break
        case NotificationChannel.PUSH:
          await this.processPushNotification(notification)
          break
        default:
          console.warn(`Unsupported notification channel: ${notification.channel}`)
      }
    } catch (error) {
      console.error(`Failed to process notification ${notification.id}:`, error)
      await this.notificationService.markAsFailed(notification.id, error.message)
    }
  }

  private async processEmailNotification(notification: Notification): Promise<void> {
    try {
      const result = await this.emailService.sendEmail({
        to: notification.recipientEmail,
        subject: notification.title,
        text: notification.message,
        html: this.generateEmailHTML(notification),
      })

      if (result.success) {
        await this.notificationService.markAsDelivered(notification.id)
      } else {
        await this.notificationService.markAsFailed(notification.id, result.error || "Email sending failed")
      }
    } catch (error) {
      await this.notificationService.markAsFailed(notification.id, error.message)
    }
  }

  private async processInAppNotification(notification: Notification): Promise<void> {
    try {
      await this.inAppNotificationService.sendInAppNotification(notification)
      await this.notificationService.markAsDelivered(notification.id)
    } catch (error) {
      await this.notificationService.markAsFailed(notification.id, error.message)
    }
  }

  private async processSMSNotification(notification: Notification): Promise<void> {
    // Mock SMS processing
    console.log(`📱 SMS notification sent to ${notification.recipientId}:`)
    console.log(`   Message: ${notification.message}`)
    console.log(`   Timestamp: ${new Date().toISOString()}`)

    await this.notificationService.markAsDelivered(notification.id)
  }

  private async processPushNotification(notification: Notification): Promise<void> {
    // Mock push notification processing
    console.log(`📲 Push notification sent to ${notification.recipientId}:`)
    console.log(`   Title: ${notification.title}`)
    console.log(`   Message: ${notification.message}`)
    console.log(`   Timestamp: ${new Date().toISOString()}`)

    await this.notificationService.markAsDelivered(notification.id)
  }

  private generateEmailHTML(notification: Notification): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${notification.title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .content { padding: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 12px; color: #666; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        .metadata { background-color: #f8f9fa; padding: 10px; border-radius: 3px; margin: 10px 0; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>${notification.title}</h2>
        </div>
        
        <div class="content">
            <p>Hello ${notification.recipientName || "there"},</p>
            <p>${notification.message}</p>
            
            ${notification.actionUrl ? `<p><a href="${notification.actionUrl}" class="button">${notification.actionText || "View Details"}</a></p>` : ""}
            
            ${notification.data ? `<div class="metadata"><strong>Additional Information:</strong><br>${JSON.stringify(notification.data, null, 2)}</div>` : ""}
        </div>
        
        <div class="footer">
            <p>This notification was sent at ${notification.createdAt.toISOString()}</p>
            <p>Notification ID: ${notification.id}</p>
        </div>
    </div>
</body>
</html>
    `
  }
}
