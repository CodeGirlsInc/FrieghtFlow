import { EmailCategory, EmailPriority } from "../interfaces/email.interface"

export const DEFAULT_EMAIL_TEMPLATES = [
  // User Management Templates
  {
    name: "welcome",
    subject: "Welcome to FreightFlow, {{name}}!",
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to FreightFlow</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to FreightFlow!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hello {{name}},</h2>
          
          <p>Welcome to FreightFlow, the future of logistics and supply chain management! We're excited to have you join our platform.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #667eea;">What you can do with FreightFlow:</h3>
            <ul style="padding-left: 20px;">
              <li>Track shipments in real-time with blockchain transparency</li>
              <li>Manage your supply chain with AI-powered insights</li>
              <li>Generate smart contracts for automated payments</li>
              <li>Access comprehensive analytics and reporting</li>
              <li>Connect with verified carriers and suppliers</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Get Started</a>
          </div>
          
          <p>If you have any questions, our support team is here to help at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
          
          <p>Best regards,<br>The FreightFlow Team</p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>© {{currentYear}} FreightFlow. All rights reserved.</p>
          <p><a href="{{unsubscribeUrl}}" style="color: #666;">Unsubscribe</a> | <a href="{{websiteUrl}}" style="color: #666;">Visit Website</a></p>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Welcome to FreightFlow, {{name}}!
      
      Hello {{name}},
      
      Welcome to FreightFlow, the future of logistics and supply chain management! We're excited to have you join our platform.
      
      What you can do with FreightFlow:
      • Track shipments in real-time with blockchain transparency
      • Manage your supply chain with AI-powered insights
      • Generate smart contracts for automated payments
      • Access comprehensive analytics and reporting
      • Connect with verified carriers and suppliers
      
      Get started: {{dashboardUrl}}
      
      If you have any questions, our support team is here to help at {{supportEmail}}.
      
      Best regards,
      The FreightFlow Team
      
      © {{currentYear}} FreightFlow. All rights reserved.
      Unsubscribe: {{unsubscribeUrl}} | Visit Website: {{websiteUrl}}
    `,
    variables: ["name", "dashboardUrl", "supportEmail", "unsubscribeUrl", "websiteUrl", "currentYear"],
    category: EmailCategory.WELCOME,
    priority: EmailPriority.HIGH,
  },

  {
    name: "email-verification",
    subject: "Verify your FreightFlow email address",
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h1>
          
          <p>Hi {{name}},</p>
          
          <p>Please click the button below to verify your email address and complete your FreightFlow account setup.</p>
          
          <div style="margin: 30px 0;">
            <a href="{{verificationUrl}}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email Address</a>
          </div>
          
          <p style="color: #666; font-size: 14px;">This verification link will expire in {{expirationHours}} hours.</p>
          
          <p style="color: #666; font-size: 14px;">If you didn't create a FreightFlow account, you can safely ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 12px; word-break: break-all;">{{verificationUrl}}</p>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Verify Your Email Address
      
      Hi {{name}},
      
      Please click the link below to verify your email address and complete your FreightFlow account setup.
      
      Verification Link: {{verificationUrl}}
      
      This verification link will expire in {{expirationHours}} hours.
      
      If you didn't create a FreightFlow account, you can safely ignore this email.
    `,
    variables: ["name", "verificationUrl", "expirationHours"],
    category: EmailCategory.EMAIL_VERIFICATION,
    priority: EmailPriority.HIGH,
  },

  // Shipment Templates
  {
    name: "shipment-created",
    subject: "Shipment {{trackingNumber}} has been created",
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shipment Created</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #e3f2fd; padding: 30px; border-radius: 10px;">
          <h1 style="color: #1976d2; margin-bottom: 20px;">📦 Shipment Created</h1>
          
          <p>Hello {{customerName}},</p>
          
          <p>Your shipment has been successfully created and is being prepared for pickup.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1976d2;">Shipment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Tracking Number:</td>
                <td style="padding: 8px 0;">{{trackingNumber}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Origin:</td>
                <td style="padding: 8px 0;">{{origin}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Destination:</td>
                <td style="padding: 8px 0;">{{destination}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Service Type:</td>
                <td style="padding: 8px 0;">{{serviceType}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Estimated Delivery:</td>
                <td style="padding: 8px 0;">{{formatDate estimatedDelivery "medium"}}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{trackingUrl}}" style="background: #1976d2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Track Shipment</a>
          </div>
          
          <p>You'll receive updates as your shipment progresses through our network.</p>
          
          <p>Best regards,<br>FreightFlow Logistics Team</p>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Shipment Created - {{trackingNumber}}
      
      Hello {{customerName}},
      
      Your shipment has been successfully created and is being prepared for pickup.
      
      Shipment Details:
      Tracking Number: {{trackingNumber}}
      Origin: {{origin}}
      Destination: {{destination}}
      Service Type: {{serviceType}}
      Estimated Delivery: {{formatDate estimatedDelivery "medium"}}
      
      Track your shipment: {{trackingUrl}}
      
      You'll receive updates as your shipment progresses through our network.
      
      Best regards,
      FreightFlow Logistics Team
    `,
    variables: [
      "customerName",
      "trackingNumber",
      "origin",
      "destination",
      "serviceType",
      "estimatedDelivery",
      "trackingUrl",
    ],
    category: EmailCategory.SHIPMENT_CREATED,
    priority: EmailPriority.NORMAL,
  },

  {
    name: "shipment-delivered",
    subject: "✅ Shipment {{trackingNumber}} has been delivered",
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shipment Delivered</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #e8f5e8; padding: 30px; border-radius: 10px;">
          <h1 style="color: #2e7d32; margin-bottom: 20px;">✅ Shipment Delivered!</h1>
          
          <p>Hello {{customerName}},</p>
          
          <p>Great news! Your shipment has been successfully delivered.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <h3 style="margin-top: 0; color: #2e7d32;">Delivery Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Tracking Number:</td>
                <td style="padding: 8px 0;">{{trackingNumber}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Delivered To:</td>
                <td style="padding: 8px 0;">{{deliveryAddress}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Delivery Date:</td>
                <td style="padding: 8px 0;">{{formatDate deliveredAt "full"}}</td>
              </tr>
              {{#if signedBy}}
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Signed By:</td>
                <td style="padding: 8px 0;">{{signedBy}}</td>
              </tr>
              {{/if}}
            </table>
          </div>
          
          {{#if proofOfDeliveryUrl}}
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{proofOfDeliveryUrl}}" style="background: #2e7d32; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Proof of Delivery</a>
          </div>
          {{/if}}
          
          <p>Thank you for choosing FreightFlow for your shipping needs!</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>Rate Your Experience:</strong> We'd love to hear about your shipping experience. 
              <a href="{{feedbackUrl}}" style="color: #2e7d32;">Leave feedback</a>
            </p>
          </div>
          
          <p>Best regards,<br>FreightFlow Logistics Team</p>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Shipment Delivered! - {{trackingNumber}}
      
      Hello {{customerName}},
      
      Great news! Your shipment has been successfully delivered.
      
      Delivery Details:
      Tracking Number: {{trackingNumber}}
      Delivered To: {{deliveryAddress}}
      Delivery Date: {{formatDate deliveredAt "full"}}
      {{#if signedBy}}Signed By: {{signedBy}}{{/if}}
      
      {{#if proofOfDeliveryUrl}}View Proof of Delivery: {{proofOfDeliveryUrl}}{{/if}}
      
      Thank you for choosing FreightFlow for your shipping needs!
      
      Rate Your Experience: {{feedbackUrl}}
      
      Best regards,
      FreightFlow Logistics Team
    `,
    variables: [
      "customerName",
      "trackingNumber",
      "deliveryAddress",
      "deliveredAt",
      "signedBy",
      "proofOfDeliveryUrl",
      "feedbackUrl",
    ],
    category: EmailCategory.SHIPMENT_DELIVERED,
    priority: EmailPriority.HIGH,
  },

  // Payment Templates
  {
    name: "payment-received",
    subject: "Payment received for invoice {{invoiceNumber}}",
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Received</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #e8f5e8; padding: 30px; border-radius: 10px;">
          <h1 style="color: #2e7d32; margin-bottom: 20px;">💳 Payment Received</h1>
          
          <p>Hello {{customerName}},</p>
          
          <p>We've successfully received your payment. Thank you!</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2e7d32;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Invoice Number:</td>
                <td style="padding: 8px 0;">{{invoiceNumber}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Amount Paid:</td>
                <td style="padding: 8px 0;">{{formatCurrency amount currency}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Payment Method:</td>
                <td style="padding: 8px 0;">{{paymentMethod}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Transaction ID:</td>
                <td style="padding: 8px 0;">{{transactionId}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Payment Date:</td>
                <td style="padding: 8px 0;">{{formatDate paymentDate "full"}}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{receiptUrl}}" style="background: #2e7d32; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Download Receipt</a>
          </div>
          
          <p>Your account has been updated and any associated services will continue without interruption.</p>
          
          <p>Best regards,<br>FreightFlow Billing Team</p>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Payment Received - Invoice {{invoiceNumber}}
      
      Hello {{customerName}},
      
      We've successfully received your payment. Thank you!
      
      Payment Details:
      Invoice Number: {{invoiceNumber}}
      Amount Paid: {{formatCurrency amount currency}}
      Payment Method: {{paymentMethod}}
      Transaction ID: {{transactionId}}
      Payment Date: {{formatDate paymentDate "full"}}
      
      Download Receipt: {{receiptUrl}}
      
      Your account has been updated and any associated services will continue without interruption.
      
      Best regards,
      FreightFlow Billing Team
    `,
    variables: [
      "customerName",
      "invoiceNumber",
      "amount",
      "currency",
      "paymentMethod",
      "transactionId",
      "paymentDate",
      "receiptUrl",
    ],
    category: EmailCategory.PAYMENT_RECEIVED,
    priority: EmailPriority.NORMAL,
  },

  // Web3/Blockchain Templates
  {
    name: "transaction-confirmed",
    subject: "🔗 Blockchain transaction confirmed",
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transaction Confirmed</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white;">
          <h1 style="margin-bottom: 20px;">🔗 Transaction Confirmed</h1>
          
          <p>Hello {{userName}},</p>
          
          <p>Your blockchain transaction has been successfully confirmed on the network.</p>
          
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Transaction Details</h3>
            <table style="width: 100%; border-collapse: collapse; color: white;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Transaction Hash:</td>
                <td style="padding: 8px 0; word-break: break-all; font-family: monospace;">{{transactionHash}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Block Number:</td>
                <td style="padding: 8px 0;">{{blockNumber}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Network:</td>
                <td style="padding: 8px 0;">{{network}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Gas Used:</td>
                <td style="padding: 8px 0;">{{gasUsed}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Confirmations:</td>
                <td style="padding: 8px 0;">{{confirmations}}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{explorerUrl}}" style="background: white; color: #667eea; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View on Block Explorer</a>
          </div>
          
          <p>Your transaction is now permanently recorded on the blockchain and cannot be reversed.</p>
          
          <p>Best regards,<br>FreightFlow Blockchain Team</p>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Blockchain Transaction Confirmed
      
      Hello {{userName}},
      
      Your blockchain transaction has been successfully confirmed on the network.
      
      Transaction Details:
      Transaction Hash: {{transactionHash}}
      Block Number: {{blockNumber}}
      Network: {{network}}
      Gas Used: {{gasUsed}}
      Confirmations: {{confirmations}}
      
      View on Block Explorer: {{explorerUrl}}
      
      Your transaction is now permanently recorded on the blockchain and cannot be reversed.
      
      Best regards,
      FreightFlow Blockchain Team
    `,
    variables: ["userName", "transactionHash", "blockNumber", "network", "gasUsed", "confirmations", "explorerUrl"],
    category: EmailCategory.TRANSACTION_CONFIRMED,
    priority: EmailPriority.NORMAL,
  },
]
