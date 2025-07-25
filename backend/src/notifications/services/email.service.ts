import { Injectable } from '@nestjs/common';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class EmailService {
  private emailQueue: Array<{
    email: EmailOptions;
    timestamp: Date;
    id: string;
  }> = [];

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      // Simulate email sending with in-memory queue
      const emailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      this.emailQueue.push({
        id: emailId,
        email: options,
        timestamp: new Date(),
      });

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log(`📧 Email sent to ${options.to}:`);
      console.log(`   Subject: ${options.subject}`);
      console.log(`   Message: ${options.text}`);
      console.log(`   Message ID: ${emailId}`);
      console.log(`   Timestamp: ${new Date().toISOString()}`);

      return {
        success: true,
        messageId: emailId,
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendBulkEmails(emails: EmailOptions[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];

    for (const email of emails) {
      const result = await this.sendEmail(email);
      results.push(result);
    }

    return results;
  }

  getEmailQueue(): Array<{ email: EmailOptions; timestamp: Date; id: string }> {
    return [...this.emailQueue];
  }

  clearEmailQueue(): void {
    this.emailQueue = [];
  }

  getQueueSize(): number {
    return this.emailQueue.length;
  }

  async sendTemplateEmail(
    to: string,
    templateName: string,
    templateData: Record<string, any>,
    options?: Partial<EmailOptions>,
  ): Promise<EmailResult> {
    // In a real implementation, this would use a template engine
    const processedTemplate = this.processEmailTemplate(
      templateName,
      templateData,
    );

    return this.sendEmail({
      to,
      subject: processedTemplate.subject,
      text: processedTemplate.text,
      html: processedTemplate.html,
      ...options,
    });
  }

  private processEmailTemplate(
    templateName: string,
    data: Record<string, any>,
  ): { subject: string; text: string; html?: string } {
    // Mock template processing - in real app, use a proper template engine
    const templates = {
      shipment_created: {
        subject: 'Your shipment {{trackingNumber}} has been created',
        text: `Hello {{recipientName}},

Your shipment has been created and is being prepared for delivery.

Tracking Number: {{trackingNumber}}
From: {{origin}}
To: {{destination}}
Estimated Delivery: {{estimatedDelivery}}

Items:
{{#each items}}
- {{name}} (Quantity: {{quantity}}, Value: ${{ value }})
{{/each}}

You can track your shipment at: {{actionUrl}}

Thank you for your business!`,
        html: `<h2>Shipment Created</h2>
<p>Hello {{recipientName}},</p>
<p>Your shipment has been created and is being prepared for delivery.</p>
<ul>
<li><strong>Tracking Number:</strong> {{trackingNumber}}</li>
<li><strong>From:</strong> {{origin}}</li>
<li><strong>To:</strong> {{destination}}</li>
<li><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</li>
</ul>
<h3>Items:</h3>
<ul>
{{#each items}}
<li>{{name}} (Quantity: {{quantity}}, Value: ${{ value }})</li>
{{/each}}
</ul>
<p><a href="{{actionUrl}}">Track your shipment</a></p>`,
      },
      shipment_delivered: {
        subject: 'Your shipment {{trackingNumber}} has been delivered',
        text: `Hello {{recipientName}},

Great news! Your shipment has been successfully delivered.

Tracking Number: {{trackingNumber}}
Delivered At: {{deliveredAt}}
Delivery Location: {{deliveryLocation}}
{{#if signedBy}}Signed By: {{signedBy}}{{/if}}

{{#if deliveryNotes}}Delivery Notes: {{deliveryNotes}}{{/if}}

Thank you for choosing our service!`,
        html: `<h2>Shipment Delivered</h2>
<p>Hello {{recipientName}},</p>
<p>Great news! Your shipment has been successfully delivered.</p>
<ul>
<li><strong>Tracking Number:</strong> {{trackingNumber}}</li>
<li><strong>Delivered At:</strong> {{deliveredAt}}</li>
<li><strong>Delivery Location:</strong> {{deliveryLocation}}</li>
{{#if signedBy}}<li><strong>Signed By:</strong> {{signedBy}}</li>{{/if}}
</ul>
{{#if deliveryNotes}}<p><strong>Delivery Notes:</strong> {{deliveryNotes}}</p>{{/if}}`,
      },
    };

    const template = templates[templateName] || {
      subject: 'Notification',
      text: 'You have a new notification.',
    };

    // Simple template variable replacement
    let subject = template.subject;
    let text = template.text;
    let html = template.html;

    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, String(value));
      text = text.replace(regex, String(value));
      if (html) {
        html = html.replace(regex, String(value));
      }
    }

    return { subject, text, html };
  }
}
